import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PutCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Living Room',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL-friendly identifier for the category',
    example: 'living-room',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example:
      'Comfortable furniture for your living room including sofas, tables and entertainment centers',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID for nested categories',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/images/categories/living-room.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Category icon identifier',
    example: 'mdi:sofa',
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
    description: 'Sort order for category display',
    example: 1,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional({
    description: 'Category nesting level',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiPropertyOptional({
    description: 'Meta title for SEO',
    example: 'Living Room Furniture - Comfort and Style for Your Home',
  })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({
    description: 'Meta description for SEO',
    example:
      'Discover our collection of living room furniture including sofas, coffee tables, TV stands and more',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;
}
