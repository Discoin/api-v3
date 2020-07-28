import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { InfluxDbModule, InfluxModuleOptions } from 'nest-influxdb';
import { join as joinPaths } from 'path';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { AuthModule } from './auth/auth.module';
import { BotsModule } from './bots/bots.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { HealthController } from './health/health.controller';
import { schema } from './influxdb';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: joinPaths(__dirname, '..', '.env'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
        type: configService.get('DATABASE_TYPE'),
        url: configService.get('DATABASE_URI'),
        synchronize: configService.get('DATABASE_SYNCHRONIZE', process.env.NODE_ENV === 'development'),
        logging: configService.get<LoggerOptions>('TYPEORM_LOGGING', true),
        entities: [joinPaths(__dirname, '**', '*.entity.{t,j}s')],
      }),
    }),
    InfluxDbModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<InfluxModuleOptions> => ({
        host: configService.get('INFLUXDB_HOST'),
        database: configService.get('INFLUXDB_DATABASE', 'discoin'),
        password: configService.get('INFLUXDB_PASSWORD'),
        username: configService.get('INFLUXDB_USERNAME'),
        schema,
      }),
    }),
    TerminusModule,
    TransactionsModule,
    BotsModule,
    CurrenciesModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
