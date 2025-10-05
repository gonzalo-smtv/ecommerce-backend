import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductVariation } from './product-variation.entity';

@Entity('product_price_tiers')
@Index(['variation_id'])
@Index(['variation_id', 'min_quantity'])
@Index(['variation_id', 'is_active'])
export class ProductPriceTier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  variation_id: string;

  @ManyToOne(() => ProductVariation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variation_id' })
  variation: ProductVariation;

  @Column({ type: 'int' })
  min_quantity: number;

  @Column({ type: 'int', nullable: true })
  max_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
