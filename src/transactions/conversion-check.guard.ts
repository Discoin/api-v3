import {Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException, ForbiddenException} from '@nestjs/common';
import {SignedInBot} from 'types/bot';
import {BotsService} from 'src/bots/bots.service';
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
		
		const toBot = await BotsService.findOne({where: {currencyId: body.toId}});

		if (body) {
			if (body.toId === signedInBot.currency.id) {
				throw new BadRequestException(`You can not convert ${signedInBot.currency.id} to ${body.toId} because they are the same`);
			} else if (toBot.token.startsWith("__")) (
				throw new ForbiddenException(`Destination bot disabled`);
			} else {
				return true;
			}
		} else {
			throw new BadRequestException("You didn't provide a request body");
		}
	}
}
