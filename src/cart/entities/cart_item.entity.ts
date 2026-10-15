import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/products.entity';

@Entity({ name: 'cartItems' })
@Unique(['cart', 'product'])
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'int', default: 1 })
  quantity: number;
  @ManyToOne(() => Cart, (cart) => cart.cartItems, {
    onDelete: 'CASCADE',
  })
  cart: Cart;
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;
}
