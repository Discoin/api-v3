import * as Influx from 'influx';
import {influxDB} from './config';

/** InfluxDB measurement IDs. */
export enum Measurements {
	CURRENCY = 'currency'
}

/** InfluxDB measurement IDs. */
export enum Tags {
	CURRENCY_ID = 'currency_id'
}

export const influx = new Influx.InfluxDB({
	host: 'influxdb',
	username: influxDB.username,
	database: influxDB.database,
	password: influxDB.password,
	schema: [
		{
			measurement: Measurements.CURRENCY,
			fields: {
				reserve: Influx.FieldType.FLOAT,
				value: Influx.FieldType.FLOAT
			},
			tags: [Tags.CURRENCY_ID]
		}
	]
});
