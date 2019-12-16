import {Injectable} from '@nestjs/common';
import {BotsService} from 'src/bots/bots.service';
import {SignedInBot} from 'types/bot';

@Injectable()
export class AuthService {
	constructor(private readonly _botsService: BotsService) {}

	/**
	 * Validate a bot's authorization token.
	 *
	 * @param givenToken Token to authorize
	 * @returns Authorized bot with token property removed
	 */
	async validateBot(givenToken: string): Promise<SignedInBot | null> {
		const bot = await this._botsService.findOne({where: {token: givenToken}});

		if (bot?.token === givenToken) {
			return bot;
		}

		return null;
	}
}
