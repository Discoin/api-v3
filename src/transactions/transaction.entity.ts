import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsBoolean, IsNumberString, IsPositive, IsString, Length, Max } from 'class-validator';
import { InfluxDbService } from 'nest-influxdb';
import { Currency } from 'src/currencies/currency.entity';
import { AfterInsert, Column, Entity, getRepository, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

const { CREATE, UPDATE } = CrudValidationGroups;

@Injectable()
@Entity({ name: 'transactions' })
export class Transaction {
  constructor(private influxService: InfluxDbService) {}

  /** Timestamp of when this transaction was initiated. */
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  /**
   * The transaction ID.
   * Not to be confused with the `user` ID, which is for Discord.
   * @example '67a8c07b-5591-4fe9-b63b-d13a84edab35'
   */
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    readOnly: true,
    required: false,
    example: '67a8c07b-5591-4fe9-b63b-d13a84edab35',
  })
  id?: string;

  /**
   * The Discord user ID of the user who initiated the transaction.
   * @example '210024244766179329'
   */
  @Column({ type: 'bigint' })
  @ApiProperty({
    maxLength: 22,
    minLength: 16,
    example: '210024244766179329',
  })
  @Length(16, 22, { groups: [CREATE] })
  @IsNumberString({ no_symbols: true }, { groups: [CREATE] })
  user: string;

  /** The bot currency that this transaction is converting from. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Currency)
  @ApiProperty({
    example: 'OAT',
  })
  @IsString({ groups: [CREATE] })
  from: Currency;

  /** The bot currency that this transaction is converting to. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Currency)
  @ApiProperty({ example: 'RBN' })
  @IsString({ groups: [CREATE] })
  to: Currency;

  /**
   * Whether or not this transaction was handled by the recipient bot.
   * A transaction is handled when the recipient bot paid the respective user the correct amount in bot currency.
   * Can only be updated by the recipient bot.
   * @example false
   */
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Column({ default: false })
  @ApiProperty({
    example: false,
  })
  @IsBoolean({ groups: [UPDATE] })
  handled: boolean = false;

  /**
   * How much the receiving bot should payout to the user who initiated the transaction.
   * @example 500.25
   */
  @Column({ type: 'double precision' })
  @ApiProperty({
    readOnly: true,
    example: 500.25,
    required: false,
  })
  payout?: number;

  /**
   * The amount in the `from` currency that this transcation is converting.
   * @example 1000
   */
  @Column({ type: 'double precision' })
  @ApiProperty({
    example: 1000,
    maximum: 1_000_000_000,
  })
  @Max(1_000_000_000, { groups: [CREATE] })
  @IsPositive({ groups: [CREATE] })
  amount: number;

  /**
   * Updates the reserve and rates of currencies involved in this transaction.
   */
  @AfterInsert()
  async afterInsert(): Promise<void> {
    if (this.payout === undefined) {
      throw new TypeError('Transaction `payout` was not defined');
    }

    /** Table for currencies. */
    const currencies = getRepository(Currency).createQueryBuilder();

    await Promise.all([
      // Update the reserve of the `from` currency
      currencies
        .update({ reserve: () => `reserve + ${this.amount}` })
        .where('id = :id', { id: this.from.id })
        .execute(),

      // Update the reserve of the `to` currency
      currencies
        .update({ reserve: () => `reserve - ${this.payout}` })
        .where('id = :id', { id: this.to.id })
        .execute(),
    ]);

    await Promise.all([
      // TODO: The update operation is the same for both here, the only thing changing is the value of `id`
      // Update the value of the `from` currency
      currencies
        .update({ value: () => `wid / reserve` })
        .where('id = :id', { id: this.from.id })
        .execute(),

      // Update the value of the `to` currency
      currencies
        .update({ value: () => `wid / reserve` })
        .where('id = :id', { id: this.to.id })
        .execute(),
    ]);
  }
}
