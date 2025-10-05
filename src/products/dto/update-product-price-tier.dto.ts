import { PartialType } from '@nestjs/mapped-types';
import { CreateProductPriceTierDto } from './create-product-price-tier.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductPriceTierDto extends PartialType(
  CreateProductPriceTierDto,
) {
  @ApiPropertyOptional({
    description: 'Cantidad mínima para aplicar este precio',
    example: 10,
    minimum: 1,
  })
  min_quantity?: number;

  @ApiPropertyOptional({
    description: 'Cantidad máxima para aplicar este precio (null = sin límite)',
    example: 49,
    minimum: 1,
  })
  max_quantity?: number;

  @ApiPropertyOptional({
    description: 'Precio unitario para este rango de cantidad',
    example: 90.5,
    type: 'number',
    format: 'decimal',
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'Indica si este tier de precio está activo',
    example: true,
  })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Orden de prioridad para tiers con cantidades similares',
    example: 1,
  })
  sort_order?: number;
}
