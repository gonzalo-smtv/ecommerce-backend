import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductTemplatesService } from '../services/product-templates.service';
import { CreateProductTemplateDto } from '../dto/create-product-template.dto';
import { UpdateProductTemplateDto } from '../dto/update-product-template.dto';

@Controller('product-templates')
export class ProductTemplatesController {
  constructor(
    private readonly productTemplatesService: ProductTemplatesService,
  ) {}

  // ===== GET METHODS (Read Operations) =====

  @Get()
  findAll() {
    return this.productTemplatesService.findAll();
  }

  // ===== POST METHODS (Create Operations) =====

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductTemplateDto: CreateProductTemplateDto) {
    return this.productTemplatesService.create(createProductTemplateDto);
  }

  // ===== PATCH METHODS (Update Operations) =====

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductTemplateDto: UpdateProductTemplateDto,
  ) {
    return this.productTemplatesService.update(id, updateProductTemplateDto);
  }

  // ===== DELETE METHODS (Delete Operations) =====

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productTemplatesService.remove(id);
  }
}
