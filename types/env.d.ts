declare namespace NodeJS {
	interface ProcessEnv {
		readonly NODE_ENV?: 'development' | 'production';
		readonly POSTGRES_HOST?: string;
		readonly POSTGRES_DATABASE_NAME?: string;
		readonly POSTGRES_PORT?: string;
		readonly POSTGRES_USER?: string;
		readonly POSTGRES_PASSWORD?: string;

		readonly SALT?: string;
	}
}
