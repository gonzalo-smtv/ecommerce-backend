import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { ProductPriceTiersService } from '../services/product-price-tiers.service';
import { CreateProductPriceTierDto } from '../dto/create-product-price-tier.dto';
import { UpdateProductPriceTierDto } from '../dto/update-product-price-tier.dto';

@Controller('product-price-tiers')
export class ProductPriceTiersController {
  constructor(
    private readonly productPriceTiersService: ProductPriceTiersService,
  ) {}

  @Post()
  create(@Body() createProductPriceTierDto: CreateProductPriceTierDto) {
    return this.productPriceTiersService.create(createProductPriceTierDto);
  }

  @Get()
  findAll() {
    return this.productPriceTiersService.findAll();
  }

  @Get('by-variation/:variationId')
  findByVariation(@Param('variationId', ParseUUIDPipe) variationId: string) {
    return this.productPriceTiersService.findByVariation(variationId);
  }

  @Get('price/:variationId')
  async getPriceForQuantity(
    @Param('variationId', ParseUUIDPipe) variationId: string,
    @Query('quantity') quantity: string,
  ) {
    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum < 1) {
      throw new BadRequestException('Quantity must be a positive number');
    }

    const price = await this.productPriceTiersService.getPriceForQuantity(
      variationId,
      quantityNum,
    );

    return { price, quantity: quantityNum };
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productPriceTiersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductPriceTierDto: UpdateProductPriceTierDto,
  ) {
    return this.productPriceTiersService.update(id, updateProductPriceTierDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productPriceTiersService.remove(id);
  }
}
