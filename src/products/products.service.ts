import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly storageService: StorageService,
  ) {}

  findAll(): Promise<Product[]> {
    return this.productsRepository.find();
  }

  async findById(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(
    productData: Partial<Product>,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = this.productsRepository.create(productData);

    if (file) {
      // Upload the image to Supabase Storage
      const { url } = await this.storageService.uploadFile(file, 'products');
      product.image = url;
    }

    return this.productsRepository.save(product);
  }

  async update(
    id: number,
    productData: Partial<Product>,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.findById(id);

    if (file) {
      // Delete previous image if exists
      if (product.image) {
        const imagePath = this.extractImagePath(product.image);
        if (imagePath) {
          try {
            await this.storageService.deleteFile(imagePath);
          } catch (error: any) {
            // Log but continue if delete fails
            console.error(`Failed to delete old image: ${error.message}`);
          }
        }
      }

      // Upload the new image
      const { url } = await this.storageService.uploadFile(file, 'products');
      productData.image = url;
    }

    Object.assign(product, productData);
    return this.productsRepository.save(product);
  }

  async delete(id: number): Promise<void> {
    const product = await this.findById(id);

    // Delete associated image if exists
    if (product.image) {
      const imagePath = this.extractImagePath(product.image);
      if (imagePath) {
        try {
          await this.storageService.deleteFile(imagePath);
        } catch (error: any) {
          // Log but continue if delete fails
          console.error(`Failed to delete image: ${error.message}`);
        }
      }
    }

    await this.productsRepository.remove(product);
  }

  // Helper method to extract the path from a Supabase URL
  private extractImagePath(imageUrl: string): string | null {
    try {
      if (!imageUrl) return null;

      // Extract the path from the URL
      // Example URL: https://your-project.supabase.co/storage/v1/object/public/images/products/image.jpg
      const urlParts = imageUrl.split('/');
      // Find the bucket name index
      const bucketIndex = urlParts.findIndex((part) => part === 'public') + 1;
      if (bucketIndex > 0) {
        // Join all parts after the bucket name
        return urlParts.slice(bucketIndex).join('/');
      }
      return null;
    } catch (error) {
      console.error('Error extracting image path:', error);
      return null;
    }
  }
}
