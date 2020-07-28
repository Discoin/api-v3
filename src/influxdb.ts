import { ISchemaOptions } from 'influx';
import * as Influx from 'influx';

/** InfluxDB measurement IDs. */
export enum Measurements {
  Currency = 'currency',
}

/** InfluxDB measurement IDs. */
export enum Tags {
  CurrencyId = 'currency_id',
}

export const schema: ISchemaOptions[] = [
  {
    measurement: Measurements.Currency,
    fields: {
      reserve: Influx.FieldType.FLOAT,
      value: Influx.FieldType.FLOAT,
    },
    tags: [Tags.CurrencyId],
  },
];
