import { Module } from '@nestjs/common';
import { BotsService } from './bots.service';
import { BotsController } from './bots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from './bot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bot])],
  providers: [BotsService],
  exports: [BotsService],
  controllers: [BotsController],
})
export class BotsModule {}
