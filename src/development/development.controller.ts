import {
  Controller,
  Post,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { IStorageService } from '../storage/storage.interface';

@Controller('development')
export class DevelopmentController {
  private readonly logger = new Logger(DevelopmentController.name);

  constructor(
    private readonly databaseService: DatabaseService,
    @Inject('StorageService')
    private readonly storageService: IStorageService,
  ) {}

  /**
   * Clear all database data and storage files (development only)
   */
  @Post('clear-database')
  async clearDatabase() {
    // Basic protection - only allow in development
    const nodeEnv = process.env.NODE_ENV || 'development';
    if (nodeEnv === 'production') {
      throw new BadRequestException(
        'This endpoint is not available in production',
      );
    }
    this.logger.log('Clear database request received');

    try {
      // Clear all files from storage first
      const storageResult = await this.storageService.clearAllFiles();

      // Clear all database data
      const databaseResult = await this.databaseService.clearDatabase();

      this.logger.log('Database and storage cleared successfully');

      return {
        success: true,
        message: 'Database and storage cleared successfully',
        data: {
          ...databaseResult,
          ...storageResult,
        },
      };
    } catch (error) {
      this.logger.error('Error clearing database:', error);
      throw error;
    }
  }
}
