import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { OrderStatus } from '../../utils/order-status';
import { OrderItem } from './order_item.entity';
import { paymentMethod } from '../../utils/payment-method';
import { PaymentStatus } from '../../utils/payment-status';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user: User | null;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  shippingAddress: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: ['insert'],
  })
  orderItems: OrderItem[];

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  totalPrice: number;

  @Column({
    type: 'enum',
    enum: paymentMethod,
    default: 'card',
  })
  paymentMethod: paymentMethod;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'varchar', nullable: true })
  stripeSessionId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
