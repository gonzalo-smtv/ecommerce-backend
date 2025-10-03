import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductVariation } from './product-variation.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text', nullable: true })
  path: string;

  @Column({ type: 'boolean', name: 'isMain', default: false })
  isMain: boolean;

  @Column({ type: 'int', name: 'sortOrder', default: 0 })
  sortOrder: number;

  @Column({ type: 'text', name: 'altText', nullable: true })
  altText: string;

  @ManyToOne(() => ProductVariation, (variation) => variation.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variation_id' })
  variation: ProductVariation;

  @Column({ type: 'uuid', name: 'variation_id' })
  variation_id: string;

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
