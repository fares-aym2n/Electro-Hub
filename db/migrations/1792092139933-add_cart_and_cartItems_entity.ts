import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCartAndCartItemsEntity1792092139933 implements MigrationInterface {
    name = 'AddCartAndCartItemsEntity1792092139933'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cartItems" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "cartId" integer, "productId" integer, CONSTRAINT "UQ_d17973dde9222027894abba1ec5" UNIQUE ("cartId", "productId"), CONSTRAINT "PK_bb4f983020f59696f40ea04d6a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" SERIAL NOT NULL, "totalPrice" numeric NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_69828a178f152f157dcf2f70a8" UNIQUE ("userId"), CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cartItems" ADD CONSTRAINT "FK_7fac278e61eddd24a215e8bdf7c" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cartItems" ADD CONSTRAINT "FK_f2c97dd179feb55be1b354fb548" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`);
        await queryRunner.query(`ALTER TABLE "cartItems" DROP CONSTRAINT "FK_f2c97dd179feb55be1b354fb548"`);
        await queryRunner.query(`ALTER TABLE "cartItems" DROP CONSTRAINT "FK_7fac278e61eddd24a215e8bdf7c"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TABLE "cartItems"`);
    }

}
