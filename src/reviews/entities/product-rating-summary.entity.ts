import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductVariation } from '../../products/entities/product-variation.entity';

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

@Entity('product_rating_summary')
@Index(['productVariationId'])
@Index(['averageRating'])
@Index(['totalReviews'])
export class ProductRatingSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productVariationId: string;

  @OneToOne(() => ProductVariation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productVariationId' })
  productVariation: ProductVariation;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  averageRating: number;

  @Column({ type: 'integer', default: 0 })
  totalReviews: number;

  @Column({ type: 'jsonb', default: '{"1":0,"2":0,"3":0,"4":0,"5":0}' })
  ratingDistribution: RatingDistribution;

  @Column({ type: 'integer', default: 0 })
  verifiedReviews: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  verifiedAverageRating: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastCalculated: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
