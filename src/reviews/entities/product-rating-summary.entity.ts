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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Unique identifier for the rating summary',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the product variation',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  productVariationId: string;

  @ApiPropertyOptional({
    description: 'Product variation this summary belongs to',
    type: () => ProductVariation,
  })
  @OneToOne(() => ProductVariation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productVariationId' })
  productVariation: ProductVariation;

  @ApiProperty({
    description: 'Average rating across all reviews',
    example: 4.2,
    minimum: 0,
    maximum: 5,
  })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  averageRating: number;

  @ApiProperty({
    description: 'Total number of reviews',
    example: 42,
  })
  @Column({ type: 'integer', default: 0 })
  totalReviews: number;

  @ApiProperty({
    description: 'Distribution of ratings by star count',
    example: { 1: 2, 2: 1, 3: 5, 4: 12, 5: 25 },
  })
  @Column({ type: 'jsonb', default: '{"1":0,"2":0,"3":0,"4":0,"5":0}' })
  ratingDistribution: RatingDistribution;

  @ApiProperty({
    description: 'Number of verified reviews (from verified purchases)',
    example: 35,
  })
  @Column({ type: 'integer', default: 0 })
  verifiedReviews: number;

  @ApiProperty({
    description: 'Average rating from verified reviews only',
    example: 4.3,
    minimum: 0,
    maximum: 5,
  })
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  verifiedAverageRating: number;

  @ApiProperty({
    description: 'When this summary was last calculated',
    example: '2023-10-01T12:00:00.000Z',
  })
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastCalculated: Date;

  @ApiProperty({
    description: 'Date when the summary was created',
    example: '2023-10-01T12:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the summary was last updated',
    example: '2023-10-01T12:00:00.000Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
