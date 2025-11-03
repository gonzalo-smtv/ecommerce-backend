import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit) - must be unique',
    example: 'MES-RUS-001',
  })
  @IsString()
  sku: string;

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
    description: 'Product attributes as key-value pairs',
    example: {
      color: 'red',
      size: 'M',
      material: 'cotton',
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether product is in stock',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({
    description: 'Product template ID to associate with this product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  template_id: string;
}

export class CreateProductWithImagesDto {
  @ApiProperty({
    description: 'Product SKU (Stock Keeping Unit) - must be unique',
    example: 'MES-RUS-001',
  })
  @IsString()
  sku: string;

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
    description: 'Product attributes as key-value pairs',
    example: {
      color: 'red',
      size: 'M',
      material: 'cotton',
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether product is in stock',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

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

  @ApiProperty({
    description: 'Product template ID to associate with this product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  template_id: string;
}
