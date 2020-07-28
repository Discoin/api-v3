import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
  controllers: [CurrenciesController],
})
export class CurrenciesModule {}
