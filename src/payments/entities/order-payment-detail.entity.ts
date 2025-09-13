import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_payment_details')
export class OrderPaymentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  method: string;

  @Column()
  status: string;

  @Column()
  statusDetail: string;

  @Column()
  transactionId: string;

  @ManyToOne(() => Order, (order) => order.paymentDetails, {
    onDelete: 'CASCADE',
  })
  order: Order;

  @Column()
  orderId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
