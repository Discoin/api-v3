import {ApiProperty} from '@nestjs/swagger';
import {CrudValidationGroups} from '@nestjsx/crud';
import {
	Equals,
	IsDefined,
	IsNotEmpty,
	IsNumber,
	IsNumberString,
	IsOptional,
	IsPositive,
	Length,
	Max
} from 'class-validator';
import {stripIndents} from 'common-tags';
import {Bot} from 'src/bots/bot.entity';
import {Currency} from 'src/currencies/currency.entity';
import {Entities} from 'src/util/constants';
import {BeforeInsert, Column, Entity, getRepository, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {SignedInBot} from 'types/bot';

const {CREATE, UPDATE} = CrudValidationGroups;

@Entity({name: Entities.TRANSACTIONS})
export class Transaction {
	/**
	 * The transaction ID.
	 * Not to be confused with the `user` ID, which is for Discord.
	 */
	@PrimaryGeneratedColumn('uuid')
	@ApiProperty({
		description: 'The transaction ID. Not to be confused with the `user` ID, which is for Discord.',
		readOnly: true,
		required: false,
		example: '67a8c07b-5591-4fe9-b63b-d13a84edab35'
	})
	id!: string;

	@Column({nullable: false, unique: false})
	fromId!: string;

	/** The bot currency that this transaction is converting from. */
	@ManyToOne(_type => Currency)
	@JoinColumn()
	@ApiProperty({
		description: 'The bot currency that this transaction is converting from.',
		readOnly: true,
		required: false
	})
	from!: Currency;

	/**
	 * Used internally to fetch the `fromId` from the database for the bot triggering the request.
	 */
	@IsNotEmpty()
	_bot?: SignedInBot;

	/**
	 * The ID of the currency this transaction is converting to.
	 */
	@Column({nullable: false, unique: false})
	@ApiProperty({
		description: 'The ID of the currency this transaction is converting to.',
		example: 'OAT',
		writeOnly: true
	})
	@IsDefined({groups: [CREATE]})
	toId!: string;

	/** The bot currency that this transaction is converting to. */
	@ManyToOne(_type => Currency)
	@JoinColumn()
	@ApiProperty({
		description: 'The bot currency that this transaction is converting to.',
		required: false,
		readOnly: true
	})
	to!: Currency;

	/** The amount in the `from` currency that this transcation is converting. */
	@Column()
	@ApiProperty({
		description: 'The amount in the `from` currency that this transcation is converting.',
		example: 1000
	})
	@IsDefined({groups: [CREATE]})
	@IsOptional({groups: [UPDATE]})
	@IsNumber({}, {always: true})
	@Max(Number.MAX_SAFE_INTEGER, {always: true})
	@IsPositive({always: true})
	amount!: number;

	/** The Discord user ID of the user who initiated the transaction. */
	@Column({length: 18})
	@ApiProperty({
		description: 'The Discord user ID of the user who initiated the transaction.',
		maxLength: 18,
		minLength: 18,
		example: '210024244766179329'
	})
	@IsDefined({groups: [CREATE]})
	@IsOptional({groups: [UPDATE]})
	@Length(18, 18, {always: true})
	@IsNumberString({always: true})
	user!: string;

	/**
	 * Whether or not this transaction was handled by the recipient bot.
	 * A transaction is handled when the recipient bot paid the respective user the correct amount in bot currency.
	 * Can only be updated by the recipient bot.
	 */
	@Column({default: false})
	@ApiProperty({
		description: stripIndents`Whether or not this transaction was handled by the recipient bot.
			A transaction is handled when the recipient bot paid the respective user the correct amount in bot currency.`,
		default: false,
		required: false
	})
	@IsOptional({groups: [CREATE]})
	@IsDefined({groups: [UPDATE]})
	@Equals(undefined, {groups: [CREATE]})
	handled!: boolean;

	/** Timestamp of when this transaction was initiated. */
	@Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
	@ApiProperty({
		description: 'Timestamp of when this transaction was initiated.',
		readOnly: true,
		required: false,
		type: 'string',
		example: '2019-12-09T12:28:50.231Z',
		default: 'CURRENT_TIMESTAMP'
	})
	timestamp!: Date;

	/** How much the receiving bot should payout to the user who initiated the transaction. */
	@Column({type: 'double precision'})
	@ApiProperty({
		readOnly: true,
		example: 500,
		description: 'How much the receiving bot should payout to the user who initiated the transaction.',
		required: false
	})
	payout!: number;

	@BeforeInsert()
	async populateDynamicColumns(): Promise<void> {
		const currencies = getRepository(Currency);

		if (this._bot) {
			const bot = await getRepository(Bot).findOne({where: {token: this._bot.token}});

			if (bot?.token) {
				this.fromId = bot.currency.id;

				// Decrease the `from` currency reserve
				currencies
					.createQueryBuilder()
					.update()
					.set({reserve: () => `reserve - ${this.amount}`})
					.where('id = :id', {id: this.fromId})
					.execute();

				// Market cap for the `from` currency before this transaction was started
				const marketCap = bot.currency.reserve * bot.currency.value;
				const newConversionRate = marketCap / (bot.currency.reserve - this.amount);
				const fromDiscoinValue = this.amount * newConversionRate;
				const toCurrency = await currencies.findOne(this.toId);

				if (toCurrency) {
					// This rounds the value to 2 decimal places
					this.payout = parseFloat((fromDiscoinValue * toCurrency.value).toFixed(2));

					// Increase the `to` currency reserve
					currencies
						.createQueryBuilder()
						.update()
						// Remember to convert the `from` currency to the `from` currency amount
						.set({reserve: () => `reserve + ${(this.amount * bot.currency.value) / toCurrency.value}`})
						.where('id = :id', {id: this.toId})
						.execute();
				}
			}
		}
	}
}
