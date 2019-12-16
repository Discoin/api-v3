import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-http-bearer';
import {SignedInBot} from 'types/bot';
import {AuthService} from './auth.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly _authService: AuthService) {
		super({passReqToCallback: true});
	}

	async validate(req: Record<string, unknown>, token: string): Promise<SignedInBot> {
		const bot = await this._authService.validateBot(token);

		if (!bot) {
			throw new UnauthorizedException();
		}

		return bot;
	}
}
