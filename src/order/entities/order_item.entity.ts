import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/products.entity';

@Entity({ name: 'orderItems' })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: 'CASCADE',
  })
  order: Order;
  @ManyToOne(() => Product, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  product: Product | null;
  @Column({ type: 'varchar', length: 150 })
  productName: string;
  @Column({ type: 'int' })
  quantity: number;
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  unitPrice: number;
  @Column({ type: 'int' })
  discount: number;
}
