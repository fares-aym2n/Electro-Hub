import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWhitelistEntity1792021560523 implements MigrationInterface {
    name = 'AddWhitelistEntity1792021560523'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "whitelists" ("id" SERIAL NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_24989d47262051d48fccd80d11" UNIQUE ("userId"), CONSTRAINT "PK_589f49a4a4df5ce0852b18f5ab2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "whitelists_products_products" ("whitelistsId" integer NOT NULL, "productsId" integer NOT NULL, CONSTRAINT "PK_142cf4ca56b6b7c35607ecfb031" PRIMARY KEY ("whitelistsId", "productsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4266d7aa7f32194344814b4a6c" ON "whitelists_products_products"  ("whitelistsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_68208ded68fdf928a8d7c31a81" ON "whitelists_products_products"  ("productsId") `);
        await queryRunner.query(`ALTER TABLE "whitelists" ADD CONSTRAINT "FK_24989d47262051d48fccd80d11d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "whitelists_products_products" ADD CONSTRAINT "FK_4266d7aa7f32194344814b4a6cc" FOREIGN KEY ("whitelistsId") REFERENCES "whitelists"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "whitelists_products_products" ADD CONSTRAINT "FK_68208ded68fdf928a8d7c31a81f" FOREIGN KEY ("productsId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "whitelists_products_products" DROP CONSTRAINT "FK_68208ded68fdf928a8d7c31a81f"`);
        await queryRunner.query(`ALTER TABLE "whitelists_products_products" DROP CONSTRAINT "FK_4266d7aa7f32194344814b4a6cc"`);
        await queryRunner.query(`ALTER TABLE "whitelists" DROP CONSTRAINT "FK_24989d47262051d48fccd80d11d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_68208ded68fdf928a8d7c31a81"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4266d7aa7f32194344814b4a6c"`);
        await queryRunner.query(`DROP TABLE "whitelists_products_products"`);
        await queryRunner.query(`DROP TABLE "whitelists"`);
    }

}
