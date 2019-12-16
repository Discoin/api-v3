import {Connection} from 'typeorm';
import {TypeORM} from 'src/util/constants';
import {Bot} from './bot.entity';

export const botProviders = [
	{
		provide: TypeORM.TRANSACTION_REPOSITORY,
		useFactory: (connection: Connection) => connection.getRepository(Bot),
		inject: [TypeORM.DATABASE_CONNECTION]
	}
];
