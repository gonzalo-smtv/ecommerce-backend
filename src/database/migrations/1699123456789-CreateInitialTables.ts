import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1699123456789 implements MigrationInterface {
  name = 'CreateInitialTables1699123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "email" varchar(100) NOT NULL,
        "firstName" varchar(100) NOT NULL,
        "lastName" varchar(100) NOT NULL,
        "password" varchar,
        "authProvider" varchar NOT NULL DEFAULT 'local',
        "role" varchar NOT NULL DEFAULT 'customer',
        "isEmailVerified" boolean NOT NULL DEFAULT false,
        "verificationToken" varchar,
        "resetPasswordToken" varchar,
        "resetPasswordExpires" TIMESTAMP,
        "phoneNumber" varchar,
        "address" varchar,
        "city" varchar,
        "state" varchar,
        "zipCode" varchar,
        "country" varchar,
        "lastLogin" TIMESTAMP,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "description" text,
        "parent_id" uuid,
        "level" int NOT NULL DEFAULT 1,
        "image" varchar(500),
        "icon" varchar(100),
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" int NOT NULL DEFAULT 0,
        "meta_title" varchar(255),
        "meta_description" text,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
      )
    `);

    // Create product_templates table
    await queryRunner.query(`
      CREATE TABLE "product_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "slug" varchar(100) NOT NULL,
        "description" text,
        "specifications" jsonb,
        "category_id" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_product_templates_slug" UNIQUE ("slug")
      )
    `);

    // Create product_variations table
    await queryRunner.query(`
      CREATE TABLE "product_variations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "template_id" uuid NOT NULL,
        "sku" varchar(100) NOT NULL,
        "name" varchar(255) NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "stock" int NOT NULL DEFAULT 0,
        "attributes" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "sort_order" int NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_product_variations_sku" UNIQUE ("sku")
      )
    `);

    // Create product_images table
    await queryRunner.query(`
      CREATE TABLE "product_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "url" text NOT NULL,
        "path" text,
        "isMain" boolean NOT NULL DEFAULT false,
        "sortOrder" int NOT NULL DEFAULT 0,
        "altText" text,
        "variation_id" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create carts table
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "userId" uuid,
        "sessionId" varchar,
        "totalItems" int NOT NULL DEFAULT 0,
        "totalPrice" decimal(10,2) NOT NULL DEFAULT 0,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cart_items table
    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "cartId" uuid NOT NULL,
        "productVariationId" uuid NOT NULL,
        "quantity" int NOT NULL DEFAULT 1,
        "price" decimal(10,2) NOT NULL DEFAULT 0
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "userId" uuid,
        "status" varchar NOT NULL DEFAULT 'pending',
        "totalAmount" decimal(10,2) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "orderId" uuid NOT NULL,
        "title" varchar NOT NULL,
        "quantity" int NOT NULL,
        "unitPrice" decimal(10,2) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_payment_details table
    await queryRunner.query(`
      CREATE TABLE "order_payment_details" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
        "method" varchar NOT NULL,
        "status" varchar NOT NULL,
        "statusDetail" varchar NOT NULL,
        "transactionId" varchar NOT NULL,
        "orderId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_parent_id" ON "categories" ("parent_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_level" ON "categories" ("level")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_is_active" ON "categories" ("is_active")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_slug" ON "categories" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_categories_sort_order" ON "categories" ("sort_order")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_product_templates_category_id" ON "product_templates" ("category_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_templates_is_active" ON "product_templates" ("is_active")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_templates_slug" ON "product_templates" ("slug")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_product_variations_template_id" ON "product_variations" ("template_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variations_sku" ON "product_variations" ("sku")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variations_price" ON "product_variations" ("price")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variations_attributes" ON "product_variations" ("attributes")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_product_variations_sort_order" ON "product_variations" ("sort_order")`,
    );

    // Create foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_parent"
      FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "product_templates" ADD CONSTRAINT "FK_product_templates_category"
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "product_variations" ADD CONSTRAINT "FK_product_variations_template"
      FOREIGN KEY ("template_id") REFERENCES "product_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "product_images" ADD CONSTRAINT "FK_product_images_variation"
      FOREIGN KEY ("variation_id") REFERENCES "product_variations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "carts" ADD CONSTRAINT "FK_carts_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_cart"
      FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_product_variation"
      FOREIGN KEY ("productVariationId") REFERENCES "product_variations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_order"
      FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_payment_details" ADD CONSTRAINT "FK_order_payment_details_order"
      FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(
      `ALTER TABLE "order_payment_details" DROP CONSTRAINT "FK_order_payment_details_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_product_variation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_cart"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_carts_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_images" DROP CONSTRAINT "FK_product_images_variation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variations" DROP CONSTRAINT "FK_product_variations_template"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_templates" DROP CONSTRAINT "FK_product_templates_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_parent"`,
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_product_variations_sort_order"`);
    await queryRunner.query(`DROP INDEX "IDX_product_variations_attributes"`);
    await queryRunner.query(`DROP INDEX "IDX_product_variations_price"`);
    await queryRunner.query(`DROP INDEX "IDX_product_variations_sku"`);
    await queryRunner.query(`DROP INDEX "IDX_product_variations_template_id"`);
    await queryRunner.query(`DROP INDEX "IDX_product_templates_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_product_templates_is_active"`);
    await queryRunner.query(`DROP INDEX "IDX_product_templates_category_id"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_sort_order"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_is_active"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_level"`);
    await queryRunner.query(`DROP INDEX "IDX_categories_parent_id"`);

    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE "order_payment_details"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TABLE "product_images"`);
    await queryRunner.query(`DROP TABLE "product_variations"`);
    await queryRunner.query(`DROP TABLE "product_templates"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
