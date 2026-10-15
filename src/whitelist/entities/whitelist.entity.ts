import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/users.entity';
import { Product } from '../../products/entities/products.entity';

@Entity({ name: 'whitelists' })
export class Whitelist {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.whitelist, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToMany(() => Product, (product) => product.whitelists)
  @JoinTable()
  products: Product[];

  @CreateDateColumn()
  created: Date;
}
