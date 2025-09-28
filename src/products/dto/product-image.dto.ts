import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductImageDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/images/products/product-123-main.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'File path on server',
    example: '/uploads/products/product-123-main.jpg',
  })
  path: string;

  @ApiProperty({
    description: 'Whether this is the main product image',
    example: true,
  })
  isMain: boolean;

  @ApiProperty({
    description: 'Sort order for image display',
    example: 1,
    minimum: 0,
  })
  sortOrder: number;

  @ApiPropertyOptional({
    description: 'Alt text for accessibility',
    example: 'Main product image showing front view',
  })
  altText?: string;
}

export class AddProductImagesDto {
  @ApiProperty({
    description: 'Product ID to add images to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description: 'Whether this should be the main product image',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({
    description: 'Alt text for the image',
    example: 'Product view from the side',
  })
  @IsOptional()
  @IsString()
  altText?: string;
}

export class UpdateProductImageDto {
  @ApiPropertyOptional({
    description: 'Whether this should be the main product image',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for image display',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Alt text for accessibility',
    example: 'Updated product description',
  })
  @IsOptional()
  @IsString()
  altText?: string;
}

export class DeleteProductImageDto {
  @ApiProperty({
    description: 'Image ID to delete',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  imageId: string;
}
