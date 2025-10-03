import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCategoriesAndProductColumns1730562335000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop product_categories table (junction table)
    await queryRunner.query(`DROP TABLE IF EXISTS "product_categories"`);

    // Drop categories table
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);

    // Drop indexes related to categories
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_categories_parent_id";
      DROP INDEX IF EXISTS "IDX_categories_level";
      DROP INDEX IF EXISTS "IDX_categories_is_active";
      DROP INDEX IF EXISTS "IDX_categories_slug";
      DROP INDEX IF EXISTS "IDX_product_categories_product_id";
      DROP INDEX IF EXISTS "IDX_product_categories_category_id";
      DROP INDEX IF EXISTS "IDX_product_categories_is_primary";
    `);

    // Drop columns from products table
    await queryRunner.query(`
      ALTER TABLE "products" DROP COLUMN IF EXISTS "description";
      ALTER TABLE "products" DROP COLUMN IF EXISTS "dimensions";
      ALTER TABLE "products" DROP COLUMN IF EXISTS "weight";
      ALTER TABLE "products" DROP COLUMN IF EXISTS "rating";
      ALTER TABLE "products" DROP COLUMN IF EXISTS "reviewCount";
      ALTER TABLE "products" DROP COLUMN IF EXISTS "featured";
    `);

    // Drop indexes related to dropped columns
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_products_featured";
      DROP INDEX IF EXISTS "IDX_products_inStock";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate indexes for products (reverse order)
    await queryRunner.query(`
      CREATE INDEX "IDX_products_inStock" ON "products" ("inStock");
      CREATE INDEX "IDX_products_featured" ON "products" ("featured");
    `);

    // Add back columns to products table
    await queryRunner.query(`
      ALTER TABLE "products" ADD COLUMN "description" TEXT;
      ALTER TABLE "products" ADD COLUMN "dimensions" TEXT;
      ALTER TABLE "products" ADD COLUMN "weight" INTEGER;
      ALTER TABLE "products" ADD COLUMN "rating" NUMERIC;
      ALTER TABLE "products" ADD COLUMN "reviewCount" INTEGER;
      ALTER TABLE "products" ADD COLUMN "featured" BOOLEAN;
    `);

    // Recreate categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(100) UNIQUE NOT NULL,
        "description" TEXT,
        "parent_id" UUID NULL,
        "level" INTEGER NOT NULL DEFAULT 1,
        "image" VARCHAR(500),
        "icon" VARCHAR(100),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "meta_title" VARCHAR(255),
        "meta_description" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_categories_parent_id" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE
      )
    `);

    // Recreate product_categories junction table
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "product_id" UUID NOT NULL,
        "category_id" UUID NOT NULL,
        "is_primary" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_product_categories_product_category" UNIQUE ("product_id", "category_id"),
        CONSTRAINT "FK_product_categories_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_categories_category_id" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
      )
    `);

    // Recreate indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_categories_parent_id" ON "categories" ("parent_id");
      CREATE INDEX "IDX_categories_level" ON "categories" ("level");
      CREATE INDEX "IDX_categories_is_active" ON "categories" ("is_active");
      CREATE INDEX "IDX_categories_slug" ON "categories" ("slug");
      CREATE INDEX "IDX_product_categories_product_id" ON "product_categories" ("product_id");
      CREATE INDEX "IDX_product_categories_category_id" ON "product_categories" ("category_id");
      CREATE INDEX "IDX_product_categories_is_primary" ON "product_categories" ("is_primary");
    `);
  }
}
