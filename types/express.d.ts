import { Request } from 'express';
import { Bot } from 'src/bots/bot.entity';
import { Except } from 'type-fest';

export type RequestBot = Except<Bot, 'token'>;

export interface AuthedRequest extends Request {
  user: RequestBot;
}
