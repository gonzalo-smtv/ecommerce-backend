import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { ProductVariation } from '@app/products/entities/product-variation.entity';

/**
 * CartItem entity to store individual products in a shopping cart
 * Links products with their respective cart and stores quantity and price
 */
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  cartId: string;

  @Column()
  productVariationId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @ManyToOne(() => Cart, (cart: Cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ManyToOne(() => ProductVariation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productVariationId' })
  productVariation: ProductVariation;
}
