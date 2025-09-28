import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { ProductCategory } from './entities/product-category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
  ) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with slug "${createCategoryDto.slug}" already exists`,
      );
    }

    if (createCategoryDto.parent_id) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parent_id },
      });

      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID "${createCategoryDto.parent_id}" not found`,
        );
      }

      Object.assign(createCategoryDto, {
        level: parentCategory.level + 1,
      });
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  /**
   * Get all active categories
   */
  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: { level: 'ASC', sort_order: 'ASC', name: 'ASC' },
      relations: ['parent', 'children'],
    });
  }

  /**
   * Get complete category hierarchy tree
   */
  async getCategoryTree(): Promise<Category[]> {
    const categories = await this.categoryRepository.find({
      where: { is_active: true },
      order: { level: 'ASC', sort_order: 'ASC', name: 'ASC' },
      relations: ['parent'],
    });

    const categoryMap = new Map<string, Category>();
    const roots: Category[] = [];

    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach((category) => {
      const categoryWithChildren = categoryMap.get(category.id)!;

      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children.push(categoryWithChildren);
        }
      } else {
        roots.push(categoryWithChildren);
      }
    });

    return roots;
  }

  /**
   * Get a category by ID
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  /**
   * Get a category by slug
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  /**
   * Update a category
   */
  async update(
    id: string,
    updateCategoryDto: Partial<CreateCategoryDto>,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingCategory) {
        throw new BadRequestException(
          `Category with slug "${updateCategoryDto.slug}" already exists`,
        );
      }
    }

    if (
      updateCategoryDto.parent_id &&
      updateCategoryDto.parent_id !== category.parent_id
    ) {
      if (updateCategoryDto.parent_id === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentCategory = await this.categoryRepository.findOne({
        where: { id: updateCategoryDto.parent_id },
      });

      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID "${updateCategoryDto.parent_id}" not found`,
        );
      }

      Object.assign(updateCategoryDto, {
        level: parentCategory.level + 1,
      });
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  /**
   * Delete a category
   */
  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    const childrenCount = await this.categoryRepository.count({
      where: { parent_id: id },
    });

    if (childrenCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with children. Move or delete children first.',
      );
    }

    const productsCount = await this.productCategoryRepository.count({
      where: { category_id: id },
    });

    if (productsCount > 0) {
      throw new BadRequestException(
        'Cannot delete category with associated products. Remove associations first.',
      );
    }

    await this.categoryRepository.remove(category);
  }

  /**
   * Get root categories (level 1)
   */
  async getRootCategories(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { level: 1, is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' },
      relations: ['children'],
    });
  }

  /**
   * Get child categories of a specific category
   */
  async getChildCategories(parentId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parent_id: parentId, is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' },
    });
  }

  /**
   * Get complete path of a category (breadcrumbs)
   */
  async getCategoryPath(categoryId: string): Promise<Category[]> {
    const path: Category[] = [];
    let currentCategoryId: string | null = categoryId;

    while (currentCategoryId) {
      const currentCategory = await this.categoryRepository.findOne({
        where: { id: currentCategoryId },
      });

      if (currentCategory) {
        path.unshift(currentCategory);
        currentCategoryId = currentCategory.parent_id;
      } else {
        break;
      }
    }

    return path;
  }
}
