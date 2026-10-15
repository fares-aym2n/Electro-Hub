import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
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
    const totalPrice = cart.cartItems.reduce((total, item) => {
      const price = Number(item.product.price);
      const discount = Number(item.product.discount ?? 0);

      const finalPrice = price * (1 - discount / 100);

      return total + finalPrice * item.quantity;
    }, 0);

    return {
      ...cart,
      totalPrice,
    };
  }

  public async addItemToCart(
    userId: number,
    productId: number,
    quantity: number,
  ) {
    // 1. Get or create the user's cart
    const cart = await this.getOrCreateCart(userId);

    // 2. Find the product
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
      },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException(
        'Product is not found or inactive',
      );
    }

    // 3. Find the product in the cart
    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: productId },
      },
    });

    // 4. Calculate the new quantity
    const newQuantity = (cartItem?.quantity ?? 0) + quantity;

    // 5. Check available stock
    if (newQuantity > product.stockQuantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // 6. Update existing item or create a new one
    if (cartItem) {
      cartItem.quantity = newQuantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
      });
    }

    // 7. Save the item
    await this.cartItemRepository.save(cartItem);

    // 8. Return the cart
    return this.getCart(userId);
  }

  public async updateItemCart(
    userId: number,
    productId: number,
    quantity: number,
  ) {
    // 1. Get the user's cart
    const cart = await this.getOrCreateCart(userId);

    // 2. Find the item in the cart
    const cartItem = await this.cartItemRepository.findOne({
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
      throw new BadRequestException('Insufficient stock');
    }

    // 4. Update the quantity
    cartItem.quantity = quantity;

    // 5. Save the changes
    await this.cartItemRepository.save(cartItem);

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

    return this.cartItemRepository.remove(cartItem);
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
