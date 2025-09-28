import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable1727400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(100) NOT NULL,
        "description" TEXT,
        "parent_id" UUID,
        "level" INTEGER NOT NULL DEFAULT 1,
        "image" VARCHAR(500),
        "icon" VARCHAR(100),
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "meta_title" VARCHAR(255),
        "meta_description" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
      )
    `);

    // Create product-categories relationship table
    await queryRunner.query(`
      CREATE TABLE "product_categories" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "product_id" UUID NOT NULL,
        "category_id" UUID NOT NULL,
        "is_primary" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_product_categories_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_categories_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_product_categories" UNIQUE ("product_id", "category_id")
      )
    `);

    // Create indexes to improve performance
    await queryRunner.query(`
      CREATE INDEX "IDX_categories_parent_id" ON "categories" ("parent_id");
      CREATE INDEX "IDX_categories_level" ON "categories" ("level");
      CREATE INDEX "IDX_categories_is_active" ON "categories" ("is_active");
      CREATE INDEX "IDX_categories_sort_order" ON "categories" ("sort_order");
      CREATE INDEX "IDX_product_categories_product" ON "product_categories" ("product_id");
      CREATE INDEX "IDX_product_categories_category" ON "product_categories" ("category_id");
      CREATE INDEX "IDX_product_categories_primary" ON "product_categories" ("is_primary");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_product_categories_primary"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_product_categories_category"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_product_categories_product"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_sort_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_level"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_categories_parent_id"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "product_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
  }
}
