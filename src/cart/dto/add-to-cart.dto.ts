import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for adding a product to the cart
 */
export class AddToCartDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'Product ID to add to cart',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'Quantity to add',
    minimum: 1,
    default: 1,
    example: 2,
  })
  quantity: number = 1;
}
