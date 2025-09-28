import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttributesTables1727400000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create attribute types table
    await queryRunner.query(`
      CREATE TABLE "attributes" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        "type" VARCHAR(50) NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_attributes_name" UNIQUE ("name")
      )
    `);

    // Create attribute values table
    await queryRunner.query(`
      CREATE TABLE "attribute_values" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "attribute_id" UUID NOT NULL,
        "value" VARCHAR(255) NOT NULL,
        "hex_color" VARCHAR(7),
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_attribute_values_attribute" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_attribute_values" UNIQUE ("attribute_id", "value")
      )
    `);

    // Create product-attributes relationship table
    await queryRunner.query(`
      CREATE TABLE "product_attributes" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "product_id" UUID NOT NULL,
        "attribute_value_id" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_product_attributes_product" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_attributes_value" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_product_attributes" UNIQUE ("product_id", "attribute_value_id")
      )
    `);

    // Indexes to optimize queries
    await queryRunner.query(`
      CREATE INDEX "IDX_attributes_type" ON "attributes" ("type");
      CREATE INDEX "IDX_attributes_is_active" ON "attributes" ("is_active");
      CREATE INDEX "IDX_attribute_values_attribute" ON "attribute_values" ("attribute_id");
      CREATE INDEX "IDX_attribute_values_hex_color" ON "attribute_values" ("hex_color");
      CREATE INDEX "IDX_attribute_values_sort_order" ON "attribute_values" ("sort_order");
      CREATE INDEX "IDX_attribute_values_is_active" ON "attribute_values" ("is_active");
      CREATE INDEX "IDX_product_attributes_product" ON "product_attributes" ("product_id");
      CREATE INDEX "IDX_product_attributes_value" ON "product_attributes" ("attribute_value_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_product_attributes_value"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_product_attributes_product"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_attribute_values_is_active"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_attribute_values_sort_order"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_attribute_values_hex_color"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_attribute_values_attribute"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_attributes_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_attributes_type"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "product_attributes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attribute_values"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "attributes"`);
  }
}
