import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderAndOrderItemEntities21792165790719 implements MigrationInterface {
    name = 'AddOrderAndOrderItemEntities21792165790719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "fullName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "phoneNumber" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "city" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "country" character varying(100) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "paymentStatus" "public"."orders_paymentstatus_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "stripeSessionId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shippingAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shippingAddress" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."orders_paymentmethod_enum" RENAME TO "orders_paymentmethod_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentmethod_enum" AS ENUM('card', 'cash')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentMethod" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentMethod" TYPE "public"."orders_paymentmethod_enum" USING "paymentMethod"::"text"::"public"."orders_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentMethod" SET DEFAULT 'card'`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentmethod_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentmethod_enum_old" AS ENUM('card', 'cach')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentMethod" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentMethod" TYPE "public"."orders_paymentmethod_enum_old" USING "paymentMethod"::"text"::"public"."orders_paymentmethod_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentMethod" SET DEFAULT 'card'`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_paymentmethod_enum_old" RENAME TO "orders_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "shippingAddress"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "shippingAddress" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "stripeSessionId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentStatus"`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "fullName"`);
    }

}
