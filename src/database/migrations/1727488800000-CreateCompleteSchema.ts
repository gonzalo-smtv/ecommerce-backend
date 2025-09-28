import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompleteSchema1727488800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create ENUM types
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('owner', 'admin', 'customer');
      CREATE TYPE auth_provider_enum AS ENUM ('local', 'google', 'facebook', 'instagram', 'apple');
      CREATE TYPE order_status_enum AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');
    `);

    // Create users table
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

    // Create categories table
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

    // Create products table
    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" TEXT NOT NULL,
        "price" INTEGER NOT NULL,
        "description" TEXT,
        "dimensions" TEXT,
        "weight" INTEGER,
        "inStock" BOOLEAN,
        "rating" NUMERIC,
        "reviewCount" INTEGER,
        "featured" BOOLEAN,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Create product_images table
    await queryRunner.query(`
      CREATE TABLE "product_images" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "url" TEXT NOT NULL,
        "path" TEXT,
        "isMain" BOOLEAN NOT NULL DEFAULT false,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "altText" TEXT,
        "productId" UUID NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_product_images_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // Create product_categories junction table
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

    // Create attributes table
    await queryRunner.query(`
      CREATE TABLE "attributes" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) UNIQUE NOT NULL,
        "type" VARCHAR(50) NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Create attribute_values table
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
        CONSTRAINT "FK_attribute_values_attribute_id" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE
      )
    `);

    // Create product_attributes junction table
    await queryRunner.query(`
      CREATE TABLE "product_attributes" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "product_id" UUID NOT NULL,
        "attribute_value_id" UUID NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_product_attributes_product_attribute_value" UNIQUE ("product_id", "attribute_value_id"),
        CONSTRAINT "FK_product_attributes_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_product_attributes_attribute_value_id" FOREIGN KEY ("attribute_value_id") REFERENCES "attribute_values"("id") ON DELETE CASCADE
      )
    `);

    // Create carts table
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NULL,
        "sessionId" VARCHAR NULL,
        "totalItems" INTEGER NOT NULL DEFAULT 0,
        "totalPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_carts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create cart_items table
    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "cartId" UUID NOT NULL,
        "productId" UUID NOT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
        CONSTRAINT "FK_cart_items_cartId" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_productId" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);

    // Create orders table
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

    // Create order_items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" UUID NOT NULL,
        "title" VARCHAR NOT NULL,
        "quantity" INTEGER NOT NULL,
        "unitPrice" DECIMAL(10,2) NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_order_items_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    // Create order_payment_details table
    await queryRunner.query(`
      CREATE TABLE "order_payment_details" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "orderId" UUID NOT NULL,
        "method" VARCHAR NOT NULL,
        "status" VARCHAR NOT NULL,
        "statusDetail" VARCHAR NOT NULL,
        "transactionId" VARCHAR NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_order_payment_details_orderId" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      -- Users indexes
      CREATE INDEX "IDX_users_email" ON "users" ("email");
      CREATE INDEX "IDX_users_role" ON "users" ("role");
      CREATE INDEX "IDX_users_authProvider" ON "users" ("authProvider");

      -- Categories indexes
      CREATE INDEX "IDX_categories_parent_id" ON "categories" ("parent_id");
      CREATE INDEX "IDX_categories_level" ON "categories" ("level");
      CREATE INDEX "IDX_categories_is_active" ON "categories" ("is_active");
      CREATE INDEX "IDX_categories_slug" ON "categories" ("slug");

      -- Products indexes
      CREATE INDEX "IDX_products_featured" ON "products" ("featured");
      CREATE INDEX "IDX_products_inStock" ON "products" ("inStock");

      -- Product categories indexes
      CREATE INDEX "IDX_product_categories_product_id" ON "product_categories" ("product_id");
      CREATE INDEX "IDX_product_categories_category_id" ON "product_categories" ("category_id");
      CREATE INDEX "IDX_product_categories_is_primary" ON "product_categories" ("is_primary");

      -- Attributes indexes
      CREATE INDEX "IDX_attributes_type" ON "attributes" ("type");
      CREATE INDEX "IDX_attributes_is_active" ON "attributes" ("is_active");

      -- Attribute values indexes
      CREATE INDEX "IDX_attribute_values_attribute_id" ON "attribute_values" ("attribute_id");
      CREATE INDEX "IDX_attribute_values_hex_color" ON "attribute_values" ("hex_color");
      CREATE INDEX "IDX_attribute_values_sort_order" ON "attribute_values" ("sort_order");
      CREATE INDEX "IDX_attribute_values_is_active" ON "attribute_values" ("is_active");

      -- Product attributes indexes
      CREATE INDEX "IDX_product_attributes_product_id" ON "product_attributes" ("product_id");
      CREATE INDEX "IDX_product_attributes_attribute_value_id" ON "product_attributes" ("attribute_value_id");

      -- Carts indexes
      CREATE INDEX "IDX_carts_userId" ON "carts" ("userId");
      CREATE INDEX "IDX_carts_sessionId" ON "carts" ("sessionId");

      -- Cart items indexes
      CREATE INDEX "IDX_cart_items_cartId" ON "cart_items" ("cartId");
      CREATE INDEX "IDX_cart_items_productId" ON "cart_items" ("productId");

      -- Orders indexes
      CREATE INDEX "IDX_orders_userId" ON "orders" ("userId");
      CREATE INDEX "IDX_orders_status" ON "orders" ("status");

      -- Order items indexes
      CREATE INDEX "IDX_order_items_orderId" ON "order_items" ("orderId");

      -- Order payment details indexes
      CREATE INDEX "IDX_order_payment_details_orderId" ON "order_payment_details" ("orderId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes in reverse order
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_email";
      DROP INDEX IF EXISTS "IDX_users_role";
      DROP INDEX IF EXISTS "IDX_users_authProvider";
      DROP INDEX IF EXISTS "IDX_categories_parent_id";
      DROP INDEX IF EXISTS "IDX_categories_level";
      DROP INDEX IF EXISTS "IDX_categories_is_active";
      DROP INDEX IF EXISTS "IDX_categories_slug";
      DROP INDEX IF EXISTS "IDX_products_featured";
      DROP INDEX IF EXISTS "IDX_products_inStock";
      DROP INDEX IF EXISTS "IDX_product_categories_product_id";
      DROP INDEX IF EXISTS "IDX_product_categories_category_id";
      DROP INDEX IF EXISTS "IDX_product_categories_is_primary";
      DROP INDEX IF EXISTS "IDX_attributes_type";
      DROP INDEX IF EXISTS "IDX_attributes_is_active";
      DROP INDEX IF EXISTS "IDX_attribute_values_attribute_id";
      DROP INDEX IF EXISTS "IDX_attribute_values_hex_color";
      DROP INDEX IF EXISTS "IDX_attribute_values_sort_order";
      DROP INDEX IF EXISTS "IDX_attribute_values_is_active";
      DROP INDEX IF EXISTS "IDX_product_attributes_product_id";
      DROP INDEX IF EXISTS "IDX_product_attributes_attribute_value_id";
      DROP INDEX IF EXISTS "IDX_carts_userId";
      DROP INDEX IF EXISTS "IDX_carts_sessionId";
      DROP INDEX IF EXISTS "IDX_cart_items_cartId";
      DROP INDEX IF EXISTS "IDX_cart_items_productId";
      DROP INDEX IF EXISTS "IDX_orders_userId";
      DROP INDEX IF EXISTS "IDX_orders_status";
      DROP INDEX IF EXISTS "IDX_order_items_orderId";
      DROP INDEX IF EXISTS "IDX_order_payment_details_orderId";
    `);

    // Drop tables in reverse dependency order
    await queryRunner.query(`
      DROP TABLE IF EXISTS "order_payment_details";
      DROP TABLE IF EXISTS "order_items";
      DROP TABLE IF EXISTS "orders";
      DROP TABLE IF EXISTS "cart_items";
      DROP TABLE IF EXISTS "carts";
      DROP TABLE IF EXISTS "product_attributes";
      DROP TABLE IF EXISTS "attribute_values";
      DROP TABLE IF EXISTS "attributes";
      DROP TABLE IF EXISTS "product_categories";
      DROP TABLE IF EXISTS "product_images";
      DROP TABLE IF EXISTS "products";
      DROP TABLE IF EXISTS "categories";
      DROP TABLE IF EXISTS "users";
    `);

    // Drop ENUM types
    await queryRunner.query(`
      DROP TYPE IF EXISTS order_status_enum;
      DROP TYPE IF EXISTS auth_provider_enum;
      DROP TYPE IF EXISTS user_role_enum;
    `);
  }
}
