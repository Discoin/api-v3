import {join} from 'path';
import {config} from 'dotenv';
import {Environments} from './constants';

config({path: join(__dirname, '..', '..', '.env')});

export const port = process.env.PORT ?? 3000;

export const postgres = {
	DATABASE: process.env.POSTGRES_DATABASE_NAME,
	USER: process.env.POSTGRES_USER,
	PORT: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
	PASSWORD: process.env.POSTGRES_PASSWORD,
	HOST: process.env.POSTGRES_HOST
};

export const salt = process.env.SALT!;

export const environment = process.env.NODE_ENV ?? Environments.PROD;
