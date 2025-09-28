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
    example: 'Mesas y Escritorios',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL-friendly identifier for the category',
    example: 'mesas-y-escritorios',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example:
      'Mesas de comedor, escritorio, de centro y auxiliares fabricadas en madera maciza',
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
    example: 'https://example.com/images/mesas-escritorios.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Category icon identifier',
    example: 'fas fa-table',
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
    example: 'Mesas y Escritorios de Madera - Ltec-Deco',
  })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({
    description: 'Meta description for SEO',
    example:
      'Descubre nuestra colección de mesas y escritorios de madera maciza con diseños únicos y acabados artesanales',
  })
  @IsOptional()
  @IsString()
  meta_description?: string;
}
