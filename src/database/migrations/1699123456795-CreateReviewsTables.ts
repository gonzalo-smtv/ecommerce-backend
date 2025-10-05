import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewsTables1699123456795 implements MigrationInterface {
  name = 'CreateReviewsTables1699123456795';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create reviews table
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "productVariationId" uuid NOT NULL,
        "orderId" uuid,
        "title" varchar(200) NOT NULL,
        "content" text NOT NULL,
        "rating" smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
        "isVerifiedPurchase" boolean NOT NULL DEFAULT false,
        "status" varchar(20) NOT NULL DEFAULT 'pending',
        "helpfulVotes" integer NOT NULL DEFAULT 0,
        "reportCount" integer NOT NULL DEFAULT 0,
        "moderationReason" text,
        "moderatedBy" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_231ae565c273ee09aeebf9b6a07" PRIMARY KEY ("id")
      )
    `);

    // Create review_images table
    await queryRunner.query(`
      CREATE TABLE "review_images" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "reviewId" uuid NOT NULL,
        "imageUrl" varchar(500) NOT NULL,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_3e8b71e4d9c7b6b7b9c9f9e9b9c" PRIMARY KEY ("id")
      )
    `);

    // Create product_rating_summary table
    await queryRunner.query(`
      CREATE TABLE "product_rating_summary" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "productVariationId" uuid NOT NULL,
        "averageRating" decimal(3,2) NOT NULL DEFAULT 0.00,
        "totalReviews" integer NOT NULL DEFAULT 0,
        "ratingDistribution" jsonb NOT NULL DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}',
        "verifiedReviews" integer NOT NULL DEFAULT 0,
        "verifiedAverageRating" decimal(3,2) NOT NULL DEFAULT 0.00,
        "lastCalculated" timestamptz NOT NULL DEFAULT now(),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_4f8c82f6e0d8c7c8c0d0g0f0c0d" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for reviews table
    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_productVariationId" ON "reviews" ("productVariationId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_userId" ON "reviews" ("userId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_status" ON "reviews" ("status")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_createdAt" ON "reviews" ("created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_isVerifiedPurchase" ON "reviews" ("isVerifiedPurchase")
    `);

    // Create indexes for review_images table
    await queryRunner.query(`
      CREATE INDEX "IDX_review_images_reviewId" ON "review_images" ("reviewId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_review_images_sortOrder" ON "review_images" ("sortOrder")
    `);

    // Create indexes for product_rating_summary table
    await queryRunner.query(`
      CREATE INDEX "IDX_product_rating_summary_productVariationId" ON "product_rating_summary" ("productVariationId")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_product_rating_summary_averageRating" ON "product_rating_summary" ("averageRating")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_product_rating_summary_totalReviews" ON "product_rating_summary" ("totalReviews")
    `);

    // Create foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_productVariationId"
      FOREIGN KEY ("productVariationId") REFERENCES "product_variations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews" ADD CONSTRAINT "FK_reviews_orderId"
      FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "review_images" ADD CONSTRAINT "FK_review_images_reviewId"
      FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "product_rating_summary" ADD CONSTRAINT "FK_product_rating_summary_productVariationId"
      FOREIGN KEY ("productVariationId") REFERENCES "product_variations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create unique constraint to prevent duplicate reviews
    await queryRunner.query(`
      ALTER TABLE "reviews" ADD CONSTRAINT "UQ_reviews_user_product"
      UNIQUE ("userId", "productVariationId")
    `);

    // Create unique constraint for product rating summary
    await queryRunner.query(`
      ALTER TABLE "product_rating_summary" ADD CONSTRAINT "UQ_product_rating_summary_product"
      UNIQUE ("productVariationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "product_rating_summary" DROP CONSTRAINT "FK_product_rating_summary_productVariationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_images" DROP CONSTRAINT "FK_review_images_reviewId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_orderId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_productVariationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "FK_reviews_userId"`,
    );

    // Drop unique constraints
    await queryRunner.query(
      `ALTER TABLE "product_rating_summary" DROP CONSTRAINT "UQ_product_rating_summary_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reviews" DROP CONSTRAINT "UQ_reviews_user_product"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "IDX_product_rating_summary_totalReviews"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_product_rating_summary_averageRating"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_product_rating_summary_productVariationId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_review_images_sortOrder"`);
    await queryRunner.query(`DROP INDEX "IDX_review_images_reviewId"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_isVerifiedPurchase"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_status"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_reviews_productVariationId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "product_rating_summary"`);
    await queryRunner.query(`DROP TABLE "review_images"`);
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
