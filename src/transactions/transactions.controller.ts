import {Controller, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {Crud, BaseRouteName} from '@nestjsx/crud';
import {Transaction} from 'src/transactions/transaction.entity';
import {TransactionsService} from 'src/transactions/transactions.service';
import {Entities} from 'src/util/constants';
import {TransactionRecipientGuard} from 'src/auth/transaction-recipient.guard';
import {BotAPITokenInterceptor} from './bot-from-token.interceptor';
import {ConversionCheckGuard} from './conversion-check.guard';
import {TransactionUpdateGuard} from './transaction-update.guard';

const currencyJoinOptions = {
	eager: true
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
	routes: {
		only: ['createManyBase', 'createOneBase', 'getManyBase', 'getOneBase', 'updateOneBase'] as BaseRouteName[],
		createManyBase: {
			decorators: [UseGuards(AuthGuard('bearer'), ConversionCheckGuard, TransactionUpdateGuard)],
			interceptors: [BotAPITokenInterceptor]
		},
		createOneBase: {
			decorators: [UseGuards(AuthGuard('bearer'), ConversionCheckGuard, TransactionUpdateGuard)],
			interceptors: [BotAPITokenInterceptor]
		},
		updateOneBase: {
			decorators: [UseGuards(AuthGuard('bearer'), TransactionRecipientGuard)],
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
