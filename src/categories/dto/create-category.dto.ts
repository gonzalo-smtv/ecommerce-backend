import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Electronics',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL-friendly identifier for the category',
    example: 'electronics',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Electronic devices and accessories',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID for subcategories',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({
    description: 'Category level in the hierarchy',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/images/electronics.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Category icon identifier',
    example: 'fas fa-laptop',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Whether the category is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional({
    description: 'Meta title for SEO',
    example: 'Electronics - Best Prices and Selection',
  })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({
    description: 'Meta description for SEO',
    example: 'Find the best electronic devices and accessories at great prices',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;
}
