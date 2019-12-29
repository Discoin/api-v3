import {MigrationInterface, QueryRunner} from 'typeorm';

export class CurrencyValueTypeChange1577606626735 implements MigrationInterface {
	async up(queryRunner: QueryRunner): Promise<any> {
		return await queryRunner.query(`ALTER TABLE "currencies" ALTER COLUMN "value" TYPE NUMERIC`);
	}

	async down(queryRunner: QueryRunner): Promise<any> {
		return await queryRunner.query(`ALTER TABLE "currencies" ALTER COLUMN "value" TYPE DOUBLE PRECISION`);
	}
}
