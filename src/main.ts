import {NestFactory} from '@nestjs/core';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {ValidationPipe} from '@nestjs/common';
import {AppModule} from './app.module';
import {port, sentryDSN} from './util/config';
import {Entities} from './util/constants';

async function bootstrap(): Promise<void> {
	if (sentryDSN) {
		const Sentry = await import('@sentry/node');
		Sentry.init({dsn: sentryDSN});
	}

	const app = await NestFactory.create(AppModule);

	// Enable CORS headers
	app.enableCors();

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true
		})
	);

	const options = new DocumentBuilder()
		.setTitle('Discoin')
		.setDescription('The new API for Discoin')
		.setVersion('3.0')
		.setLicense('Apache License, Version 2.0', 'https://www.apache.org/licenses/LICENSE-2.0')
		.addTag(Entities.TRANSACTIONS, 'Discoin transactions')
		.addTag(Entities.BOTS, 'Discoin participating bots')
		.addTag(Entities.CURRENCIES, 'Currencies from different bots that are available on Discoin')
		.setContact('Jonah Snider', 'https://jonah.pw', 'jonah@jonah.pw')
		.addBearerAuth({type: 'apiKey', name: 'access_token', in: 'body'})
		.addBearerAuth({type: 'apiKey', name: 'access_token', in: 'query'})
		.addBearerAuth({type: 'http', in: 'header'})
		.build();

	const document = SwaggerModule.createDocument(app, options);
	SwaggerModule.setup('docs', app, document);

	await app.listen(port);
}

bootstrap();
