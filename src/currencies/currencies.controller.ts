import {Controller} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Crud} from '@nestjsx/crud';
import {Entities} from 'src/util/constants';
import {Currency} from './currency.entity';
import {CurrenciesService} from './currencies.service';

@Crud({
	model: {
		type: Currency
	},
	routes: {
		only: ['getManyBase', 'getOneBase']
	},
	params: {
		id: {
			field: 'id',
			type: 'string',
			primary: true
		}
	}
})
@Controller(Entities.CURRENCIES)
@ApiTags(Entities.CURRENCIES)
export class CurrenciesController {
	constructor(public service: CurrenciesService) {}
}
