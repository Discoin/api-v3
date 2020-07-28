import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Currency } from 'src/currencies/currency.entity';

/**
 * A participating bot on Discoin
 */
@Entity({ name: 'bots' })
export class Bot {
  /**
   * The Discord user ID of the bot.
   * @example '388191157869477888'
   */
  @PrimaryColumn({ unique: true, type: 'bigint' })
  @ApiProperty({ example: '388191157869477888' })
  discord_id: string;

  /**
   * The name of this bot.
   * @example 'Dice'
   */
  @Column()
  @ApiProperty({ example: 'Dice' })
  name: string;

  /** The currencies for this bot. */
  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (type) => Currency,
    (currency) => currency.bot,
    { eager: true },
  )
  currencies: Currency[];

  /**
   * The authorization token to update transactions from this bot.
   * @example 'dementia6vice8jaywalk4goal8satin2brusque8dreary7NAIADES3memo9trustful'
   */
  @Column({
    unique: true,
  })
  @ApiProperty({ readOnly: true })
  token: string;
}
