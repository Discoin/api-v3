import {Connection} from 'typeorm';
import {TypeORM} from 'src/util/constants';
import {Transaction} from './transaction.entity';

export const transactionProviders = [
	{
		provide: TypeORM.TRANSACTION_REPOSITORY,
		useFactory: (connection: Connection) => connection.getRepository(Transaction),
		inject: [TypeORM.DATABASE_CONNECTION]
	}
];
