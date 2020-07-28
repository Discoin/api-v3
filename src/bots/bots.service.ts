import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Currency } from 'src/currencies/currency.entity';
import { Repository } from 'typeorm';
import { Bot } from './bot.entity';

@Injectable()
export class BotsService extends TypeOrmCrudService<Bot> {
  constructor(@InjectRepository(Bot) public repo: Repository<Bot>) {
    super(repo);
  }

  /**
   * Check if a given bot is allowed to manage a currency.
   * This means they are allowed to create or update transactions to that currency.
   * @param bot Bot to check
   * @param currency Currency to compare
   * @returns `true` when `bot` is a manager of `currency`
   */
  botManagesCurrency(bot: Pick<Bot, 'discord_id' | 'currencies'>, currency: Pick<Currency, 'id'>): boolean {
    return bot.currencies.some((botCurrency) => botCurrency.id === currency.id);
  }
}
