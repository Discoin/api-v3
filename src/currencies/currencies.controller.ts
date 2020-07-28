import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import { CurrenciesService } from './currencies.service';
import { Currency } from './currency.entity';

@Crud({
  model: { type: Currency },
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
@ApiTags('currencies')
@Controller('currencies')
export class CurrenciesController implements CrudController<Currency> {
  constructor(public service: CurrenciesService) {}
}
