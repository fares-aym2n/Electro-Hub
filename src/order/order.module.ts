import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/products.entity';
import { UserModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [
    TypeOrmModule.forFeature([Order]),
    StripeModule,
    UserModule,
    JwtModule,
  ],
  exports: [OrderService],
})
export class OrderModule {}
