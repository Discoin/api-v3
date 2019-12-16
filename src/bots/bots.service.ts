import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {TypeOrmCrudService} from '@nestjsx/crud-typeorm';
import {Repository} from 'typeorm';
import {Bot} from './bot.entity';

@Injectable()
export class BotsService extends TypeOrmCrudService<Bot> {
	constructor(@InjectRepository(Bot) repo: Repository<Bot>) {
		super(repo);
	}
}
