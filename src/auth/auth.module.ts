import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {BotsModule} from '../bots/bots.module';
import {AuthService} from './auth.service';
import {BearerStrategy} from './bearer.strategy';
import {TransactionRecipientGuard} from './transaction-recipient.guard';

@Module({
	imports: [BotsModule, PassportModule],
	providers: [AuthService, BearerStrategy, TransactionRecipientGuard],
	exports: [PassportModule, AuthService, TransactionRecipientGuard]
})
export class AuthModule {}
