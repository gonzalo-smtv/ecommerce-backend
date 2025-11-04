import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductVariationsService } from './products.service';
import { ProductImagesService } from './product-images.service';
import { ProductVariation } from './entities/product-variation.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductVariationsService,
    private readonly productImagesService: ProductImagesService,
  ) {}

  // ===== POST METHODS (Create Operations) =====

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new product with multiple images',
    description:
      'Creates a new product with the ability to upload multiple images.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sku: { type: 'string', example: 'MES-RUS-001' },
        name: { type: 'string', example: 'Mesa de Comedor Rústica' },
        price: { type: 'number', example: 45000 },
        attributes: {
          type: 'object',
          example: { color: 'red', size: 'M' },
          description: 'Product attributes as key-value pairs',
        },
        inStock: { type: 'boolean', example: true },
        template_id: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'Product template ID to associate with this product',
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'ProductVariation images (select multiple files)',
        },
      },
      required: ['sku', 'name', 'price'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async create(
    @Req() request: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ProductVariation> {
    // Parse form fields from multipart/form-data
    const productData: CreateProductDto = {
      sku: request.body.sku,
      name: request.body.name,
      price: parseFloat(request.body.price),
      attributes: request.body.attributes
        ? JSON.parse(request.body.attributes)
        : undefined,
      inStock: request.body.inStock === 'true',
      template_id: request.body.template_id,
    };

    const product = await this.productsService.create(productData);

    if (files && files.length > 0) {
      await this.productImagesService.create(product.id, files);
    }

    return this.productsService.findByIdWithDetails(product.id);
  }

  // ===== PATCH METHODS (Partial Update Operations) =====

  @Patch(':id')
  @ApiOperation({ summary: 'Update product data (JSON only)' })
  @ApiBody({
    type: UpdateProductDto,
    description: 'Product data to update',
  })
  async updateJson(
    @Param('id') id: string,
    @Body() productData: UpdateProductDto,
  ): Promise<ProductVariation> {
    return this.productsService.update(id, productData);
  }

  // ===== DELETE METHODS (Delete Operations) =====

  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.productsService.delete(id);
    return { success: true, message: 'ProductVariation deleted successfully' };
  }
}
