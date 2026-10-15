import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/products.entity';
import { CartItem } from './entities/cart_item.entity';
import { Cart } from './entities/cart.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../users/users.module';

@Module({
  controllers: [CartController],
  providers: [CartService],
  imports: [
    TypeOrmModule.forFeature([Product, CartItem, Cart]),
    JwtModule,
    UserModule,
  ],
})
export class CartModule {}
