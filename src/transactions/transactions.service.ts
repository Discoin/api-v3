import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {Transaction} from 'src/transactions/transaction.entity';
import {Repository} from 'typeorm';

@Injectable()
export class TransactionsService extends TypeOrmCrudService<Transaction> {
	constructor(@InjectRepository(Transaction) repo: Repository<Transaction>) {
		super(repo);
	}
}
