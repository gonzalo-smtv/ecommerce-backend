import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductImagesTable1694700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove redundant image column from products table
    await queryRunner.query(`
      ALTER TABLE "products" DROP COLUMN IF EXISTS "image"
    `);

    // Create the new product images table
    await queryRunner.query(`
      CREATE TABLE "product_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" text NOT NULL,
        "path" text,
        "is_main" boolean NOT NULL DEFAULT false,
        "sort_order" integer NOT NULL DEFAULT 0,
        "alt_text" text,
        "product_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_product_images" PRIMARY KEY ("id"),
        CONSTRAINT "fk_product_images_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes to improve performance
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_product_id" ON "product_images" ("product_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_product_images_is_main" ON "product_images" ("is_main")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_product_images_is_main"`);
    await queryRunner.query(`DROP INDEX "idx_product_images_product_id"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "product_images"`);

    // Restore image column in products table
    await queryRunner.query(`
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "image" text NULL
    `);
  }
}
