import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import {
  CreateAttributeDto,
  CreateAttributeValueDto,
} from './dto/create-attribute.dto';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('02 - Attributes')
@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  findAllAttributes() {
    return this.attributesService.findAllAttributes();
  }

  @Get('type/:type')
  getAttributesByType(@Param('type') type: string) {
    return this.attributesService.getAttributesByType(type);
  }

  @Get('colors')
  getColorAttributes() {
    return this.attributesService.getColorAttributes();
  }

  @Get(':id')
  findAttributeById(@Param('id') id: string) {
    return this.attributesService.findAttributeById(id);
  }

  @Post()
  createAttribute(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributesService.createAttribute(createAttributeDto);
  }

  @Get(':id/values')
  getAttributeValues(@Param('id') attributeId: string) {
    return this.attributesService.getAttributeValues(attributeId);
  }

  @Get('products/:productId/attributes')
  getProductAttributes(@Param('productId') productId: string) {
    return this.attributesService.getProductAttributes(productId);
  }

  @Post(':id/values')
  createAttributeValue(
    @Param('id') attributeId: string,
    @Body() createAttributeValueDto: CreateAttributeValueDto,
  ) {
    return this.attributesService.createAttributeValue(
      attributeId,
      createAttributeValueDto,
    );
  }

  @Post('products/:productId/attributes/:attributeValueId')
  assignAttributeToProduct(
    @Param('productId') productId: string,
    @Param('attributeValueId') attributeValueId: string,
  ) {
    return this.attributesService.assignAttributeToProduct(
      productId,
      attributeValueId,
    );
  }

  @Delete('products/:productId/attributes/:attributeValueId')
  removeAttributeFromProduct(
    @Param('productId') productId: string,
    @Param('attributeValueId') attributeValueId: string,
  ) {
    return this.attributesService.removeAttributeFromProduct(
      productId,
      attributeValueId,
    );
  }
}
