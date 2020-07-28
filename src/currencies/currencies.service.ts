import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Currency } from './currency.entity';

@Injectable()
export class CurrenciesService extends TypeOrmCrudService<Currency> {
  constructor(@InjectRepository(Currency) public repo: Repository<Currency>) {
    super(repo);
  }
}
