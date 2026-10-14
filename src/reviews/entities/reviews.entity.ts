import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from '../../products/entities/products.entity';
import { User } from '../../users/entities/users.entity';
import { TIMESTAMP } from '../../utils/constrants';


@Entity({ name: 'reviews' })
@Check('"rating" >= 1 AND "rating" <= 5')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  review: string;

  @Column({ type: 'int' })
  rating: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => TIMESTAMP,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => TIMESTAMP,
    onUpdate: TIMESTAMP,
  })
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;
}
