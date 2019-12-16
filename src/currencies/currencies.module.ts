import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CurrenciesController} from './currencies.controller';
import {Currency} from './currency.entity';
import {CurrenciesService} from './currencies.service';

@Module({
	imports: [TypeOrmModule.forFeature([Currency])],
	providers: [CurrenciesService],
	controllers: [CurrenciesController]
})
export class CurrenciesModule {}
