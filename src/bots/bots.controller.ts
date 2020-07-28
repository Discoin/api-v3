import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { Bot } from './bot.entity';
import { BotsService } from './bots.service';

@Crud({
  model: { type: Bot },
  query: { exclude: ['token'] as Array<keyof Bot>, join: { currencies: { eager: true } } },
  routes: { only: ['getManyBase', 'getOneBase'] },
  validation: { forbidUnknownValues: true },
  params: {
    id: {
      field: 'id',
      type: 'string',
      primary: true,
    },
  },
})
@ApiTags('bots')
@Controller('bots')
export class BotsController implements CrudController<Bot> {
  constructor(public service: BotsService) {}
}
