import 'sqreen';
import * as Sentry from '@sentry/node';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  release: `discoin@${process.env.npm_package_version ?? '0.0.0-development'}`,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Discoin')
    .setDescription('Discoin API docs')
    .setVersion('3.1')
    .addTag('transactions', 'Transactions that have been made on Discoin')
    .addTag('bots', 'Bots that are participating on Discoin')
    .addTag('currencies', 'Currencies available on Discoin')
    .setLicense('Apache License, Version 2.0', 'https://www.apache.org/licenses/LICENSE-2.0')
    .setContact('Jonah Snider', 'https://jonah.pw', 'jonah@jonah.pw')
    .addBearerAuth({ bearerFormat: 'token', type: 'http', description: 'Token required to update or create transactions', scheme: 'bearer' })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}

bootstrap();
