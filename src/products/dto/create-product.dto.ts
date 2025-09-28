import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Bluetooth Headphones',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Product price',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Product description',
    example:
      'High-quality wireless headphones with noise cancellation and 30-hour battery life',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  category: string;

  @ApiPropertyOptional({
    description: 'Product material',
    example: 'Plastic and metal',
  })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({
    description: 'Product style',
    example: 'Modern minimalist',
  })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiPropertyOptional({
    description: 'Product color',
    example: 'Black',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Product dimensions',
    example: '20cm x 15cm x 10cm',
  })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Product weight in grams',
    example: 250,
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
