import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProductVariation } from '../../products/entities/product-variation.entity';
import { Order } from '../../payments/entities/order.entity';
import { ReviewImage } from './review-image.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
  FLAGGED = 'flagged',
}

@Entity('reviews')
@Index(['productVariationId'])
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
@Index(['isVerifiedPurchase'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  productVariationId: string;

  @ManyToOne(() => ProductVariation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productVariationId' })
  productVariation: ProductVariation;

  @Column({ type: 'uuid', nullable: true })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'boolean', default: false })
  isVerifiedPurchase: boolean;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ type: 'integer', default: 0 })
  helpfulVotes: number;

  @Column({ type: 'integer', default: 0 })
  reportCount: number;

  @Column({ type: 'text', nullable: true })
  moderationReason: string;

  @Column({ type: 'uuid', nullable: true })
  moderatedBy: string;

  @OneToMany(() => ReviewImage, (image) => image.review, {
    cascade: true,
    eager: true,
  })
  images: ReviewImage[];

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
