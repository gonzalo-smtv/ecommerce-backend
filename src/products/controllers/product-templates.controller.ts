import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
  findAll(@Query('includeInactive') includeInactive?: string) {
    const includeInactiveBool = includeInactive === 'true';
    return this.productTemplatesService.findAll(includeInactiveBool);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productTemplatesService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productTemplatesService.findBySlug(slug);
  }

  @Get(':id/variations')
  getTemplateVariations(@Param('id') id: string) {
    return this.productTemplatesService.getTemplateVariations(id);
  }

  @Get(':id/complete')
  getTemplateWithVariations(@Param('id') id: string) {
    return this.productTemplatesService.getTemplateWithVariations(id);
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
