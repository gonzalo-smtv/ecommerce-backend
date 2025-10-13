import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { ImageController } from './image.controller';
import { StorageServiceSupabase } from './storage.service.supabase';
import { StorageServiceLocal } from './storage.service.local';
import { STORAGE_TYPE } from '@app/utils/environments';
import { CacheModule } from '@app/cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [
    {
      provide: 'StorageService',
      useFactory: () => {
        if (STORAGE_TYPE === 'SUPABASE') {
          return new StorageServiceSupabase();
        } else if (STORAGE_TYPE === 'LOCAL') {
          return new StorageServiceLocal();
        } else {
          throw new Error(`Unsupported STORAGE_TYPE: ${STORAGE_TYPE}`);
        }
      },
    },
  ],
  controllers: [StorageController, ImageController],
  exports: ['StorageService'],
})
export class StorageModule {}
