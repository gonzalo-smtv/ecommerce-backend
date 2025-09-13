import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTable1694488000000 implements MigrationInterface {
  name = 'CreateOrdersTable1694488000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for order status
    await queryRunner.query(`
      CREATE TYPE "public"."order_status_enum" AS ENUM (
        'pending',
        'processing',
        'completed',
        'cancelled',
        'refunded'
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "status" "public"."order_status_enum" NOT NULL DEFAULT 'pending',
        "totalAmount" decimal(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table
    await queryRunner.query(`DROP TABLE "orders"`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
  }
}
