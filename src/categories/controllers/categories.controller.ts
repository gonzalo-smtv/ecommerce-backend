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
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { MoveCategoryDto } from '../dto/move-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // ===== GET METHODS (Read Operations) =====
  @Get('tree')
  getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  // ===== POST METHODS (Create Operations) =====

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new category',
    description: 'Creates a new category in the system',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or business logic violation',
  })
  @ApiResponse({
    status: 404,
    description: 'Parent category not found',
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Post(':id/move')
  @ApiOperation({
    summary: 'Move category to a new position or parent',
    description:
      'Moves a category to a new parent category or changes its sort order within the same parent.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID to move',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category moved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid move operation (e.g., category cannot be its own parent)',
  })
  moveCategory(
    @Param('id') id: string,
    @Body() moveCategoryDto: MoveCategoryDto,
  ) {
    return this.categoriesService.moveCategory(id, moveCategoryDto);
  }

  // ===== PATCH METHODS (Update Operations) =====

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a category',
    description: 'Updates an existing category with the provided data',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or business logic violation',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  // ===== DELETE METHODS (Delete Operations) =====

  @Delete('delete-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAll() {
    return this.categoriesService.deleteAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
