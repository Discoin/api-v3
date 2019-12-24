import {ApiProperty} from '@nestjs/swagger';
import {Entities} from 'src/util/constants';
import {Entity, PrimaryColumn, Column} from 'typeorm';
import {IsNumber, IsPositive, IsDefined} from 'class-validator';

@Entity({name: Entities.CURRENCIES})
export class Currency {
	/** The shortened currency ID. */
	@PrimaryColumn({unique: true, nullable: false})
	@IsDefined()
	@ApiProperty({
		description: 'The shortened currency ID.',
		example: 'OAT'
	})
	id!: string;

	/** The full currency name. */
	@Column()
	@IsDefined()
	@ApiProperty({
		description: 'The full currency name.',
		example: 'Oats'
	})
	name!: string;

	/** The value in Discoin this currency is worth. */
	@Column({type: 'double precision'})
	@IsDefined()
	@ApiProperty({
		description: 'The value in Discoin this currency is worth.',
		example: 0.1,
		exclusiveMinimum: true,
		minimum: 0
	})
	@IsNumber()
	@IsPositive()
	value!: number;

	/** The reserve available of this currency. */
	@Column({type: 'double precision'})
	@IsDefined()
	@ApiProperty({
		description: 'The reserve available of this currency.',
		example: 1000000,
		default: 1000000,
		exclusiveMinimum: true,
		minimum: 0
	})
	@IsNumber()
	@IsPositive()
	reserve!: number;
}
