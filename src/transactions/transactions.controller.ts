import {Controller, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {Crud} from '@nestjsx/crud';
import {Transaction} from 'src/transactions/transaction.entity';
import {TransactionsService} from 'src/transactions/transactions.service';
import {Entities} from 'src/util/constants';
import {TransactionOwnerGuard} from 'src/auth/transaction-owner.guard';
import {BotAPITokenInterceptor} from './bot-from-token.interceptor';
import {ConversionCheckGuard} from './conversion-check.guard';

const currencyJoinOptions = {
	eager: true,
	exclude: ['value', 'reserve']
};

@Crud({
	model: {
		type: Transaction
	},
	query: {
		exclude: ['_bot', 'fromId', 'toId'],
		join: {
			from: currencyJoinOptions,
			to: currencyJoinOptions
		}
	},
	// @ts-ignore
	routes: {
		only: ['createManyBase', 'createOneBase', 'getManyBase', 'getOneBase', 'updateOneBase'],
		createManyBase: {
			decorators: [UseGuards(AuthGuard('bearer'), ConversionCheckGuard)],
			interceptors: [BotAPITokenInterceptor]
		},
		createOneBase: {
			decorators: [UseGuards(AuthGuard('bearer'), ConversionCheckGuard)],
			interceptors: [BotAPITokenInterceptor]
		},
		updateOneBase: {
			decorators: [UseGuards(AuthGuard('bearer'), TransactionOwnerGuard)],
			interceptors: [BotAPITokenInterceptor]
		}
	},
	params: {
		id: {
			field: 'id',
			type: 'uuid',
			primary: true
		}
	}
})
@Controller(Entities.TRANSACTIONS)
@ApiTags(Entities.TRANSACTIONS)
// This will mark all endpoints as auth required, even though only C, U, & D operations require auth
@ApiBearerAuth()
export class TransactionsController {
	constructor(public service: TransactionsService) {}
}
