import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
  Min,
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
    description: 'Whether product is in stock',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;
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
}
