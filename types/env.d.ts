declare namespace NodeJS {
	interface ProcessEnv {
		readonly NODE_ENV?: 'development' | 'production';

		readonly POSTGRES_HOST?: string;
		readonly POSTGRES_DB?: string;
		readonly POSTGRES_PORT?: string;
		readonly POSTGRES_USER?: string;
		readonly POSTGRES_PASSWORD?: string;
		readonly POSTGRES_SSL?: string;

		readonly SALT?: string;

		readonly DISCORD_WEBHOOK_ID?: string;
		readonly DISCORD_WEBHOOK_TOKEN?: string;
	}
}
