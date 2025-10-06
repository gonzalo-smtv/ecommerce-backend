import { Module } from '@nestjs/common';
import { DevelopmentController } from './development.controller';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';

@Module({
  controllers: [DevelopmentController],
  providers: [DatabaseService, StorageService],
  exports: [DatabaseService, StorageService],
})
export class DevelopmentModule {}
