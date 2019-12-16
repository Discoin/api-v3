import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {
	TerminusModule,
	TypeOrmHealthIndicator,
	DNSHealthIndicator,
	MemoryHealthIndicator,
	DiskHealthIndicator
} from '@nestjs/terminus';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthModule} from './auth/auth.module';
import {Bot} from './bots/bot.entity';
import {BotsModule} from './bots/bots.module';
import {Transaction} from './transactions/transaction.entity';
import {TransactionsModule} from './transactions/transactions.module';
import {CurrenciesModule} from './currencies/currencies.module';
import {postgres} from './util/config';
import {Currency} from './currencies/currency.entity';
import {TerminusOptionsService} from './health-checks/terminus-options.service';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			database: postgres.DATABASE,
			password: postgres.PASSWORD,
			host: postgres.HOST,
			username: postgres.USER,
			port: postgres.PORT,
			entities: [Currency, Bot, Transaction],
			ssl: true,
			synchronize: true
		}),
		TerminusModule.forRootAsync({
			useClass: TerminusOptionsService,
			inject: [DNSHealthIndicator, TypeOrmHealthIndicator, DiskHealthIndicator],
			useFactory: (dns: DNSHealthIndicator, db: TypeOrmHealthIndicator, disk: DiskHealthIndicator) =>
				new TerminusOptionsService(dns, db, new MemoryHealthIndicator(), disk).createTerminusOptions()
		}),
		AuthModule,
		CurrenciesModule,
		BotsModule,
		TransactionsModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
