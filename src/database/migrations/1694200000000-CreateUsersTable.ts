import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1694200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('owner', 'admin', 'customer');
      CREATE TYPE auth_provider_enum AS ENUM ('local', 'google', 'facebook', 'instagram', 'apple');

      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR(100) UNIQUE NOT NULL,
        "firstName" VARCHAR(100) NOT NULL,
        "lastName" VARCHAR(100) NOT NULL,
        "password" VARCHAR NULL,
        "authProvider" auth_provider_enum NOT NULL DEFAULT 'local',
        "providerId" VARCHAR NULL,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "users";
      DROP TYPE user_role_enum;
      DROP TYPE auth_provider_enum;
    `);
  }
}
