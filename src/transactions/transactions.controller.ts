import { Controller, ForbiddenException, Param, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateManyDto, Crud, CrudAuth, CrudController, CrudRequest, Override, ParsedBody, ParsedRequest, JoinOptions } from '@nestjsx/crud';
import { AuthGuard } from 'src/auth/auth.guard';
import { Bot } from 'src/bots/bot.entity';
import { BotsService } from 'src/bots/bots.service';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { Currency } from 'src/currencies/currency.entity';
import { Except, SetRequired } from 'type-fest';
import { RequestBot } from 'types/express';
import { Transaction } from './transaction.entity';
import { TransactionsService } from './transactions.service';
import { InfluxDbService } from 'nest-influxdb';
import { WebhookClient, MessageEmbed } from 'discord.js';

const webhook = new WebhookClient(process.env.DISCORD_WEBHOOK_ID, process.env.DISCORD_WEBHOOK_TOKEN);

/**
 * A transaction from the API
 */
interface APITransaction extends Except<Transaction, 'id' | 'to' | 'from' | 'payout'> {
  to: string;
  from: string;
}

interface HydratedAPITransaction extends Except<APITransaction, 'to' | 'from'> {
  to: Currency;
  from: Currency;
}

@Crud({
  model: { type: Transaction },
  query: {
    join: {
      from: { eager: true, allow: ['id', 'name'] as Array<keyof Currency> },
      'from.bot': { eager: true, allow: ['id', 'name'] as Array<keyof Bot>, alias: 'fromBot' },
      to: { eager: true, allow: ['id', 'name'] as Array<keyof Currency> },
      'to.bot': { eager: true, allow: ['id', 'name'] as Array<keyof Bot>, alias: 'toBot' },
    },
  },
  routes: {
    only: ['getManyBase', 'getOneBase', 'updateOneBase', 'createManyBase', 'createOneBase'],
  },
  validation: { forbidUnknownValues: true, skipUndefinedProperties: true, whitelist: true },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
})
@CrudAuth({
  property: 'user',
  persist: (bot: RequestBot) => bot,
})
@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController implements CrudController<Transaction> {
  constructor(
    public service: TransactionsService,
    private botsService: BotsService,
    private currenciesService: CurrenciesService,
    private influxService: InfluxDbService,
  ) {}

  get base(): CrudController<Transaction> {
    return this;
  }

  private async recordToInflux(transaction: Transaction): Promise<void> {
    this.service.recordTransactionToInflux(this.influxService.connection, {
      currencyId: transaction.to.id,
      // The math here is the same as the math below
      reserve: Number(transaction.to.reserve) - transaction.payout,
      value: Number(transaction.to.wid) / Number(transaction.to.reserve),
      timestamp: transaction.timestamp,
    });

    this.service.recordTransactionToInflux(this.influxService.connection, {
      currencyId: transaction.from.id,
      // The math here is the same as the math below
      reserve: Number(transaction.from.reserve) + transaction.amount,
      value: Number(transaction.from.wid) / Number(transaction.from.reserve),
      timestamp: transaction.timestamp,
    });
  }

  private async finishTransaction(transaction: Transaction): Promise<void> {
    await Promise.all([
      this.recordToInflux(transaction),
      webhook.send(
        new MessageEmbed({
          title: transaction.id,
          description: `${transaction.amount.toLocaleString()} ${transaction.from.id} ➡️ ${transaction.payout.toLocaleString()} ${transaction.to.id}`,
          url: `https://dash.discoin.zws.im/#/transactions/${encodeURIComponent(transaction.id)}/show`,
          color: 0x4caf50,
          timestamp: transaction.timestamp,
          author: { name: transaction.user },
          fields: [
            { name: 'From', value: `${transaction.from.id} - ${transaction.from.bot.name} ${transaction.from.name}` },
            { name: 'To', value: `${transaction.to.id} - ${transaction.to.bot.name} ${transaction.to.name}` },
          ],
        }),
      ),
    ]);
  }

  /**
   * Check if a bot is allowed to manage a currency.
   * For example, this disallows a bot from creating transactions for a currency that corresponds to a different bot.
   * @param bot Bot that might be a manager of the `currency`
   * @param currency Currency to check the manager for
   */
  throwIfBotNotManager(bot: SetRequired<Partial<Bot>, 'discord_id' | 'currencies'>, currency: Pick<Currency, 'id'>): void {
    if (!this.botsService.botManagesCurrency(bot, currency)) {
      throw new ForbiddenException(`Your bot does not have permission to manage the currency ${currency.id}`);
    }
  }

  /**
   * Convert currency IDs into `Currency` instances.
   * @param transaction The transaction that has incomplete currencies
   */
  async hydrateCurrencies(transaction: APITransaction): Promise<HydratedAPITransaction> {
    const to = await this.currenciesService.repo.findOne({ where: { id: transaction.to } });
    const from = await this.currenciesService.repo.findOne({ where: { id: transaction.from } });

    for (const [name, currency] of Object.entries({ [transaction.to]: to, [transaction.from]: from })) {
      if (!currency) {
        throw new UnprocessableEntityException(`The currency ${name} couldn't be found in the database `);
      }
    }

    return { ...transaction, to, from };
  }

  /**
   * This populates dynamic fields in the transaction.
   * Currently this is just the payout, which relies on the transaction amount and to/from currencies
   * @param transaction Transaction to use for populating
   */
  populateDynamicFields(transaction: SetRequired<Partial<Transaction>, 'amount' | 'from' | 'to'>): SetRequired<typeof transaction, 'payout'> {
    const payout = this.service.calculatePayout(transaction.amount, transaction.from, transaction.to);

    return { ...transaction, payout };
  }

  /**
   * Validate if the data in a transaction is correct.
   *
   * This is for if something passed the first validation (ex. checking that the `from` value is a `Currency`) but
   * now we need to do a check to make sure it follows Discoin's rules (ex. the currencies being converted must be different)
   * @param transaction Transaction to validate
   * @param authPersist The bot authenticating this request
   */
  async validate(transaction: APITransaction, authPersist: RequestBot): Promise<void> {
    if (transaction.to === transaction.from) {
      throw new UnprocessableEntityException('The from and to currencies must be different from one another');
    }

    this.throwIfBotNotManager(authPersist, { id: transaction.from });

    const bot = await this.botsService.repo
      .createQueryBuilder('bot')
      .leftJoinAndSelect('bot.currencies', 'botCurrencies')
      .where('botCurrencies.id = :id', { id: transaction.to })
      .getOne();

    if (bot) {
      const { token } = bot;

      if (token.startsWith('DISABLED_')) {
        throw new ForbiddenException(`The currency ${transaction.to} is disabled`);
      }
    } else {
      throw new UnprocessableEntityException('Unknown `to` currency');
    }
  }

  @Override()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  // You MUST keep the type of the @ParsedBody() argument as the Transaction class or else the class-validator decorators won't run
  // This is actually an APITransaction, but all of the validation logic is in the Transaction entity
  async createOne(@ParsedRequest() request: CrudRequest, @ParsedBody() _dto: Transaction): Promise<Transaction> {
    const dto: APITransaction = (_dto as unknown) as APITransaction;

    // Throw an error if something is wrong with the transaction
    await this.validate(dto, request.parsed.authPersist as RequestBot);

    const transaction = this.populateDynamicFields(await this.hydrateCurrencies(dto));

    this.finishTransaction(transaction as Transaction);

    return this.base.createOneBase(request, transaction as Transaction);
  }

  @Override()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async createMany(@ParsedRequest() request: CrudRequest, @ParsedBody() _dto: CreateManyDto<Transaction>): Promise<Transaction[]> {
    const dto: CreateManyDto<APITransaction> = (_dto as unknown) as CreateManyDto<APITransaction>;

    const transactions = await Promise.all(
      dto.bulk.map(async (transaction) => {
        // Throw an error if something is wrong with the transaction
        await this.validate(transaction, request.parsed.authPersist as RequestBot);

        return this.populateDynamicFields(await this.hydrateCurrencies(transaction));
      }),
    );

    transactions.forEach((transaction) => this.finishTransaction(transaction as Transaction));

    return this.base.createManyBase(request, { bulk: transactions as Transaction[] });
  }

  @Override()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  async updateOne(@ParsedRequest() request: CrudRequest, @ParsedBody() dto: Transaction, @Param('id') transactionId: string): Promise<Transaction> {
    // Since this is updating an existing transaction we have to fetch the information about it for access checking
    const transaction: Except<Transaction, 'from'> = await this.service.findOne({ where: { id: transactionId }, relations: ['to'] });

    // You should only be able to update a transaction if you are the receiver
    this.throwIfBotNotManager(request.parsed.authPersist as RequestBot, transaction.to);

    return this.base.updateOneBase(request, dto);
  }
}
