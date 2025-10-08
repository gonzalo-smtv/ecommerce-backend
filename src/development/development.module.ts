import { Module } from '@nestjs/common';
import { DevelopmentController } from './development.controller';
import { DatabaseService } from '../database/database.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [DevelopmentController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DevelopmentModule {}
