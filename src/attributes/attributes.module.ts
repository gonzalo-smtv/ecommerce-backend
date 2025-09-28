import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from './entities/attribute-value.entity';
import { ProductAttribute } from './entities/product-attribute.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attribute, AttributeValue, ProductAttribute]),
  ],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
