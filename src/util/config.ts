import {join} from 'path';
import {config} from 'dotenv';
import {Environments} from './constants';

config({path: join(__dirname, '..', '..', '.env')});

export const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 80;

/** PostgreSQL settings. */
export const postgres = {
	DATABASE: process.env.POSTGRES_DB,
	USER: process.env.POSTGRES_USER,
	PORT: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : undefined,
	PASSWORD: process.env.POSTGRES_PASSWORD,
	HOST: process.env.POSTGRES_HOST,
	/** Whether or not the PostgreSQL connection should use SSL. */
	SSL: Boolean(process.env.POSTGRES_SSL)
};

export const salt = process.env.SALT!;

export const environment = process.env.NODE_ENV ?? Environments.PROD;

/** The Discord webhook to use for notifications of transaction creations. */
export const discordWebhook = {
	/** Discord webhook ID. */
	id: process.env.DISCORD_WEBHOOK_ID,
	/** Discord webhook token. */
	token: process.env.DISCORD_WEBHOOK_TOKEN
};

/** DSN to use for Sentry error logging. */
export const sentryDSN = process.env.SENTRY_DSN;

/** InfluxDB connection settings */
export const influxDB = {
	username: process.env.INFLUX_DB_USERNAME ?? 'admin',
	password: process.env.INFLUX_DB_PASSWORD,
	database: 'discoin'
};
