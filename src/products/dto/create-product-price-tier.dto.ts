import {
  IsUUID,
  IsInt,
  IsDecimal,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductPriceTierDto {
  @IsUUID()
  variation_id: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  min_quantity: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_quantity?: number;

  @IsDecimal({ decimal_digits: '2' })
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sort_order?: number;
}
