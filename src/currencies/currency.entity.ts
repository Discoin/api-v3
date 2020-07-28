import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Bot } from 'src/bots/bot.entity';

@Entity({ name: 'currencies' })
export class Currency {
  /**
   * The shortened currency ID.
   * @example 'OAT'
   */
  @PrimaryColumn({ unique: true, nullable: false })
  @ApiProperty({ example: 'OAT' })
  id: string;

  /** The bot that manages to this currency. */
  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (type) => Bot,
    (bot) => bot.currencies,
    { cascade: true },
  )
  bot: Bot;

  /**
   * The full currency name.
   * @example 'Oats'
   */
  @Column()
  @ApiProperty({ example: 'Oats' })
  name: string;

  /** The value in Discoin this currency is worth. */
  @Column({ type: 'double precision' })
  @ApiProperty({
    example: 0.1,
    exclusiveMinimum: true,
    minimum: 0,
  })
  value: number;

  /**
   * The reserve available of this currency.
   * @example '1000000'
   */
  @Column({ type: 'numeric' })
  @ApiProperty({
    example: '1000000',
    exclusiveMinimum: true,
    minimum: 0,
  })
  reserve: string;

  /**
   * The Worth in Discoin (WID) of this currency.
   * @example '4.5'
   */
  @Column({ type: 'numeric' })
  @ApiProperty({
    example: '4.5',
    exclusiveMinimum: true,
    minimum: 0,
  })
  wid: string;
}
