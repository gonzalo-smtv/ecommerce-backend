import { IsArray, IsNumber, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CheckoutItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  quantity: number;
}

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Array of items to checkout',
    type: [CheckoutItemDto],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 1,
      },
      {
        id: '987e6543-e21c-12d3-a456-426614174001',
        quantity: 3,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];
}
