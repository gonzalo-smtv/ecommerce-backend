import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';
import { StorageService } from '@app/storage/storage.service';
import { CacheService } from '@app/cache/cache.service';
import { UpdateProductImageDto } from './dto/product-image.dto';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  async findAllByProductId(productId: string): Promise<ProductImage[]> {
    return this.productImagesRepository.find({
      where: { productId },
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
    productId: string,
    files: Express.Multer.File[],
    isMain: boolean = false,
    altText?: string,
  ): Promise<ProductImage[]> {
    // Verify that the product exists
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Find the maximum sort order to add new images after existing ones
    const existingImages = await this.findAllByProductId(productId);
    let maxSortOrder = 0;
    if (existingImages.length > 0) {
      maxSortOrder = Math.max(...existingImages.map((img) => img.sortOrder));
    }

    // If isMain is true and there are existing images, we need to update them
    if (isMain && existingImages.length > 0) {
      await this.productImagesRepository.update(
        { productId },
        { isMain: false },
      );
    }

    const createdImages: ProductImage[] = [];

    // Upload each file and create the corresponding entities
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { url, path } = await this.storageService.uploadFile(
        file,
        `products/${productId}`,
      );

      // Mark as main if it's the first image and there are no others, or if isMain is true and it's the first file
      const shouldBeMain =
        (i === 0 && existingImages.length === 0) || (isMain && i === 0);

      const newImage = this.productImagesRepository.create({
        url,
        path,
        productId,
        isMain: shouldBeMain,
        sortOrder: maxSortOrder + i + 1,
        altText: altText || file.originalname,
      });

      const savedImage = await this.productImagesRepository.save(newImage);
      createdImages.push(savedImage);
    }

    return createdImages;
  }

  async update(
    id: string,
    updateData: UpdateProductImageDto,
  ): Promise<ProductImage> {
    const image = await this.findOne(id);

    // If we're setting this image as main, update the others
    if (updateData.isMain) {
      await this.productImagesRepository.update(
        { productId: image.productId },
        { isMain: false },
      );
    }

    // Update the image
    Object.assign(image, updateData);
    return this.productImagesRepository.save(image);
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

  async setMainImage(
    productId: string,
    imageId: string,
  ): Promise<ProductImage> {
    // Verify that the image exists and belongs to the product
    const image = await this.productImagesRepository.findOne({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException(
        `Image with ID ${imageId} not found for product ${productId}`,
      );
    }

    // Update all product images so they are not main
    await this.productImagesRepository.update({ productId }, { isMain: false });

    // Set the selected image as main
    image.isMain = true;
    return this.productImagesRepository.save(image);
  }

  async reorderImages(
    productId: string,
    imageIds: string[],
  ): Promise<ProductImage[]> {
    // Verify that all images exist and belong to the product
    const images = await this.productImagesRepository.find({
      where: { productId },
    });

    if (images.length !== imageIds.length) {
      throw new NotFoundException('Some image IDs are invalid');
    }

    // Reorder the images
    const updatePromises = imageIds.map((id, index) => {
      return this.productImagesRepository.update(
        { id },
        { sortOrder: index + 1 },
      );
    });

    await Promise.all(updatePromises);

    // Return the updated images
    return this.findAllByProductId(productId);
  }
}
