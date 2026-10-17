import {
  Controller,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createReviewDTO } from './dto/create-reviews.dto';
import { UserService } from '../users/users.service';
import { ProductService } from '../products/products.service';
import { updateReviewDTO } from './dto/upate-review.dto';
import { payloadTypes } from '../utils/payload';
import { UserTypes } from '../utils/user-types';
import { Review } from './entities/reviews.entity';

@Injectable()
@Controller()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private userService: UserService,
    private productService: ProductService,
  ) {}

  /**
   * get all reviews
   * @returns reviews
   */
  public async getAll(productId: number): Promise<{
    result: number;
    reviews: Review[];
  }> {
    const reviews = await this.reviewRepository.find({
      order: { createdAt: 'DESC' },
      where: productId ? { product: { id: productId } } : {},
    });
    return {
      result: reviews.length,
      reviews,
    };
  }

  /**
   * get reviews by id
   * @param id id of the reveiw
   * @returns review
   */

  public async getOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: {
        user: true,
        product: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review is not found');
    }

    return review;
  }

  /**
   *
   * @param dto data for create review
   * @param userId userId from JWt
   * @param productId productID
   * @returns review
   */
  public async createReview(
    dto: createReviewDTO,
    userId: number,
    productId: number,
  ) {
    const user = await this.userService.getCurrentUser(userId);
    const product =
      await this.productService.getOneBy(productId);

    const newReview = this.reviewRepository.create({
      ...dto,
      user,
      product,
    });

    const savedReview =
      await this.reviewRepository.save(newReview);

    await this.refreshProductRating(productId);

    return savedReview;
  }
  /**
   * Update review
   * @param reviewId
   * @param dto for update review
   * @param userId
   * @returns updated review
   */
  public async update(
    reviewId: number,
    userId: number,
    dto: updateReviewDTO,
  ) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
      relations: {
        user: true,
        product: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review is not found');
    }
    if (review.user.id !== userId) {
      throw new ForbiddenException(
        'You are not allawed to update review',
      );
    }
    review.review = dto.review ?? review.review;
    if (dto.rating !== undefined) {
      review.rating = Number(dto.rating);
    }
    const updatedReview =
      await this.reviewRepository.save(review);
    if (review.product?.id) {
      await this.refreshProductRating(review.product.id);
    }
    return updatedReview;
  }
  /**
   * Delete review
   * @param reviewId
   * @param userId
   * @returns success message
   */
  public async delete(reviewId: number, payload: payloadTypes) {
    const review = await this.getOne(reviewId);
    if (
      review.user.id === payload.id ||
      payload.role == UserTypes.ADMIN
    ) {
      const productId = review.product?.id;

      await this.reviewRepository.remove(review);
      if (productId) {
        await this.refreshProductRating(productId);
      }
      return 0;
    }
    throw new ForbiddenException(
      'You are not allawed to update review',
    );
  }
  private async refreshProductRating(productId: number) {
    const { averageRating, ratingsCount } =
      await this.productService.getProductRating(productId);

    await this.productService.updateRating(
      productId,
      averageRating,
      ratingsCount,
    );
  }
}
