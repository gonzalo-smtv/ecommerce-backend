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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductPriceTiersService } from '../services/product-price-tiers.service';
import { CreateProductPriceTierDto } from '../dto/create-product-price-tier.dto';
import { UpdateProductPriceTierDto } from '../dto/update-product-price-tier.dto';

@ApiTags('Product Price Tiers')
@Controller('product-price-tiers')
export class ProductPriceTiersController {
  constructor(
    private readonly productPriceTiersService: ProductPriceTiersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all product price tiers',
    description: 'Retrieves all product price tiers',
  })
  @ApiResponse({
    status: 200,
    description: 'Product price tiers retrieved successfully',
  })
  findAll() {
    return this.productPriceTiersService.findAll();
  }

  @Get('price/:variationId')
  @ApiOperation({
    summary: 'Obtener precio para cantidad específica',
    description:
      'Calcula el precio unitario basado en la cantidad solicitada usando los tiers configurados',
  })
  @ApiParam({
    name: 'variationId',
    description: 'UUID de la variación de producto',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiQuery({
    name: 'quantity',
    description: 'Cantidad de productos para calcular el precio',
    example: 25,
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Precio calculado exitosamente',
    schema: {
      type: 'object',
      properties: {
        price: { type: 'number', example: 90.5 },
        quantity: { type: 'number', example: 25 },
      },
    },
  })
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

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo tier de precio',
    description:
      'Crea un nuevo rango de precio basado en cantidad para una variación de producto',
  })
  @ApiResponse({
    status: 201,
    description: 'Tier de precio creado exitosamente',
  })
  create(@Body() createProductPriceTierDto: CreateProductPriceTierDto) {
    return this.productPriceTiersService.create(createProductPriceTierDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a product price tier',
    description: 'Updates an existing product price tier',
  })
  @ApiParam({
    name: 'id',
    description: 'Product price tier ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Product price tier updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product price tier not found',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductPriceTierDto: UpdateProductPriceTierDto,
  ) {
    return this.productPriceTiersService.update(id, updateProductPriceTierDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a product price tier',
    description: 'Removes a product price tier',
  })
  @ApiParam({
    name: 'id',
    description: 'Product price tier ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Product price tier deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product price tier not found',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productPriceTiersService.remove(id);
  }
}
