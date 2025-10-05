import { PartialType } from '@nestjs/mapped-types';
import { CreateProductPriceTierDto } from './create-product-price-tier.dto';

export class UpdateProductPriceTierDto extends PartialType(
  CreateProductPriceTierDto,
) {}
