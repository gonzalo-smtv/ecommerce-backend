import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Repository } from 'typeorm';

// Test database configuration
export const testDbConfig = {
  type: 'sqlite' as const,
  database: ':memory:',
  entities: ['src/**/*.entity.ts'],
  synchronize: true,
  dropSchema: true,
};

// Test module builder
export async function createTestModule(
  entities: any[] = [],
): Promise<TestingModule> {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
        load: [
          () => ({
            NODE_ENV: 'test',
            DB_HOST: 'localhost',
            DB_PORT: '5432',
            DB_USERNAME: 'test',
            DB_PASSWORD: 'test',
            DB_NAME: 'test_db',
            SUPABASE_URL: 'https://test.supabase.co',
            SUPABASE_ANON_KEY: 'test-key',
            MERCADOPAGO_ACCESS_TOKEN: 'test-token',
          }),
        ],
      }),
      TypeOrmModule.forRoot({
        ...testDbConfig,
        entities,
      }),
    ],
  }).compile();
}

// Mock repository factory
export function createMockRepository<T extends Record<string, any>>(): Partial<
  Repository<T>
> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getRawMany: jest.fn(),
      getRawOne: jest.fn(),
    })) as any,
  };
}

// Test database utilities
export function setupTestDatabase(module: TestingModule) {
  // Database is automatically set up with synchronize: true
  return module;
}

export function cleanupTestDatabase() {
  // For SQLite in-memory database, no cleanup needed as it resets automatically
  // For persistent test databases, you might want to clear all tables here
}
