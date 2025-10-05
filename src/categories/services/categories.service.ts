import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    this.logger.log('Creating a new category...');

    // Check if slug already exists
    const existingCategory = await this.categoriesRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with slug "${createCategoryDto.slug}" already exists`,
      );
    }

    // If parentId is provided, verify parent exists and update level
    if (createCategoryDto.parentId) {
      const parent = await this.categoriesRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }

      // Set level based on parent level
      createCategoryDto.level = parent.level + 1;
    }

    const category = this.categoriesRepository.create(createCategoryDto);
    const savedCategory = await this.categoriesRepository.save(category);

    this.logger.log(
      `Category created successfully with ID: ${savedCategory.id}`,
    );
    return this.findOne(savedCategory.id);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Check if slug is being changed and if it already exists
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new BadRequestException(
          `Category with slug "${updateCategoryDto.slug}" already exists`,
        );
      }
    }

    // If parentId is being changed, verify parent exists and update level
    if (
      updateCategoryDto.parentId &&
      updateCategoryDto.parentId !== category.parentId
    ) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.categoriesRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${updateCategoryDto.parentId} not found`,
        );
      }

      // Set level based on parent level
      updateCategoryDto.level = parent.level + 1;
    }

    Object.assign(category, updateCategoryDto);
    await this.categoriesRepository.save(category);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has children
    const childrenCount = await this.categoriesRepository.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with children. Move or delete children first.',
      );
    }

    await this.categoriesRepository.remove(category);
    this.logger.log(`Category with ID ${id} deleted successfully`);
  }

  async deleteAll(): Promise<void> {
    this.logger.log('Deleting all categories...');

    // Get all categories ordered by level (deepest first) to avoid FK constraint issues
    const allCategories = await this.categoriesRepository.find({
      order: { level: 'DESC' },
    });

    // Delete categories starting from the deepest level (children first)
    for (const category of allCategories) {
      await this.categoriesRepository.remove(category);
      this.logger.log(
        `Deleted category: ${category.name} (ID: ${category.id})`,
      );
    }

    this.logger.log(`Successfully deleted ${allCategories.length} categories`);
  }

  async getCategoryTree(): Promise<Category[]> {
    // Fetch all active categories to build the complete tree
    const allCategories = await this.categoriesRepository.find({
      order: { level: 'ASC', sort_order: 'ASC', name: 'ASC' },
    });

    // Build a map for quick lookup
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map and identify root categories
    for (const category of allCategories) {
      categoryMap.set(category.id, { ...category, children: [] });

      if (!category.parentId) {
        rootCategories.push(categoryMap.get(category.id)!);
      }
    }

    // Second pass: build parent-child relationships
    for (const category of allCategories) {
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId)!;
        const child = categoryMap.get(category.id)!;
        parent.children.push(child);
      }
    }

    // Sort root categories and their children recursively
    this.sortCategoriesRecursive(rootCategories);

    return rootCategories;
  }

  private sortCategoriesRecursive(categories: Category[]): void {
    // Sort the current level
    categories.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return a.name.localeCompare(b.name);
    });

    // Recursively sort children
    for (const category of categories) {
      if (category.children && category.children.length > 0) {
        this.sortCategoriesRecursive(category.children);
      }
    }
  }

  async moveCategory(
    id: string,
    moveData: { parentId?: string; sortOrder?: number },
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (moveData.parentId) {
      if (moveData.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.categoriesRepository.findOne({
        where: { id: moveData.parentId },
      });

      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${moveData.parentId} not found`,
        );
      }

      category.parentId = moveData.parentId;
      category.level = parent.level + 1;
    }

    if (moveData.sortOrder !== undefined) {
      category.sort_order = moveData.sortOrder;
    }

    await this.categoriesRepository.save(category);
    return this.findOne(id);
  }

  getCategoryProducts(id: string): any[] {
    // This would typically use the products service or a query builder
    // For now, return a placeholder structure
    return [
      {
        categoryId: id,
        products: [],
        totalCount: 0,
      },
    ];
  }
}
