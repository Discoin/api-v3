import {Injectable, CanActivate, ExecutionContext, BadRequestException} from '@nestjs/common';
import {Transaction} from './transaction.entity';

/**
 * This is a bad, temporary solution since validation groups are broken.
 * The correct way to do this would be to verify that `req.body.handled === undefined` in `POST` requests.
 * However, the `CREATE` validation group is getting triggered in `PATCH` requests for some reason, causing all requests to fail.
 */
@Injectable()
export class TransactionUpdateGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req: {body?: Transaction; method: string} = context.switchToHttp().getRequest();
		const {body} = req;

		if (body) {
			if (body.handled !== undefined && req.method !== 'PATCH') {
				throw new BadRequestException('Marking a transaction as handled is only allowed in PATCH requests');
			} else {
				return true;
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/quotes
			throw new BadRequestException("You didn't provide a request body");
		}
	}
}
