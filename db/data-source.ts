import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../src/users/entities/users.entity';
import { Product } from '../src/products/entities/products.entity';
import { config } from 'dotenv';
import { Category } from '../src/categories/entities/category.entity';
import { Review } from '../src/reviews/entities/reviews.entity';
import { Whitelist } from '../src/whitelist/entities/whitelist.entity';
import { Cart } from '../src/cart/entities/cart.entity';
import { CartItem } from '../src/cart/entities/cart_item.entity';
config({ path: '.env' });
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATA_BASE_URL,
  entities: [
    User,
    Product,
    Review,
    Category,
    Whitelist,
    Cart,
    CartItem,
  ],
  migrations: ['dist/db/migrations'],
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
