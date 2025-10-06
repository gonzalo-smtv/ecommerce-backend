import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}

  /**
   * Clear all data from database tables in proper order
   */
  async clearDatabase(): Promise<{
    success: boolean;
    tablesCleared: number;
    recordsDeleted: number;
  }> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log('Starting database cleanup...');

      // Deletion order based on foreign key dependencies
      const deletionOrder = [
        'product_images',
        'cart_items',
        'order_items',
        'order_payment_details',
        'review_images',
        'product_price_tiers',
        'product_rating_summary',
        'product_variations',
        'carts',
        'orders',
        'reviews',
        'users',
        'categories',
        'product_templates',
      ];

      let totalRecordsDeleted = 0;
      let tablesCleared = 0;

      for (const tableName of deletionOrder) {
        try {
          const result = await queryRunner.query(`DELETE FROM "${tableName}"`);

          const recordsDeleted = result[1] || 0; // PostgreSQL returns count in second element
          totalRecordsDeleted += recordsDeleted;
          tablesCleared++;

          this.logger.log(
            `Cleared ${recordsDeleted} records from ${tableName}`,
          );
        } catch (error) {
          this.logger.error(`Error clearing table ${tableName}:`, error);
          // Continue with other tables even if one fails
        }
      }

      // Reset sequences for auto-increment columns
      await this.resetSequences(queryRunner);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Database cleanup completed. Cleared ${tablesCleared} tables, ${totalRecordsDeleted} total records`,
      );

      return {
        success: true,
        tablesCleared,
        recordsDeleted: totalRecordsDeleted,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Database cleanup failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reset all sequences to start from 1
   */
  private async resetSequences(queryRunner: any): Promise<void> {
    try {
      // Get all sequences
      const sequences = await queryRunner.query(`
        SELECT sequencename FROM pg_sequences
        WHERE schemaname = 'public'
      `);

      for (const seq of sequences) {
        await queryRunner.query(
          `ALTER SEQUENCE "${seq.sequencename}" RESTART WITH 1`,
        );
      }

      this.logger.log(`Reset ${sequences.length} sequences`);
    } catch (error) {
      this.logger.warn('Error resetting sequences:', error);
      // Don't throw error for sequence reset failures
    }
  }
}
