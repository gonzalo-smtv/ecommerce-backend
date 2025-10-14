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
import { ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { ProductTemplatesService } from '../services/product-templates.service';
import { CreateProductTemplateDto } from '../dto/create-product-template.dto';
import { UpdateProductTemplateDto } from '../dto/update-product-template.dto';

@ApiTags('Product Templates')
@Controller('product-templates')
export class ProductTemplatesController {
  constructor(
    private readonly productTemplatesService: ProductTemplatesService,
  ) {}

  // ===== GET METHODS (Read Operations) =====

  @Get()
  @ApiOperation({
    summary: 'Get all product templates',
    description: 'Retrieves all product templates',
  })
  @ApiResponse({
    status: 200,
    description: 'Product templates retrieved successfully',
  })
  findAll() {
    return this.productTemplatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a product template by ID',
    description: 'Retrieves a single product template by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Product template ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product template retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product template not found',
  })
  findOne(@Param('id') id: string) {
    return this.productTemplatesService.findOne(id);
  }

  // ===== POST METHODS (Create Operations) =====

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a product template',
    description: 'Creates a new product template',
  })
  @ApiResponse({
    status: 201,
    description: 'Product template created successfully',
  })
  create(@Body() createProductTemplateDto: CreateProductTemplateDto) {
    return this.productTemplatesService.create(createProductTemplateDto);
  }

  // ===== PATCH METHODS (Update Operations) =====

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a product template',
    description: 'Updates an existing product template',
  })
  @ApiParam({
    name: 'id',
    description: 'Product template ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product template updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product template not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductTemplateDto: UpdateProductTemplateDto,
  ) {
    return this.productTemplatesService.update(id, updateProductTemplateDto);
  }

  // ===== DELETE METHODS (Delete Operations) =====

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a product template',
    description: 'Removes a product template',
  })
  @ApiParam({
    name: 'id',
    description: 'Product template ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Product template deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product template not found',
  })
  remove(@Param('id') id: string) {
    return this.productTemplatesService.remove(id);
  }
}
