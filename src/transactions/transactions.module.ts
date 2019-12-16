import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TransactionsController} from 'src/transactions/transactions.controller';
import {TransactionsService} from 'src/transactions/transactions.service';
import {Transaction} from 'src/transactions/transaction.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Transaction])],
	providers: [TransactionsService],
	controllers: [TransactionsController]
})
export class TransactionsModule {}
