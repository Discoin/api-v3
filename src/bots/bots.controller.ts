import {Controller} from '@nestjs/common';
import {Crud, BaseRouteName} from '@nestjsx/crud';
import {ApiTags} from '@nestjs/swagger';
import {Entities} from 'src/util/constants';
import {Bot} from './bot.entity';
import {BotsService} from './bots.service';

@Crud({
	model: {
		type: Bot
	},
	query: {
		exclude: ['token'],
		join: {
			currency: {
				eager: true
			}
		}
	},
	routes: {
		only: ['getManyBase', 'getOneBase'] as BaseRouteName[]
	},
	params: {
		id: {
			field: 'id',
			type: 'string',
			primary: true
		}
	}
})
@Controller(Entities.BOTS)
@ApiTags(Entities.BOTS)
export class BotsController {
	constructor(public service: BotsService) {}
}
