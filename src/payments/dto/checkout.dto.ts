import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @IsNumber()
  id: string;

  @IsNumber()
  quantity: number;
}

export class CreateCheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];
}
