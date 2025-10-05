import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductVariationsService } from './products.service';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { ProductTemplatesController } from './controllers/product-templates.controller';
import { ProductTemplatesService } from './services/product-templates.service';
import { ProductTemplate } from './entities/product-template.entity';
import { ProductVariation } from './entities/product-variation.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from '../categories/entities/category.entity';
import { StorageModule } from '@app/storage/storage.module';
import { CacheModule } from '@app/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductTemplate,
      ProductVariation,
      ProductImage,
      Category,
    ]),
    StorageModule,
    CacheModule,
  ],
  controllers: [
    ProductsController,
    ProductImagesController,
    ProductTemplatesController,
  ],
  providers: [
    ProductVariationsService,
    ProductImagesService,
    ProductTemplatesService,
  ],
  exports: [
    ProductVariationsService,
    ProductImagesService,
    ProductTemplatesService,
  ],
})
export class ProductsModule {}
