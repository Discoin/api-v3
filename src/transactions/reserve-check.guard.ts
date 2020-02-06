import {Injectable, CanActivate, ExecutionContext, BadRequestException, ForbiddenException} from '@nestjs/common';
import {Currency} from 'src/currencies/currency.entity';
import {getRepository} from 'typeorm';
import {Transaction} from './transaction.entity';

@Injectable()
export class TransactionUpdateGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req: {body?: Transaction; method: string} = context.switchToHttp().getRequest();
		const {body} = req;
		const currencies = getRepository(Currency);

		if (body) {
			const toCurrency = await currencies.findOne(body.toId);
			if (!toCurrency) {
				throw new BadRequestException('Currency does not exist');
			} else if (
				(parseFloat(body.amount) * req.user.currency.value) / toCurrency.value >=
				parseFloat(toCurrency.reserve)
			) {
				throw new ForbiddenException('Transaction payout exceeds reserve of destination currency');
			} else {
				return true;
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/quotes
			throw new BadRequestException("You didn't provide a request body");
		}
	}
}
