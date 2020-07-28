import { Injectable } from '@nestjs/common';
import { RequestBot } from 'types/express';
import { BotsService } from 'src/bots/bots.service';

@Injectable()
export class AuthService {
  constructor(private botsService: BotsService) {}

  async validateToken(token: string): Promise<RequestBot> {
    const bot = await this.botsService.findOne({
      where: { token },
    });

    if (bot) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { token: _token, ...result } = bot;
      return result;
    }

    return null;
  }
}
