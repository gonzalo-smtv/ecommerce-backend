import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { AttributeValue } from './attribute-value.entity';

@Entity('product_attributes')
@Unique(['product_id', 'attribute_value_id'])
@Index(['product_id'])
@Index(['attribute_value_id'])
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid' })
  attribute_value_id: string;

  @ManyToOne(() => AttributeValue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_value_id' })
  attributeValue: AttributeValue;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
