import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductAttribute } from '../attributes/entities/product-attribute.entity';
import { ProductCategory } from '../categories/entities/product-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { StorageService } from '@app/storage/storage.service';
import { CacheService } from '@app/cache/cache.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductAttribute)
    private productAttributeRepository: Repository<ProductAttribute>,
    @InjectRepository(ProductCategory)
    private productCategoryRepository: Repository<ProductCategory>,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(productData: CreateProductDto): Promise<Product> {
    this.logger.log('Creating a new product...');
    console.log('productData: ', productData);

    // Extract categoryIds and remove from productData
    const { categoryIds, ...productFields } = productData as any;

    const product = this.productsRepository.create(productFields);
    this.logger.log('Product data prepared, saving to database...');
    console.log('Product entity: ', product);

    // Save the product to get an ID
    const savedProduct = (await this.productsRepository.save(
      product,
    )) as unknown as Product;

    // Create category connections if categoryIds provided
    if (categoryIds) {
      let categoryIdArray: string[];
      if (typeof categoryIds === 'string') {
        categoryIdArray = categoryIds
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id);
      } else {
        categoryIdArray = categoryIds;
      }

      if (categoryIdArray.length > 0) {
        const productCategories = categoryIdArray.map((categoryId, index) => {
          return this.productCategoryRepository.create({
            product_id: savedProduct.id,
            category_id: categoryId,
            is_primary: index === 0, // First category is primary
          });
        });
        await this.productCategoryRepository.save(productCategories);
      }
    }

    this.logger.log(`Product created successfully with ID: ${savedProduct.id}`);
    return this.findById(savedProduct.id);
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const product = await this.findById(id);

    // We only update the basic product data, images are handled separately
    Object.assign(product, productData);
    return this.productsRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);

    // Find all images associated with the product
    const productImages = await this.productImagesRepository.find({
      where: { productId: id },
    });

    // Delete each image from Supabase and database
    for (const image of productImages) {
      if (image.path) {
        try {
          await this.storageService.deleteFile(image.path);
        } catch (error: any) {
          // Log but continue if delete fails
          console.error(`Failed to delete image: ${error.message}`);
        }
      }

      // Invalidate cache
      if (image.url) {
        this.cacheService.invalidateCache(image.url);
      }
    }

    await this.productsRepository.remove(product);

    this.logger.log(
      `Product with ID ${id} and its images deleted successfully`,
    );
  }

  /**
   * Get an image by product ID, using the cache system
   * @param productId - The ID of the product
   * @returns Buffer with the image data or null if not found
   */
  async getProductImage(productId: string): Promise<Buffer | null> {
    // Find the main product image
    const mainImage = await this.productImagesRepository.findOne({
      where: { productId, isMain: true },
    });

    if (!mainImage || !mainImage.url) {
      return null;
    }

    // Get the image from cache (or download it if not in cache)
    return this.cacheService.getImage(mainImage.url);
  }

  /**
   * Find products by category ID
   */
  async findByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.categoryConnections', 'pc')
      .where('pc.category_id = :categoryId', { categoryId })
      .leftJoinAndSelect('product.images', 'images')
      .getMany();

    return products;
  }

  /**
   * Find products by category slug
   */
  async findByCategorySlug(slug: string): Promise<Product[]> {
    const products = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.categoryConnections', 'pc')
      .innerJoin('pc.category', 'category')
      .where('category.slug = :slug', { slug })
      .leftJoinAndSelect('product.images', 'images')
      .getMany();

    return products;
  }

  /**
   * Get products with their categories
   */
  async findAllWithCategories(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: ['categoryConnections', 'categoryConnections.category'],
    });
  }

  /**
   * Get all products with full details (categories + attributes)
   */
  async findAllWithDetails(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: [
        'categoryConnections',
        'categoryConnections.category',
        'productAttributes',
        'productAttributes.attributeValue',
        'productAttributes.attributeValue.attribute',
        'images',
      ],
    });
  }

  /**
   * Find products by multiple attribute values
   */
  async findByAttributes(attributeValues: string[]): Promise<Product[]> {
    if (attributeValues.length === 0) {
      return this.findAll();
    }

    const products = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.productAttributes', 'pa')
      .where('pa.attribute_value_id IN (:...attributeValues)', {
        attributeValues,
      })
      .leftJoinAndSelect('product.images', 'images')
      .getMany();

    return products;
  }

  /**
   * Get products with their attributes
   */
  async findAllWithAttributes(): Promise<Product[]> {
    return this.productsRepository.find({
      relations: [
        'categoryConnections',
        'categoryConnections.category',
        'productAttributes',
        'productAttributes.attributeValue',
        'productAttributes.attributeValue.attribute',
      ],
    });
  }

  /**
   * Get product with full details (categories + attributes)
   */
  async findByIdWithDetails(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: [
        'categoryConnections',
        'categoryConnections.category',
        'productAttributes',
        'productAttributes.attributeValue',
        'productAttributes.attributeValue.attribute',
        'images',
      ],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Add attribute to product
   */
  async addAttributeToProduct(
    productId: string,
    attributeValueId: string,
  ): Promise<ProductAttribute> {
    const productAttribute = this.productAttributeRepository.create({
      product_id: productId,
      attribute_value_id: attributeValueId,
    });

    return this.productAttributeRepository.save(productAttribute);
  }

  /**
   * Remove attribute from product
   */
  async removeAttributeFromProduct(
    productId: string,
    attributeValueId: string,
  ): Promise<void> {
    const productAttribute = await this.productAttributeRepository.findOne({
      where: { product_id: productId, attribute_value_id: attributeValueId },
    });

    if (!productAttribute) {
      throw new NotFoundException('Attribute assignment not found');
    }

    await this.productAttributeRepository.remove(productAttribute);
  }
}
