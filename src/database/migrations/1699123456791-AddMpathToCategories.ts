import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMpathToCategories1699123456791 implements MigrationInterface {
  name = 'AddMpathToCategories1699123456791';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the mpath column required for TypeORM's materialized path tree functionality
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "mpath" varchar DEFAULT ''
    `);

    // Create an index on the mpath column for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_mpath" ON "categories" ("mpath")`,
    );

    // Update existing root categories (those without parent_id) to have their mpath set to their id
    await queryRunner.query(`
      UPDATE "categories"
      SET "mpath" = "id"::varchar
      WHERE "parent_id" IS NULL
    `);

    // Update child categories to have their mpath built from their parent path + their own id
    // This needs to be done in a loop since PostgreSQL doesn't support recursive updates easily
    let updatedCount = 0;
    do {
      updatedCount = await queryRunner.query(`
        UPDATE "categories"
        SET "mpath" = parent.mpath || '.' || "categories"."id"::varchar
        FROM "categories" parent
        WHERE "categories"."parent_id" = parent."id"
        AND "categories"."mpath" = ''
      `);
    } while (updatedCount > 0);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the index first
    await queryRunner.query(`DROP INDEX "IDX_categories_mpath"`);

    // Remove the mpath column
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "mpath"`);
  }
}
