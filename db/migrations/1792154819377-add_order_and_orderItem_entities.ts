import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderAndOrderItemEntities1792154819377 implements MigrationInterface {
    name = 'AddOrderAndOrderItemEntities1792154819377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orderItems" ("id" SERIAL NOT NULL, "productName" character varying(150) NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(12,2) NOT NULL, "discount" integer NOT NULL, "orderId" integer, "productId" integer, CONSTRAINT "PK_b1b864ba2b7d5762d34265cc8b8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentmethod_enum" AS ENUM('card', 'cach')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "shippingAddress" character varying(50) NOT NULL, "totalPrice" numeric(12,2) NOT NULL, "paymentMethod" "public"."orders_paymentmethod_enum" NOT NULL DEFAULT 'card', "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orderItems" ADD CONSTRAINT "FK_391c9e5d5af8d7d7ce4b96db80e" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orderItems" ADD CONSTRAINT "FK_51d8fc35a95624166faeca65e86" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "orderItems" DROP CONSTRAINT "FK_51d8fc35a95624166faeca65e86"`);
        await queryRunner.query(`ALTER TABLE "orderItems" DROP CONSTRAINT "FK_391c9e5d5af8d7d7ce4b96db80e"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentmethod_enum"`);
        await queryRunner.query(`DROP TABLE "orderItems"`);
    }

}
