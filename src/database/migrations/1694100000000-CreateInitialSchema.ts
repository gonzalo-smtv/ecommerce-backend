import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1694100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure we have the uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // First, create the necessary ENUM types
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('owner', 'admin', 'customer');
      CREATE TYPE auth_provider_enum AS ENUM ('local', 'google', 'facebook', 'instagram', 'apple');
      CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');
    `);

    // Create the products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
        "createdAt" TIMESTAMPTZ DEFAULT now(),
        "updatedAt" TIMESTAMPTZ DEFAULT now()
      )
    `);

    // Create the users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR(100) UNIQUE NOT NULL,
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        "password" VARCHAR NULL,
        "authProvider" auth_provider_enum NOT NULL DEFAULT 'local',
        "role" user_role_enum NOT NULL DEFAULT 'customer',
        "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
        "verificationToken" VARCHAR NULL,
        "resetPasswordToken" VARCHAR NULL,
        "resetPasswordExpires" TIMESTAMP NULL,
        "phoneNumber" VARCHAR NULL,
        "address" VARCHAR NULL,
        "city" VARCHAR NULL,
        "state" VARCHAR NULL,
        "zipCode" VARCHAR NULL,
        "country" VARCHAR NULL,
        "lastLogin" TIMESTAMP NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Create the carts table
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID,
        "sessionId" VARCHAR,
        "totalItems" INTEGER DEFAULT 0,
        "totalPrice" DECIMAL(10,2) DEFAULT 0,
        "createdAt" TIMESTAMPTZ DEFAULT now(),
        "updatedAt" TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT "FK_carts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create the cart items table
    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "cartId" UUID NOT NULL,
        "productId" UUID NOT NULL,
        "quantity" INTEGER DEFAULT 1,
        "price" DECIMAL(10,2) DEFAULT 0,
        CONSTRAINT "FK_cart_items_cartId" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // Create the orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID,
        "status" order_status_enum NOT NULL DEFAULT 'pending',
        "totalAmount" DECIMAL(10,2) NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_orders_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create the order items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" UUID NOT NULL,
        "title" VARCHAR NOT NULL,
        "quantity" INTEGER NOT NULL,
        "unitPrice" DECIMAL(10,2) NOT NULL,
        "productId" UUID,
        "createdAt" TIMESTAMPTZ DEFAULT now(),
        "updatedAt" TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT "FK_order_items_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL
      )
    `);

    // Create the order payment details table
    await queryRunner.query(`
      CREATE TABLE "order_payment_details" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" UUID NOT NULL,
        "paymentIntentId" VARCHAR,
        "paymentMethod" VARCHAR,
        "paymentStatus" VARCHAR,
        "amount" DECIMAL(10,2),
        "currency" VARCHAR DEFAULT 'USD',
        "receiptUrl" VARCHAR,
        "createdAt" TIMESTAMPTZ DEFAULT now(),
        "updatedAt" TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT "FK_order_payment_details_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    // Indexes to improve performance of common queries
    await queryRunner.query(`
      CREATE INDEX "IDX_orders_userId" ON "orders" ("userId");
      CREATE INDEX "IDX_order_items_orderId" ON "order_items" ("orderId");
      CREATE INDEX "IDX_order_payment_details_orderId" ON "order_payment_details" ("orderId");
      CREATE INDEX "IDX_cart_items_cartId" ON "cart_items" ("cartId");
      CREATE INDEX "IDX_cart_items_productId" ON "cart_items" ("productId");
      CREATE INDEX "IDX_carts_userId" ON "carts" ("userId");
      CREATE INDEX "IDX_carts_sessionId" ON "carts" ("sessionId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_orders_userId";
      DROP INDEX IF EXISTS "IDX_order_items_orderId";
      DROP INDEX IF EXISTS "IDX_order_payment_details_orderId";
      DROP INDEX IF EXISTS "IDX_cart_items_cartId";
      DROP INDEX IF EXISTS "IDX_cart_items_productId";
      DROP INDEX IF EXISTS "IDX_carts_userId";
      DROP INDEX IF EXISTS "IDX_carts_sessionId";
    `);

    // Drop tables in reverse order to avoid foreign key issues
    await queryRunner.query(`DROP TABLE IF EXISTS "order_payment_details"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cart_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "carts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);

    // Drop ENUM types
    await queryRunner.query(`
      DROP TYPE IF EXISTS order_status_enum;
      DROP TYPE IF EXISTS auth_provider_enum;
      DROP TYPE IF EXISTS user_role_enum;
    `);
  }
}
