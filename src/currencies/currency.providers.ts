import {Connection} from 'typeorm';
import {TypeORM} from 'src/util/constants';
import {Currency} from './currency.entity';

export const transactionProviders = [
	{
		provide: TypeORM.TRANSACTION_REPOSITORY,
		useFactory: (connection: Connection) => connection.getRepository(Currency),
		inject: [TypeORM.DATABASE_CONNECTION]
	}
];
