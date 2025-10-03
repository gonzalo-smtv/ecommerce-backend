import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariation } from '../entities/product-variation.entity';

@Injectable()
export class ProductVariationsService {
  constructor(
    @InjectRepository(ProductVariation)
    private productVariationsRepository: Repository<ProductVariation>,
  ) {}

  async findById(id: string): Promise<ProductVariation> {
    const productVariation = await this.productVariationsRepository.findOne({
      where: { id },
      relations: ['template', 'images'],
    });
    if (!productVariation) {
      throw new NotFoundException(`Product variation with ID ${id} not found`);
    }
    return productVariation;
  }

  async findBySku(sku: string): Promise<ProductVariation | null> {
    return this.productVariationsRepository.findOne({
      where: { sku },
      relations: ['template', 'images'],
    });
  }
}
