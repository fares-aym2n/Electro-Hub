import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../src/users/users.entity';
import { Product } from '../src/products/products.entity';
import { Review } from '../src/reviews/reviews.entity';
import { config } from 'dotenv';
import { Category } from '../src/categories/entities/category.entity';
config({ path: '.env' });
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATA_BASE_URL,
  entities: [User, Product, Review, Category],
  migrations: ['dist/db/migrations'],
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
