import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for updating a cart item's quantity
 */
export class UpdateCartItemDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'New product quantity',
    minimum: 1,
    example: 3,
  })
  quantity: number;
}
