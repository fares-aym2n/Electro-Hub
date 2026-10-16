import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { DataSource, Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { Product } from '../products/entities/products.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}
  public async getOrCreateCart(userId: number) {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: { cartItems: { product: true } },
    });
    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId },
      });
      await this.cartRepository.save(cart);
      cart.cartItems = [];
    }
    return cart;
  }

  public async getCart(userId: number) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        cartItems: { product: true },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart is not found');
    }
    const numberOfItem = cart.cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    const totalPrice = cart.cartItems.reduce((total, item) => {
      const price = Number(item.product.price);
      const discount = Number(item.product.discount ?? 0);

      const finalPrice = price * (1 - discount / 100);

      return total + finalPrice * item.quantity;
    }, 0);

    return {
      numberOfItem,
      ...cart,
      totalPrice,
    };
  }

  public async addItemToCart(
    userId: number,
    productId: number,
    quantity: number,
  ) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    await this.dataSource.transaction(async (manager) => {
      // 1. Get or create the user's cart
      let cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
      });
      if (!cart) {
        cart = manager.create(Cart, {
          user: { id: userId },
        });
        cart = await manager.save(Cart, cart);
      }

      // 2. Find the product
      const product = await manager.findOne(Product, {
        where: {
          id: productId,
        },
      });
      if (!product || !product.isActive) {
        throw new NotFoundException('Product is not found or inactive');
      }

      // 3. Find the product in the cart
      let cartItem = await manager.findOne(CartItem, {
        where: {
          cart: { id: cart.id },
          product: { id: productId },
        },
      });

      // 4. Calculate the new quantity
      const newQuantity = (cartItem?.quantity ?? 0) + quantity;

      // 5. Check available stock
      if (newQuantity > product.stockQuantity) {
        throw new BadRequestException(
          `Insufficient stock. Only ${product.stockQuantity} item(s) available in stock.`,
        );
      }

      // 6. Update existing item or create a new one
      if (cartItem) {
        cartItem.quantity = newQuantity;
        await manager.save(CartItem, cartItem);
      } else {
        cartItem = manager.create(CartItem, {
          cart,
          product,
          quantity: newQuantity,
        });
        await manager.save(CartItem, cartItem);
      }
    });

    // 7. Return the cart
    return this.getCart(userId);
  }

  public async updateItemCart(
    userId: number,
    productId: number,
    quantity: number,
  ) {
    if (quantity <= 0) {
      return this.deleteItemFromCart(userId, productId);
    }

    await this.dataSource.transaction(async (manager) => {
      // 1. Get the user's cart
      const cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
      });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      // 2. Find the item in the cart
      const cartItem = await manager.findOne(CartItem, {
        where: {
          cart: { id: cart.id },
          product: { id: productId },
        },
        relations: {
          product: true,
        },
      });
      if (!cartItem) {
        throw new NotFoundException('Product is not in the cart');
      }

      // 3. Check available stock
      if (quantity > cartItem.product.stockQuantity) {
        throw new BadRequestException(
          `Insufficient stock. Only ${cartItem.product.stockQuantity} item(s) available in stock.`,
        );
      }

      // 4. Update the quantity
      cartItem.quantity = quantity;

      // 5. Save the changes
      await manager.save(CartItem, cartItem);
    });

    // 6. Return the cart
    return this.getCart(userId);
  }

  public async deleteItemFromCart(
    userId: number,
    productId: number,
  ) {
    // 1. Get the user's cart
    const cart = await this.getOrCreateCart(userId);

    // 2. Find the item in the cart
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: productId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Product is not in the cart');
    }

    await this.cartItemRepository.remove(cartItem);
    return this.getCart(userId);
  }
  public async clearCart(userID: number) {
    // 1. Get the user's cart
    const cart = await this.getOrCreateCart(userID);
    // 2. Delete all items in the cart
    await this.cartItemRepository.delete({
      cart: { id: cart.id },
    });
  }
}
