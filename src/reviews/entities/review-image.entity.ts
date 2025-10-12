import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Review } from './review.entity';

@Entity('review_images')
@Index(['reviewId'])
@Index(['sortOrder'])
export class ReviewImage {
  @ApiProperty({
    description: 'Unique identifier for the review image',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'ID of the review this image belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ type: 'uuid' })
  reviewId: string;

  @ApiProperty({
    description: 'Review this image belongs to',
    type: () => Review,
  })
  @ManyToOne(() => Review, (review) => review.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @ApiProperty({
    description: 'URL of the image',
    example: 'https://example.com/images/review-123.jpg',
  })
  @Column({ type: 'varchar', length: 500 })
  imageUrl: string;

  @ApiProperty({
    description: 'Sort order for displaying images',
    example: 1,
  })
  @Column({ type: 'integer', default: 0 })
  sortOrder: number;

  @ApiProperty({
    description: 'Date when the image was uploaded',
    example: '2023-10-01T12:00:00.000Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
