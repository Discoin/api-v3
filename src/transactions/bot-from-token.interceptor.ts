import {Injectable, NestInterceptor, ExecutionContext, CallHandler} from '@nestjs/common';
import {Observable} from 'rxjs';
import {SignedInBot} from 'types/bot';

@Injectable()
export class BotAPITokenInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest();

		req.body._bot = req.user as SignedInBot;

		return next.handle();
	}
}
