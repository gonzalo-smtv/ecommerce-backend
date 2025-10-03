import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { ProductImagesService } from './product-images.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('03 - Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productImagesService: ProductImagesService,
  ) {}

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Get('with-details')
  findAllWithDetails(): Promise<Product[]> {
    return this.productsService.findAllWithDetails();
  }

  @Get('with-attributes')
  findAllWithAttributes(): Promise<Product[]> {
    return this.productsService.findAllWithAttributes();
  }

  @Get('filter-by-attributes')
  findByAttributes(
    @Query('attributes') attributes: string,
  ): Promise<Product[]> {
    const attributeIds = attributes.split(',').filter((id) => id.trim());
    return this.productsService.findByAttributes(attributeIds);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Product> {
    return this.productsService.findById(id);
  }

  @Get(':id/image')
  @ApiOperation({ summary: 'Get the main image of a product' })
  async getProductImage(
    @Param('id') id: string,
    @Res() res: any,
  ): Promise<any> {
    const mainImage = await this.productImagesService
      .findAllByProductId(id)
      .then((images) => images.find((img) => img.isMain));

    if (!mainImage) {
      throw new NotFoundException('Main image not found for this product');
    }

    const imageBuffer = await this.productImagesService.getImageBuffer(
      mainImage.id,
    );
    if (!imageBuffer) {
      throw new NotFoundException('Image file not found');
    }

    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.send(imageBuffer);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new product with multiple images',
    description: `
    Creates a new product with the ability to upload multiple images.

    How to use:
    - Set Content-Type to "multipart/form-data"
    - Add all product fields as form fields (name, price, etc.)
    - Add images in a field named "files" (you can select multiple image files)
    - Maximum 10 images per request
    - Images will be automatically uploaded to Supabase storage
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Mesa de Comedor Rústica' },
        price: { type: 'number', example: 45000 },
        inStock: { type: 'boolean', example: true },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Product images (select multiple files)',
        },
      },
      required: ['name', 'price'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async create(
    @Body() productData: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<Product> {
    const product = await this.productsService.create(productData);

    if (files && files.length > 0) {
      await this.productImagesService.create(product.id, files);
    }

    return this.productsService.findById(product.id);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a product with optional new images' })
  @ApiBody({
    type: UpdateProductDto,
    description: 'Product data with optional file uploads',
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async update(
    @Param('id') id: string,
    @Body() productData: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<Product> {
    // First update the basic product data
    await this.productsService.update(id, productData);

    // If there are new images to add
    if (files && files.length > 0) {
      const replaceImages = productData.replaceImages === true;

      // If replacing images is specified, delete existing ones
      if (replaceImages) {
        // Get all existing images
        const existingImages =
          await this.productImagesService.findAllByProductId(id);

        // Delete each image
        for (const image of existingImages) {
          await this.productImagesService.delete(image.id);
        }
      }

      // Add the new images
      await this.productImagesService.create(id, files, !replaceImages);
    }

    // Return the updated product with its images
    return this.productsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product data (JSON only)' })
  @ApiBody({
    type: UpdateProductDto,
    description: 'Product data to update',
  })
  async updateJson(
    @Param('id') id: string,
    @Body() productData: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, productData);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.productsService.delete(id);
    return { success: true, message: 'Product deleted successfully' };
  }
}
