import {Module} from '@nestjs/common';
import {PassportModule} from '@nestjs/passport';
import {BotsModule} from '../bots/bots.module';
import {AuthService} from './auth.service';
import {BearerStrategy} from './bearer.strategy';
import {TransactionOwnerGuard} from './transaction-owner.guard';

@Module({
	imports: [BotsModule, PassportModule],
	providers: [AuthService, BearerStrategy, TransactionOwnerGuard],
	exports: [PassportModule, AuthService, TransactionOwnerGuard]
})
export class AuthModule {}
