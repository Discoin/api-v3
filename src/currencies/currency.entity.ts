import {ApiProperty} from '@nestjs/swagger';
import {Entities} from 'src/util/constants';
import {Entity, PrimaryColumn, Column} from 'typeorm';

@Entity({name: Entities.CURRENCIES})
export class Currency {
	/** The shortened currency ID. */
	@PrimaryColumn({unique: true, nullable: false})
	@ApiProperty({
		description: 'The shortened currency ID.',
		example: 'OAT'
	})
	id!: string;

	/** The full currency name. */
	@Column()
	@ApiProperty({
		description: 'The full currency name.',
		example: 'Oats'
	})
	name!: string;

	/** The value in Discoin this currency is worth. */
	@Column({type: 'double precision'})
	@ApiProperty({
		description: 'The value in Discoin this currency is worth.',
		example: 0.1,
		exclusiveMinimum: true,
		minimum: 0
	})
	value!: number;

	/** The reserve available of this currency. */
	@Column({type: 'numeric'})
	@ApiProperty({
		description: 'The reserve available of this currency.',
		example: 1000000,
		exclusiveMinimum: true,
		minimum: 0
	})
	reserve!: string;

	/** The Worth in Discoin of this currency */
	@Column({type: 'numeric'})
	@ApiProperty({
		description: 'The Worth in Discoin of this currency.',
		example: 10000000,
		exclusiveMinimum: true,
		minimum: 0
	})
	wid!: string;
}
