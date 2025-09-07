import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1694100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "products" (
                "id" SERIAL PRIMARY KEY,
                "name" TEXT NOT NULL,
                "price" INTEGER NOT NULL,
                "description" TEXT,
                "image" TEXT,
                "category" TEXT,
                "material" TEXT,
                "style" TEXT,
                "color" TEXT,
                "dimensions" TEXT,
                "weight" INTEGER,
                "inStock" BOOLEAN,
                "rating" NUMERIC,
                "reviewCount" INTEGER,
                "featured" BOOLEAN,
                "created_at" TIMESTAMPTZ DEFAULT now(),
                "updated_at" TIMESTAMPTZ DEFAULT now()
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "products"
        `);
  }
}
