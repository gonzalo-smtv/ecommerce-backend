import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ProductCategory } from '../../categories/entities/product-category.entity';
import { Category } from '../../categories/entities/category.entity';
import { ProductAttribute } from '../../attributes/entities/product-attribute.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relationship with categories (replaces simple category field)
  @OneToMany(
    () => ProductCategory,
    (productCategory) => productCategory.product,
    {
      cascade: true,
      eager: true,
    },
  )
  categoryConnections: ProductCategory[];

  // Main categories of the product (computed property)
  get categories(): Category[] {
    return this.categoryConnections?.map((pc) => pc.category) || [];
  }

  // Primary category (computed property)
  get primaryCategory(): Category | null {
    const primaryConnection = this.categoryConnections?.find(
      (pc) => pc.is_primary,
    );
    return primaryConnection?.category || null;
  }

  @Column({ type: 'text', nullable: true })
  dimensions: string;

  @Column({ type: 'int', nullable: true })
  weight: number;

  @Column({ type: 'boolean', nullable: true })
  inStock: boolean;

  @Column({ type: 'numeric', nullable: true })
  rating: number;

  @Column({ type: 'int', nullable: true })
  reviewCount: number;

  @Column({ type: 'boolean', nullable: true })
  featured: boolean;

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: true,
    eager: true,
  })
  images: ProductImage[];

  @OneToMany(
    () => ProductAttribute,
    (productAttribute) => productAttribute.product,
    {
      cascade: true,
      eager: true,
    },
  )
  productAttributes: ProductAttribute[];

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
