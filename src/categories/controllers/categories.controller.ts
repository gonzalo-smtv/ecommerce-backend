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
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    const includeInactiveBool = includeInactive === 'true';
    return this.categoriesService.findAll(includeInactiveBool);
  }

  @Get('tree')
  getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get('hierarchy/:id')
  getCategoryHierarchy(@Param('id') id: string) {
    return this.categoriesService.getCategoryHierarchy(id);
  }

  @Get('breadcrumbs/:id')
  getCategoryBreadcrumbs(@Param('id') id: string) {
    return this.categoriesService.getCategoryBreadcrumbs(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id/children')
  getChildren(@Param('id') id: string) {
    return this.categoriesService.getChildren(id);
  }

  @Get(':id/parent')
  getParent(@Param('id') id: string) {
    return this.categoriesService.getParent(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

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

  @Post(':id/move')
  moveCategory(
    @Param('id') id: string,
    @Body() moveData: { parentId?: string; sortOrder?: number },
  ) {
    return this.categoriesService.moveCategory(id, moveData);
  }

  @Get(':id/products')
  getCategoryProducts(@Param('id') id: string) {
    return this.categoriesService.getCategoryProducts(id);
  }
}
