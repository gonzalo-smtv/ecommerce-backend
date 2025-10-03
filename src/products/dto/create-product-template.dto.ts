import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsObject,
} from 'class-validator';

export class CreateProductTemplateDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
