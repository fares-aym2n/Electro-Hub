import { Module } from '@nestjs/common';
import { ProductController } from './products.controller';
import { ProductService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/products.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/users.module';
import { Category } from '../categories/entities/category.entity';
import { Review } from '../reviews/entities/reviews.entity';

@Module({
  controllers: [ProductController],
  providers: [ProductService],

  imports: [
    TypeOrmModule.forFeature([Product, Review, Category]),
    UserModule,
    JwtModule,
  ],
  exports: [ProductService],
})
export class ProductModule {}
