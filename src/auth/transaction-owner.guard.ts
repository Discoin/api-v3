import {Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException} from '@nestjs/common';
import {SignedInBot} from 'types/bot';
import {getRepository} from 'typeorm';
import {Transaction} from 'src/transactions/transaction.entity';
import {Bot} from 'src/bots/bot.entity';
import {Validator} from 'class-validator';

const validator = new Validator();

@Injectable()
export class TransactionOwnerGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest();
		const signedInBot: SignedInBot | undefined = req.user;

		if (!signedInBot) {
			throw new UnauthorizedException();
		}

		if (!validator.isUUID(req.params.id, '4')) {
			throw new BadRequestException('Invalid UUID format');
		}

		const transaction = await getRepository(Transaction).findOne(req.params.id);

		if (transaction) {
			const transactionRecipient = await getRepository(Bot).findOne({where: {currency: {id: transaction.toId}}});

			const requestBotIsTransactionRecipient = transactionRecipient?.token === signedInBot.token;

			return requestBotIsTransactionRecipient;
		}

		return false;
	}
}
