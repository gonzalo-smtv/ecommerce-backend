import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttributeDto {
  @ApiProperty({
    description: 'Attribute name',
    example: 'Color',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Attribute type',
    enum: ['text', 'number', 'color', 'select', 'boolean'],
    example: 'color',
  })
  @IsString()
  @IsIn(['text', 'number', 'color', 'select', 'boolean'])
  type: string;

  @ApiPropertyOptional({
    description: 'Whether the attribute is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CreateAttributeValueDto {
  @ApiProperty({
    description: 'Attribute value',
    example: 'Red',
  })
  @IsString()
  value: string;

  @ApiPropertyOptional({
    description: 'Hex color code for color attributes',
    example: '#FF0000',
  })
  @IsOptional()
  @IsString()
  hex_color?: string;

  @ApiPropertyOptional({
    description: 'Sort order for display',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional({
    description: 'Whether the attribute value is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
