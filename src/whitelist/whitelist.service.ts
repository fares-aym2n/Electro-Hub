import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/products.entity';
import { Whitelist } from './entities/whitelist.entity';
import { User } from '../users/entities/users.entity';
@Injectable()
export class WhitelistService {
  constructor(
    @InjectRepository(Whitelist)
    private readonly whitelistRepository: Repository<Whitelist>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  public async getOrCreateWhiteList(
    userId: number,
  ): Promise<Whitelist> {
    let whitelist = await this.whitelistRepository.findOne({
      where: { user: { id: userId } },
      relations: { products: true },
    });
    if (!whitelist) {
      whitelist = this.whitelistRepository.create({
        user: { id: userId } as User,
        products: [],
      });
      await this.whitelistRepository.save(whitelist);
    }
    return whitelist;
  }

  public async getMyWhitelist(userId: number) {
    const whiteList = await this.getOrCreateWhiteList(userId);
    return {
      results: whiteList.products.length,
      products: whiteList.products,
    };
  }

  public async addProductToWhitelist(
    userId: number,
    productId: number,
  ) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    const whiteList = await this.getOrCreateWhiteList(userId);
    const productIsExist = whiteList.products.find(
      (product) => product.id == productId,
    );
    if (productIsExist) {
      return {
        message: 'Product already exists in wishlist',
      };
    }
    whiteList.products.push(product);
    await this.whitelistRepository.save(whiteList);
    return { message: 'Product is added successfuly' };
  }

  async deleteProductFromWhitelist(
    userId: number,
    productId: number,
  ) {
    const whitelist = await this.getOrCreateWhiteList(userId);
    const productExist = whitelist.products.find(
      (product) => product.id == productId,
    );

    if (!productExist) {
      throw new NotFoundException('Product not found');
    }

    whitelist.products = whitelist.products.filter(
      (product) => product.id !== productId,
    );

    return this.whitelistRepository.save(whitelist);
  }
}
