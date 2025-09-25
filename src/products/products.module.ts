import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { StorageModule } from '@app/storage/storage.module';
import { CacheModule } from '@app/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    StorageModule,
    CacheModule,
  ],
  controllers: [ProductsController, ProductImagesController],
  providers: [ProductsService, ProductImagesService],
  exports: [ProductsService, ProductImagesService],
})
export class ProductsModule {}
