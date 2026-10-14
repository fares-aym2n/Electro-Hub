import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../users/users.service';
import { filterObj } from '../utils/filterQuery';
import { Review } from '../reviews/reviews.entity';
import { createProductDTO } from './dto/create-product.dto';
import { updateProductDTO } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private userService: UserService,
  ) {}

  /**
   * get all products
   * @returns products
   */
  public async getAll(
    page: number,
    name?: string,
    minPrice?: string,
    maxPrice?: string,
    category?: string,
  ): Promise<{
    results: number;
    products: Product[];
  }> {
    const limitResult = 10;
    const [products] =
      await this.productsRepository.findAndCount({
        where: filterObj(name, minPrice, maxPrice, category),
        skip: (page - 1) * limitResult,
        take: limitResult,
      });
    return { results: products.length, products };
  }

  /**
   * get product by id
   * @param id id of the product
   * @returns product
   */
  public async getOneBy(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { user: true, reviews: true },
    });
    if (!product) {
      throw new NotFoundException('Product is not found');
    }
    return product;
  }

  /**
   *
   * @param dto Data for create product
   * @param id id of  user create product (Admin)
   * @returns product
   */
  public async createOne(
    dto: createProductDTO,
    userID: number,
  ): Promise<Product> {
    const user = await this.userService.getCurrentUser(userID);
    const product = this.productsRepository.create({
      ...dto,
      name: dto.name.toLowerCase(),
      user,
    });
    return await this.productsRepository.save(product);
  }

  /**
   * update product by id
   * @param id id of the product
   * @param dto data for update product
   * @returns updated product
   */
  public async updateOneBy(
    id: number,
    dto: updateProductDTO,
  ): Promise<Product> {
    const product = await this.getOneBy(id);
    product.name = dto.name ?? product.name;
    product.price = dto.price ?? product.price;
    product.description = dto.description ?? product.description;

    return await this.productsRepository.save(product);
  }
  /**
   * delete product by id
   * @param id id of the product
   * @returns success message
   */
  public async deleteOneBy(id: number) {
    const product = await this.getOneBy(id);
    await this.productsRepository.remove(product);
  }

  async getProductRating(productId: number) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'averageRating')
      .addSelect('COUNT(review.id)', 'ratingsCount')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    return {
      averageRating: Number(result.averageRating) || 0,
      ratingsCount: Number(result.ratingsCount) || 0,
    };
  }
}
