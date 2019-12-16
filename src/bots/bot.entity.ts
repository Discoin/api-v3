import {createHmac, randomBytes} from 'crypto';
import {ApiProperty} from '@nestjs/swagger';
import {Currency} from 'src/currencies/currency.entity';
import {salt} from 'src/util/config';
import {Entities} from 'src/util/constants';
import {BeforeInsert, Column, Entity, JoinColumn, OneToOne, PrimaryColumn} from 'typeorm';

@Entity({name: Entities.BOTS})
export class Bot {
	/**
	 * The Discord user ID of the bot.
	 */
	@PrimaryColumn({unique: true})
	@ApiProperty({
		description: 'The Discord user ID of the bot.',
		type: 'string',
		example: '388191157869477888'
	})
	id!: string;

	/** The currency code for this bot. */
	@OneToOne(_type => Currency, {eager: true})
	@JoinColumn()
	@ApiProperty({description: 'The currency code for this bot.'})
	currency!: Currency;

	/**
	 * The authorization token to issue transactions from this bot.
	 * Generated automatically as a SHA-256 hash.
	 */
	@Column({
		unique: true
	})
	token!: string;

	/**
	 * Generate the token for this bot.
	 */
	@BeforeInsert()
	addToken(): void {
		this.token = createHmac('sha256', salt)
			.update(randomBytes(128))
			.digest('hex');
	}
}
