import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description:
      'Whether to replace existing images with new ones when uploading files',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  replaceImages?: boolean;
}
