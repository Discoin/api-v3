import {Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException} from '@nestjs/common';
import {SignedInBot} from 'types/bot';
import {Transaction} from './transaction.entity';

@Injectable()
export class ConversionCheckGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req: {body?: Transaction; user?: SignedInBot} = context.switchToHttp().getRequest();
		const signedInBot = req.user;
		const {body} = req;

		if (!signedInBot) {
			throw new UnauthorizedException();
		}

		if (body) {
			if (body.toId === signedInBot.currency.id) {
				throw new BadRequestException(`You can not convert ${signedInBot.currency.id} to ${body.toId} because they are the same`);
			} else {
				return true;
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/quotes
			throw new BadRequestException("You didn't provide a request body");
		}
	}
}
