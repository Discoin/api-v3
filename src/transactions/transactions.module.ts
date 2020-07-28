import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { BotsModule } from 'src/bots/bots.module';
import { Transaction } from './transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { InfluxDbModule } from 'nest-influxdb';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), AuthModule, BotsModule, CurrenciesModule, InfluxDbModule],
  providers: [TransactionsService],
  exports: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
