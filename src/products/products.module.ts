import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductVariationsService } from './products.service';
import { ProductImagesController } from './product-images.controller';
import { ProductImagesService } from './product-images.service';
import { ProductTemplatesController } from './controllers/product-templates.controller';
import { ProductTemplatesService } from './services/product-templates.service';
import { ProductPriceTiersController } from './controllers/product-price-tiers.controller';
import { ProductPriceTiersService } from './services/product-price-tiers.service';
import { ProductTemplate } from './entities/product-template.entity';
import { ProductVariation } from './entities/product-variation.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductPriceTier } from './entities/product-price-tier.entity';
import { Category } from '../categories/entities/category.entity';
import { StorageModule } from '@app/storage/storage.module';
import { CacheModule } from '@app/cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductTemplate,
      ProductVariation,
      ProductImage,
      ProductPriceTier,
      Category,
    ]),
    StorageModule,
    CacheModule,
  ],
  controllers: [
    ProductsController,
    ProductImagesController,
    ProductTemplatesController,
    ProductPriceTiersController,
  ],
  providers: [
    ProductVariationsService,
    ProductImagesService,
    ProductTemplatesService,
    ProductPriceTiersService,
  ],
  exports: [
    ProductVariationsService,
    ProductImagesService,
    ProductTemplatesService,
    ProductPriceTiersService,
  ],
})
export class ProductsModule {}
