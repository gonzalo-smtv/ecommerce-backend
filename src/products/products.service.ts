import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { StorageService } from '@app/storage/storage.service';
import { CacheService } from '@app/cache/cache.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
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

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(productData);

    // Save the product to get an ID
    const savedProduct = await this.productsRepository.save(product);

    // Images will be handled separately through ProductImagesService

    console.log(`Product created successfully with ID: ${savedProduct.id}`);
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

    // TypeORM will take care of deleting the associated images thanks to onDelete: 'CASCADE'
    await this.productsRepository.remove(product);

    console.log(`Product with ID ${id} and its images deleted successfully`);
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
}
