import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderAndOrderItemEntities31792170133263 implements MigrationInterface {
    name = 'AddOrderAndOrderItemEntities31792170133263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."orders_paymentstatus_enum" RENAME TO "orders_paymentstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" TYPE "public"."orders_paymentstatus_enum" USING "paymentStatus"::"text"::"public"."orders_paymentstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_paymentstatus_enum_old" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" TYPE "public"."orders_paymentstatus_enum_old" USING "paymentStatus"::"text"::"public"."orders_paymentstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_paymentstatus_enum_old" RENAME TO "orders_paymentstatus_enum"`);
    }

}
