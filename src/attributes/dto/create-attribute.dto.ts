import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['text', 'number', 'color', 'select', 'boolean'])
  type: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CreateAttributeValueDto {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  hex_color?: string;

  @IsOptional()
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
