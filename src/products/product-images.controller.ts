import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  Res,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductImagesService } from './product-images.service';
import { ProductImage } from './entities/product-image.entity';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiOperation,
} from '@nestjs/swagger';
import {
  UpdateProductImageDto,
  AddProductImagesDto,
} from './dto/product-image.dto';

@ApiTags('04 - Product-Images')
@Controller('products/:productId/images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all images for a product' })
  @ApiParam({
    name: 'productId',
    type: 'string',
    description: 'ID of the product',
  })
  findAll(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductImage[]> {
    return this.productImagesService.findAllByProductId(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product image' })
  @ApiParam({
    name: 'productId',
    type: 'string',
    description: 'ID of the product',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the image' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductImage> {
    return this.productImagesService.findOne(id);
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Get the image file' })
  @ApiParam({
    name: 'productId',
    type: 'string',
    description: 'ID of the product',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the image' })
  async getImageFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: any,
  ): Promise<any> {
    const imageBuffer = await this.productImagesService.getImageBuffer(id);
    if (!imageBuffer) {
      throw new NotFoundException('Image not found');
    }
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
    });
    return res.send(imageBuffer);
  }

  @Post()
  @ApiOperation({ summary: 'Upload multiple images for a product' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'productId',
    type: 'string',
    description: 'ID of the product',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        isMain: {
          type: 'boolean',
          description: 'Set as main product image',
        },
        altText: {
          type: 'string',
          description: 'Alternative text for the images',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // Maximum 10 images at a time
  uploadImages(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() addImagesDto: AddProductImagesDto,
  ): Promise<ProductImage[]> {
    return this.productImagesService.create(
      productId,
      files,
      addImagesDto.isMain,
      addImagesDto.altText,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update image details' })
  @ApiParam({
    name: 'productId',
    type: 'string',
    description: 'ID of the product',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the image' })
  updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateImageDto: UpdateProductImageDto,
  ): Promise<ProductImage> {
    return this.productImagesService.update(id, updateImageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product image' })
  @ApiParam({
    name: 'productId',
    type: 'string',
    description: 'ID of the product',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the image' })
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    await this.productImagesService.delete(id);
    return { success: true };
  }

  @Put(':id/set-main')
  @ApiOperation({ summary: 'Set an image as the main product image' })
  @ApiParam({
    name: 'productId',
    type: 'string',
    description: 'ID of the product',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the image' })
  setMainImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductImage> {
    return this.productImagesService.setMainImage(productId, id);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder product images' })
  @ApiParam({
    name: 'productId',
    type: 'string',
    description: 'ID of the product',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageIds: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Array of image IDs in the desired order',
        },
      },
    },
  })
  reorderImages(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() body: { imageIds: string[] },
  ): Promise<ProductImage[]> {
    return this.productImagesService.reorderImages(productId, body.imageIds);
  }
}
