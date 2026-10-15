import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCartAndCartItemsEntity21792106022079 implements MigrationInterface {
    name = 'AddCartAndCartItemsEntity21792106022079'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP COLUMN "totalPrice"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" ADD "totalPrice" numeric NOT NULL`);
    }

}
