import { PartialType } from '@nestjs/swagger';
import {
  CreateAttributeDto,
  CreateAttributeValueDto,
} from './create-attribute.dto';

export class UpdateAttributeDto extends PartialType(CreateAttributeDto) {}

export class UpdateAttributeValueDto extends PartialType(
  CreateAttributeValueDto,
) {}
