import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import { ProductVariation } from './entities/product-variation.entity';
import { StorageService } from '@app/storage/storage.service';
import { CacheService } from '@app/cache/cache.service';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(ProductVariation)
    private productVariationsRepository: Repository<ProductVariation>,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  async findAllByVariationId(variationId: string): Promise<ProductImage[]> {
    return this.productImagesRepository.find({
      where: { variation_id: variationId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ProductImage> {
    const image = await this.productImagesRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Product image with ID ${id} not found`);
    }
    return image;
  }

  async create(
    variationId: string,
    files: Express.Multer.File[],
    isMain: boolean = false,
    altText?: string,
  ): Promise<ProductImage[]> {
    // Verify that the product variation exists
    const productVariation = await this.productVariationsRepository.findOne({
      where: { id: variationId },
    });
    if (!productVariation) {
      throw new NotFoundException(
        `Product variation with ID ${variationId} not found`,
      );
    }

    // Find the maximum sort order to add new images after existing ones
    const existingImages = await this.findAllByVariationId(variationId);
    let maxSortOrder = 0;
    if (existingImages.length > 0) {
      maxSortOrder = Math.max(...existingImages.map((img) => img.sortOrder));
    }

    // If isMain is true and there are existing images, we need to update them
    if (isMain && existingImages.length > 0) {
      await this.productImagesRepository.update(
        { variation_id: variationId },
        { isMain: false },
      );
    }

    const createdImages: ProductImage[] = [];

    // Upload each file and create the corresponding entities
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { url, path } = await this.storageService.uploadFile(
        file,
        `products/${variationId}`,
      );

      // Mark as main if it's the first image and there are no others, or if isMain is true and it's the first file
      const shouldBeMain =
        (i === 0 && existingImages.length === 0) || (isMain && i === 0);

      const newImage = this.productImagesRepository.create({
        url,
        path,
        variation_id: variationId,
        isMain: shouldBeMain,
        sortOrder: maxSortOrder + i + 1,
        altText: altText || file.originalname,
      });

      const savedImage = await this.productImagesRepository.save(newImage);
      createdImages.push(savedImage);
    }

    return createdImages;
  }

  async delete(id: string): Promise<void> {
    const image = await this.findOne(id);

    // Delete the file from Supabase
    if (image.path) {
      try {
        await this.storageService.deleteFile(image.path);
      } catch (error: any) {
        console.error(`Failed to delete image from storage: ${error.message}`);
      }
    }

    // Invalidate cache if it exists
    if (image.url) {
      this.cacheService.invalidateCache(image.url);
    }

    await this.productImagesRepository.remove(image);
  }

  async getImageBuffer(id: string): Promise<Buffer | null> {
    const image = await this.findOne(id);
    if (!image || !image.url) {
      return null;
    }

    // Get the image from cache or download it if not cached
    return this.cacheService.getImage(image.url);
  }
}
