import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product } from './entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../users/users.service';
import { filterObj } from '../utils/filterQuery';
import { createProductDTO } from './dto/create-product.dto';
import { updateProductDTO } from './dto/update-product.dto';
import { Review } from '../reviews/entities/reviews.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
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
    discount?: string,
  ): Promise<{
    results: number;
    products: Product[];
  }> {
    const limitResult = 10;
    const products = await this.productsRepository.find({
      where: filterObj(
        name,
        minPrice,
        maxPrice,
        category,
        discount,
      ),
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
    categorySlug: string,
    userID: number,
  ): Promise<Product> {
    const user = await this.userService.getCurrentUser(userID);
    const category = await this.categoryRepository.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      throw new NotFoundException('Not category have this slug');
    }
    const product = this.productsRepository.create({
      ...dto,
      name: dto.name.toLowerCase(),
      category: { id: category.id },
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
  public async updateRating(
    productId: number,
    averageRating: number,
    ratingsCount: number,
  ) {
    await this.productsRepository.update(productId, {
      averageRating: averageRating,
      ratingsCount,
    });
  }
}
