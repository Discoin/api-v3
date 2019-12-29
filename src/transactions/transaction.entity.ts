import {ApiProperty} from '@nestjs/swagger';
import {CrudValidationGroups} from '@nestjsx/crud';
import {
	IsBoolean,
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
	@IsOptional({groups: [UPDATE]})
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
	@Column({type: 'numeric'})
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
	@Column()
	@ApiProperty({
		description: 'The Discord user ID of the user who initiated the transaction.',
		maxLength: 22,
		minLength: 1,
		example: '210024244766179329'
	})
	@IsDefined({groups: [CREATE]})
	@IsOptional({groups: [UPDATE]})
	@Length(1, 22, {always: true})
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
			A transaction is handled when the recipient bot paid the respective user the correct amount in bot currency.
			Can only be updated by the recipient bot.`,
		default: false,
		required: false
	})
	@IsOptional({groups: [CREATE]})
	@IsDefined({groups: [UPDATE]})
	// This is broken for some reason and will trigger on PATCH requests as well
	// Temporarily fixed with {@TransactionUpdateGuard}
	// @Equals(undefined, {groups: [CREATE]})
	@IsBoolean()
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

				// Market cap for the `from` currency before this transaction was started
				const marketCapInDiscoin = bot.currency.reserve * bot.currency.value;
				const newConversionRate = marketCapInDiscoin / (bot.currency.reserve - this.amount);
				// The value of the `from` currency in Discoin
				const fromDiscoinValue = this.amount * newConversionRate;
				const toCurrency = await currencies.findOne(this.toId);

				// Increase the `from` currency reserve, decrease value
				currencies
					.createQueryBuilder()
					.update()
					// The transaction amount is already in the from currency so no need to convert
					.set({reserve: () => `reserve + ${this.amount}`, value: parseFloat(newConversionRate.toFixed(2))})
					.where('id = :id', {id: this.fromId})
					.execute();

				if (toCurrency) {
					// Payout should never be less than 0
					this.payout = Math.max(parseFloat((fromDiscoinValue / toCurrency.value).toFixed(2)), 0);

					// Remember to convert the `from` currency to the `from` currency amount
					const difference = (this.amount * bot.currency.value) / toCurrency.value;

					// Avoid making the reserve run out
					if (toCurrency.reserve - difference > 1) {
						// This rounds the value to 2 decimal places

						// To currency: new rate
						const newToRate = (toCurrency.reserve * toCurrency.value) / (toCurrency.reserve - difference);

						// Decrease the `to` currency reserve, increases value
						currencies
							.createQueryBuilder()
							.update()
							.set({reserve: () => `reserve - ${difference}`, value: parseFloat(newToRate.toFixed(2))})
							.where('id = :id', {id: this.toId})
							.execute();
					}
				}
			}
		}
	}
}
