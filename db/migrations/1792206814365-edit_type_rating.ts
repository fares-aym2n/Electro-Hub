import { MigrationInterface, QueryRunner } from 'typeorm';

export class EditTypeRating1792206814365 implements MigrationInterface {
  name = 'EditTypeRating1792206814365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "reviews"
    ALTER COLUMN "rating" TYPE numeric
    USING "rating"::numeric
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "CHK_1b5afea0550a0992b7cca3da6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP COLUMN "rating"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD "rating" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" ADD CONSTRAINT "CHK_1b5afea0550a0992b7cca3da6d" CHECK (((rating >= 1) AND (rating <= 5)))`,
    );
  }
}
