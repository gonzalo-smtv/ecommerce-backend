import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductTemplateDto {
  @ApiProperty({
    description: 'Template name',
    example: 'Dining Table Template',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL-friendly identifier for the template',
    example: 'dining-table-template',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Template description',
    example:
      'Template for dining tables with standard measurements and materials',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Default specifications for products using this template',
    example: {
      material: 'Solid Wood',
      finish: 'Natural Oak',
      seats: '6-8 people',
      shape: 'Rectangular',
      length: '180cm',
      width: '90cm',
      height: '75cm',
    },
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Category ID this template belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Whether the template is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
