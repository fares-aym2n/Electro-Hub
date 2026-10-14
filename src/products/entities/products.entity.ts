import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TIMESTAMP } from '../../utils/constrants';
import { User } from '../../users/entities/users.entity';
import { Category } from '../../categories/entities/category.entity';
import { Review } from '../../reviews/entities/reviews.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 500 })
  image: string;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 0,
  })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  ratingsCount: number;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 0,
    default: 0,
  })
  discount: number;

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

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user: User | null;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  category: Category;
}
