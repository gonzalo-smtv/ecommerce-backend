import {
  IsUUID,
  IsInt,
  IsDecimal,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductPriceTierDto {
  @ApiProperty({
    description: 'UUID de la variación de producto',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  variation_id: string;

  @ApiProperty({
    description: 'Cantidad mínima para aplicar este precio',
    example: 10,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_quantity: number;

  @ApiPropertyOptional({
    description: 'Cantidad máxima para aplicar este precio (null = sin límite)',
    example: 49,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_quantity?: number;

  @ApiProperty({
    description: 'Precio unitario para este rango de cantidad',
    example: 90.5,
    type: 'number',
    format: 'decimal',
  })
  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    description: 'Indica si este tier de precio está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Orden de prioridad para tiers con cantidades similares',
    example: 1,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort_order?: number;
}
