import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductTemplate } from '../entities/product-template.entity';
import { ProductVariation } from '../entities/product-variation.entity';
import { Category } from '../../categories/entities/category.entity';
import { CreateProductTemplateDto } from '../dto/create-product-template.dto';
import { UpdateProductTemplateDto } from '../dto/update-product-template.dto';

@Injectable()
export class ProductTemplatesService {
  private readonly logger = new Logger(ProductTemplatesService.name);

  constructor(
    @InjectRepository(ProductTemplate)
    private productTemplatesRepository: Repository<ProductTemplate>,
    @InjectRepository(ProductVariation)
    private productVariationsRepository: Repository<ProductVariation>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<ProductTemplate[]> {
    return this.productTemplatesRepository.find({
      relations: ['category', 'variations'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ProductTemplate> {
    const template = await this.productTemplatesRepository.findOne({
      where: { id },
      relations: ['category', 'variations'],
    });

    if (!template) {
      throw new NotFoundException(`Product template with ID ${id} not found`);
    }

    return template;
  }

  async create(
    createProductTemplateDto: CreateProductTemplateDto,
  ): Promise<ProductTemplate> {
    this.logger.log('Creating a new product template...');

    // Check if slug already exists
    const existingTemplate = await this.productTemplatesRepository.findOne({
      where: { slug: createProductTemplateDto.slug },
    });

    if (existingTemplate) {
      throw new BadRequestException(
        `Product template with slug "${createProductTemplateDto.slug}" already exists`,
      );
    }

    // If category_id is provided, verify category exists
    if (createProductTemplateDto.category_id) {
      const category = await this.categoriesRepository.findOne({
        where: { id: createProductTemplateDto.category_id },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${createProductTemplateDto.category_id} not found`,
        );
      }
    }

    const template = this.productTemplatesRepository.create(
      createProductTemplateDto,
    );
    const savedTemplate = await this.productTemplatesRepository.save(template);

    this.logger.log(
      `Product template created successfully with ID: ${savedTemplate.id}`,
    );
    return this.findOne(savedTemplate.id);
  }

  async update(
    id: string,
    updateProductTemplateDto: UpdateProductTemplateDto,
  ): Promise<ProductTemplate> {
    const template = await this.findOne(id);

    // Check if slug is being changed and if it already exists
    if (
      updateProductTemplateDto.slug &&
      updateProductTemplateDto.slug !== template.slug
    ) {
      const existingTemplate = await this.productTemplatesRepository.findOne({
        where: { slug: updateProductTemplateDto.slug },
      });

      if (existingTemplate) {
        throw new BadRequestException(
          `Product template with slug "${updateProductTemplateDto.slug}" already exists`,
        );
      }
    }

    // If category_id is being changed, verify category exists
    if (
      updateProductTemplateDto.category_id &&
      updateProductTemplateDto.category_id !== template.category_id
    ) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateProductTemplateDto.category_id },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductTemplateDto.category_id} not found`,
        );
      }
    }

    Object.assign(template, updateProductTemplateDto);
    await this.productTemplatesRepository.save(template);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);

    // Check if template has variations
    const variationsCount = await this.productVariationsRepository.count({
      where: { template_id: id },
    });

    if (variationsCount > 0) {
      throw new BadRequestException(
        'Cannot delete template with variations. Delete variations first.',
      );
    }

    await this.productTemplatesRepository.remove(template);
    this.logger.log(`Product template with ID ${id} deleted successfully`);
  }
}
