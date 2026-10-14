import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiscount1792010631397 implements MigrationInterface {
    name = 'AddDiscount1792010631397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "discount" numeric(3,0) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "discount"`);
    }

}
