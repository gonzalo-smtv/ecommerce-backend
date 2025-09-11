import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(':id/image')
  async getProductImage(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ): Promise<any> {
    const imageBuffer = await this.productsService.getProductImage(id);
    if (!imageBuffer) {
      throw new NotFoundException('Image not found');
    }
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.send(imageBuffer);
  }

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findById(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'number' },
        description: { type: 'string' },
        category: { type: 'string' },
        material: { type: 'string' },
        style: { type: 'string' },
        color: { type: 'string' },
        dimensions: { type: 'string' },
        weight: { type: 'number' },
        inStock: { type: 'boolean' },
        rating: { type: 'number' },
        reviewCount: { type: 'number' },
        featured: { type: 'boolean' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() productData: Partial<Product>,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    return this.productsService.create(productData, file);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'number' },
        description: { type: 'string' },
        category: { type: 'string' },
        material: { type: 'string' },
        style: { type: 'string' },
        color: { type: 'string' },
        dimensions: { type: 'string' },
        weight: { type: 'number' },
        inStock: { type: 'boolean' },
        rating: { type: 'number' },
        reviewCount: { type: 'number' },
        featured: { type: 'boolean' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() productData: Partial<Product>,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    return this.productsService.update(id, productData, file);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean; message: string }> {
    await this.productsService.delete(id);
    return { success: true, message: 'Product deleted successfully' };
  }
}
