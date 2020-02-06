import {Injectable, CanActivate, ExecutionContext, BadRequestException, ForbiddenException} from '@nestjs/common';
import {Transaction} from './transaction.entity';
import {Currency} from 'src/currencies/currency.entity';

/**
 * i don't speak nest
 */
@Injectable()
export class TransactionUpdateGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req: {body?: Transaction; method: string} = context.switchToHttp().getRequest();
		const {body} = req;
		const currencies = getRepository(Currency);
		const toCurrency = await currencies.findOne(body.toId);

		if (body) {
      if (!toCurrency) {
				throw new BadRequestException('Currency does not exist');
      }
			else if (body.amount * req.user.currency.value / toCurrency.value >= toCurrency.reserve) {
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
