import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Bot} from './bot.entity';
import {BotsService} from './bots.service';
import {BotsController} from './bots.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Bot])],
	exports: [BotsService],
	providers: [BotsService],
	controllers: [BotsController]
})
export class BotsModule {}
