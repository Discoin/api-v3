import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { getRepository } from "typeorm";
import { SignedInBot } from "types/bot";
import { Currency } from "src/currencies/currency.entity";
import { Transaction } from "./transaction.entity";

@Injectable()
export class ConversionCheckGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: {
      body?: Transaction;
      user?: SignedInBot;
    } = context.switchToHttp().getRequest();
    const signedInBot = req.user;
    const { body } = req;
    const currencies = getRepository(Currency);

    if (!signedInBot) {
      throw new UnauthorizedException();
    }

    if (body) {
      const toCurrency = await currencies.findOne(body.toId);
      if (body.toId === signedInBot.currency.id) {
        throw new BadRequestException(
          `You can not convert ${signedInBot.currency.id} to ${body.toId} because they are the same`
        );
      } else if (!toCurrency) {
        throw new BadRequestException(`Currency ${body.toId} does not exist`);
      } else if (
        (body.amount * signedInBot.currency.value) / toCurrency.value >=
        toCurrency.reserve
      ) {
        throw new ForbiddenException(
          `You are not allowed to exhaust the reserve of ${body.toId}`
        );
      } else {
        return true;
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/quotes
      throw new BadRequestException("You didn't provide a request body");
    }
  }
}
