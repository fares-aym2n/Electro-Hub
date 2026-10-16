import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart_item.entity';
import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order_item.entity';
import { Product } from '../products/entities/products.entity';
import { OrderStatus } from '../utils/order-status';
import { StripeService } from '../stripe/stripe.service';
import { PaymentStatus } from '../utils/payment-status';
import { paymentMethod } from '../utils/payment-method';
import Stripe from 'stripe';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly stripeService: StripeService,
  ) {}

  public async createOrder(userId: number, dto: CreateOrderDto) {
    // Phase 1: Create the order and its items atomically.
    const orderData = await this.dataSource.transaction(
      async (manager) => {
        const cart = await manager.findOne(Cart, {
          where: { user: { id: userId } },
          relations: {
            cartItems: { product: true },
          },
        });

        if (!cart || cart.cartItems.length === 0) {
          throw new BadRequestException('Your cart is empty');
        }

        let totalPrice = 0;

        const items = cart.cartItems.map((item) => {
          const product = item.product;

          if (!product || !product.isActive) {
            throw new BadRequestException(
              'One of the products is unavailable',
            );
          }

          if (
            item.quantity <= 0 ||
            item.quantity > product.stockQuantity
          ) {
            throw new BadRequestException(
              `Insufficient stock for ${product.name}`,
            );
          }

          const price = Number(product.price);
          const discount = Number(product.discount ?? 0);

          const unitPrice = Number(
            (price * (1 - discount / 100)).toFixed(2),
          );

          totalPrice += unitPrice * item.quantity;

          return {
            product,
            productName: product.name,
            quantity: item.quantity,
            unitPrice,
            discount,
          };
        });

        totalPrice = Number(totalPrice.toFixed(2));

        const order = manager.create(Order, {
          user: { id: userId },
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          shippingAddress: dto.shippingAddress,
          city: dto.city,
          country: dto.country,
          paymentMethod: dto.paymentMethod,
          totalPrice,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
        });

        const savedOrder = await manager.save(Order, order);

        const orderItems = items.map((item) =>
          manager.create(OrderItem, {
            order: savedOrder,
            product: item.product,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
          }),
        );

        await manager.save(OrderItem, orderItems);

        return {
          orderId: savedOrder.id,
          totalPrice,
          paymentMethod: dto.paymentMethod,
          items: items.map((item) => ({
            productName: item.productName,
            image: item.product.image,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        };
      },
    );

    // Phase 2: Handle payment according to the selected method.

    if (orderData.paymentMethod === paymentMethod.CASH) {
      return {
        orderId: orderData.orderId,
        totalPrice: orderData.totalPrice,
        paymentMethod: orderData.paymentMethod,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        message:
          'Order created successfully. Payment will be collected on delivery.',
      };
    }

    if (orderData.paymentMethod === paymentMethod.CARD) {
      const successUrl = process.env.FRONTEND_SUCCESS_URL;
      const cancelUrl = process.env.FRONTEND_CANCEL_URL;

      if (!successUrl || !cancelUrl) {
        throw new BadRequestException(
          'Payment redirect URLs are not configured',
        );
      }

      const session =
        await this.stripeService.createChckoutSession({
          orderId: orderData.orderId,
          items: orderData.items,
          successUrl,
          cancelUrl,
        });

      if (!session.url) {
        throw new BadRequestException(
          'Could not create the payment session',
        );
      }

      await this.orderRepository.update(orderData.orderId, {
        stripeSessionId: session.id,
      });

      return {
        orderId: orderData.orderId,
        totalPrice: orderData.totalPrice,
        paymentMethod: orderData.paymentMethod,
        checkoutUrl: session.url,
      };
    }

    throw new BadRequestException('Invalid payment method');
  }

  public async confirmStripePayment(
    session: Stripe.Checkout.Session,
  ) {
    if (!session.id || !session.metadata?.orderId) {
      throw new BadRequestException(
        'Missing order information in Stripe session',
      );
    }

    if (session.payment_status !== 'paid') {
      throw new BadRequestException(
        'Stripe session payment is not completed',
      );
    }

    const orderId = Number(session.metadata.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new BadRequestException('Invalid order ID');
    }

    await this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: {
          user: true,
          orderItems: {
            product: true,
          },
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.stripeSessionId !== session.id) {
        throw new BadRequestException(
          'Stripe session does not match this order',
        );
      }

      // Idempotency: do not process the same paid order twice.
      if (order.paymentStatus === PaymentStatus.PAID) {
        return;
      }

      if (!order.orderItems?.length) {
        throw new BadRequestException(
          'Order has no items to process',
        );
      }

      // Lock and validate every product before deducting stock.
      const productsToUpdate: Product[] = [];

      for (const item of order.orderItems) {
        const productId = item.product?.id;

        if (!productId) {
          throw new BadRequestException(
            `Product information is missing for ${item.productName}`,
          );
        }

        const product = await manager.findOne(Product, {
          where: { id: productId },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (!product || !product.isActive) {
          throw new BadRequestException(
            `Product ${item.productName} is unavailable`,
          );
        }

        if (
          item.quantity <= 0 ||
          product.stockQuantity < item.quantity
        ) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );
        }

        productsToUpdate.push(product);
      }

      // Deduct stock only after all products pass validation.
      for (const item of order.orderItems) {
        const product = productsToUpdate.find(
          (candidate) => candidate.id === item.product?.id,
        );

        if (!product) {
          throw new BadRequestException(
            `Product ${item.productName} could not be loaded`,
          );
        }

        product.stockQuantity -= item.quantity;
        await manager.save(Product, product);
      }

      // Confirm payment and order.
      order.paymentStatus = PaymentStatus.PAID;
      order.status = OrderStatus.CONFIRMED;

      await manager.save(Order, order);

      // Clear the user's cart after successful payment processing.
      const userId = order.user?.id;

      if (!userId) {
        throw new BadRequestException(
          'Order has no associated user',
        );
      }

      const cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
      });

      if (cart) {
        await manager.delete(CartItem, {
          cart: { id: cart.id },
        });
      }
    });

    return { received: true };
  }

  public async getOrderById(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: {
        orderItems: {
          product: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  public async getMyOrders(userId: number) {
    const orders = await this.orderRepository.find({
      where: {
        user: { id: userId },
      },
      relations: {
        orderItems: {
          product: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      result: orders.length,
      orders,
    };
  }
}
