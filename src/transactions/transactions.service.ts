import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InfluxDB, IPoint } from 'influx';
import { Currency } from 'src/currencies/currency.entity';
import { Measurements, Tags } from 'src/influxdb';
import { roundDecimals } from 'src/util';
import { SetRequired } from 'type-fest';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

type WIDCurrency = SetRequired<Partial<Currency>, 'wid' | 'reserve'>;

@Injectable()
export class TransactionsService extends TypeOrmCrudService<Transaction> {
  constructor(@InjectRepository(Transaction) public repo: Repository<Transaction>) {
    super(repo);
  }

  /**
   * Calculate the payout for a conversion between two currencies.
   * @param amount The quantity of the `from` currency being exchanged
   * @param from The currency that is being converted from
   * @param to The currency that is being converted to
   */
  calculatePayout(amount: number, from: WIDCurrency, to: WIDCurrency): number {
    const fromCurrencyReserve = parseFloat(from.reserve);
    const toCurrencyReserve = parseFloat(to.reserve);
    const toCapInDiscoin = parseFloat(to.wid);
    const fromCapInDiscoin = parseFloat(from.wid);

    const calculated = -(
      Math.exp(-((fromCapInDiscoin * (Math.log(fromCurrencyReserve + amount) - Math.log(fromCurrencyReserve))) / toCapInDiscoin)) * toCurrencyReserve -
      toCurrencyReserve
    );

    const rounded = roundDecimals(calculated, 2);

    // Payout should never be less than 0
    return Math.max(rounded, 0);
  }

  /**
   * Add a transaction measurement to InfluxDB.
   * @param influx The InfluxDB client to use
   * @param data The data to use to update InfluxDB with
   */
  async recordTransactionToInflux(
    influx: InfluxDB,
    data: { currencyId: string; reserve: number; value: number; timestamp: IPoint['timestamp'] },
  ): Promise<void> {
    return influx.writePoints([
      {
        measurement: Measurements.Currency,
        timestamp: data.timestamp,
        tags: { [Tags.CurrencyId]: data.currencyId },
        fields: { reserve: data.reserve, value: data.value },
      },
    ]);
  }
}
