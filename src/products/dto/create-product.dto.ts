import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Mesa de Comedor Rústica',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product price',
    example: 99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Product description',
    example:
      'Hermosa mesa de comedor fabricada en madera maciza de roble con acabado rústico natural',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product category IDs (can be multiple)',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987e6543-e21c-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  categoryIds: string[];

  @ApiPropertyOptional({
    description: 'Product dimensions',
    example: '200cm x 90cm x 75cm',
  })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Product weight in grams',
    example: 45000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Whether product is in stock',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Product rating (0-5)',
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Number of reviews',
    example: 128,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @ApiPropertyOptional({
    description: 'Whether product is featured',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class CreateProductWithImagesDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Mesa de Comedor Rústica',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product price',
    example: 45000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Product description',
    example:
      'Hermosa mesa de comedor fabricada en madera maciza de roble con acabado rústico natural',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product category IDs (can be multiple)',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987e6543-e21c-12d3-a456-426614174001',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  categoryIds: string[];

  @ApiPropertyOptional({
    description: 'Product attribute value IDs (can be multiple)',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987e6543-e21c-12d3-a456-426614174001',
      '456e7890-e12c-34d5-a678-426614174002',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  attributeValueIds?: string[];

  @ApiPropertyOptional({
    description: 'Product dimensions',
    example: '200cm x 90cm x 75cm',
  })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Product weight in grams',
    example: 45000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Whether product is in stock',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Product rating (0-5)',
    example: 4.5,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Number of reviews',
    example: 25,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @ApiPropertyOptional({
    description: 'Whether product is featured',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Product images to upload (multipart/form-data)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    example: 'Select image files to upload',
  })
  @IsOptional()
  files?: any[];
}
