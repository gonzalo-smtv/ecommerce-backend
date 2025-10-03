import {
  Controller,
  Get,
  Post,
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
import { AddProductImagesDto } from './dto/product-image.dto';

@ApiTags('04 - Product-Images')
@Controller('product-variations/:variationId/images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all images for a product variation' })
  @ApiParam({
    name: 'variationId',
    type: 'string',
    description: 'ID of the product variation',
  })
  findAll(
    @Param('variationId', ParseUUIDPipe) variationId: string,
  ): Promise<ProductImage[]> {
    return this.productImagesService.findAllByVariationId(variationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product image' })
  @ApiParam({
    name: 'variationId',
    type: 'string',
    description: 'ID of the product variation',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the image' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ProductImage> {
    return this.productImagesService.findOne(id);
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Get the image file' })
  @ApiParam({
    name: 'variationId',
    type: 'string',
    description: 'ID of the product variation',
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
  @ApiOperation({ summary: 'Upload multiple images for a product variation' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'variationId',
    type: 'string',
    description: 'ID of the product variation',
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
    @Param('variationId', ParseUUIDPipe) variationId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() addImagesDto: AddProductImagesDto,
  ): Promise<ProductImage[]> {
    return this.productImagesService.create(
      variationId,
      files,
      addImagesDto.isMain,
      addImagesDto.altText,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product image' })
  @ApiParam({
    name: 'variationId',
    type: 'string',
    description: 'ID of the product variation',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID of the image' })
  async deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    await this.productImagesService.delete(id);
    return { success: true };
  }
}
