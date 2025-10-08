import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageServiceSupabase } from './storage.service.supabase';
import { StorageServiceLocal } from './storage.service.local';
import { STORAGE_TYPE } from '@app/utils/environments';

@Module({
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
  controllers: [StorageController],
  exports: ['StorageService'],
})
export class StorageModule {}
