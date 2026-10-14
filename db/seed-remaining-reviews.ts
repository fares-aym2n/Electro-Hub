import { Product } from '../src/products/entities/products.entity.js';
import { Review } from '../src/reviews/entities/reviews.entity.js';
import { User } from '../src/users/entities/users.entity.js';
import dataSource from './data-source.js';

function getReviewText(
  categoryName: string,
  index: number,
): string {
  const category = categoryName.toLowerCase();

  const templates: Record<string, string[]> = {
    smartphone: [
      'Great camera and smooth performance.',
      'Good phone, but battery life could improve.',
      'Excellent screen and responsive apps.',
      'Reliable for everyday use.',
    ],
    laptop: [
      'Fast performance and excellent build quality.',
      'Good laptop, but it gets warm under load.',
      'Great display and smooth multitasking.',
      'Battery life could be better.',
    ],
    tablet: [
      'Great screen for studying and entertainment.',
      'Lightweight and easy to use.',
      'Good tablet, but charging is slow.',
      'Excellent for reading and browsing.',
    ],
    monitor: [
      'Sharp image and smooth refresh rate.',
      'Good colors, but brightness needs adjustment.',
      'Excellent for work and gaming.',
      'Picture quality is better than expected.',
    ],
    headphone: [
      'Clear sound and comfortable fit.',
      'Good audio, but noise cancellation could improve.',
      'Great sound quality for daily use.',
      'Comfortable with impressive battery life.',
    ],
    keyboard: [
      'Comfortable keys and satisfying typing.',
      'Good keyboard, but it is a little noisy.',
      'Responsive keys and solid build quality.',
      'Great for long typing sessions.',
    ],
    mouse: [
      'Accurate tracking and comfortable grip.',
      'Smooth movement, but the size takes getting used to.',
      'Responsive clicks and reliable performance.',
      'Good mouse for work and gaming.',
    ],
    'gaming console': [
      'Great graphics and fast loading times.',
      'Good console, but games are expensive.',
      'Smooth gameplay and responsive controls.',
      'Excellent gaming experience.',
    ],
    smartwatch: [
      'Useful features and a bright display.',
      'Good watch, but battery life could improve.',
      'Comfortable and easy to use.',
      'Accurate tracking and clean design.',
    ],
  };

  const key = Object.keys(templates).find((name) =>
    category.includes(name),
  );

  const options = key
    ? templates[key]
    : [
        'Good quality and practical design.',
        'Works well, but there is room for improvement.',
        'Useful product with solid build quality.',
        'Good performance for everyday use.',
      ];

  return options[index % options.length];
}

async function seedRemainingReviews() {
  try {
    await dataSource.initialize();

    const productRepository = dataSource.getRepository(Product);
    const userRepository = dataSource.getRepository(User);
    const reviewRepository = dataSource.getRepository(Review);

    const users = await userRepository.find({
      order: { id: 'ASC' },
    });

    if (users.length !== 50) {
      throw new Error(
        `Expected 50 users, found ${users.length}.`,
      );
    }

    // Select products that currently have no reviews.
    const productsWithoutReviews = await productRepository
      .createQueryBuilder('product')
      .leftJoin('product.reviews', 'review')
      .leftJoinAndSelect('product.category', 'category')
      .where('review.id IS NULL')
      .orderBy('product.id', 'ASC')
      .getMany();

    if (productsWithoutReviews.length !== 20) {
      throw new Error(
        `Expected 20 products without reviews, found ${productsWithoutReviews.length}.`,
      );
    }

    // 50 ratings with varied distributions, assigned across 20 products.
    const ratingSets = [
      [5, 5, 5, 4],
      [3, 3, 4],
      [5, 4, 5],
      [2, 4, 3],
      [5, 5, 4],
      [3, 5, 4],
      [2, 2, 4],
      [5, 4, 3],
      [4, 4, 5],
      [1, 3, 4],
      [5, 5, 5],
      [3, 4, 2],
      [4, 5, 4],
      [2, 3, 5],
      [5, 4, 4],
      [3, 3, 5],
      [1, 4, 3],
      [5, 5, 3],
      [4, 2, 4],
      [5, 3, 4],
    ];

    let insertedCount = 0;
    let userCursor = 0;

    for (let i = 0; i < productsWithoutReviews.length; i++) {
      const product = productsWithoutReviews[i];
      const ratings = ratingSets[i];

      for (let j = 0; j < ratings.length; j++) {
        // Find a user who has not reviewed this product yet.
        let selectedUser: User | undefined;

        for (
          let attempt = 0;
          attempt < users.length;
          attempt++
        ) {
          const candidate = users[userCursor % users.length];
          userCursor++;

          const exists = await reviewRepository.findOne({
            where: {
              product: { id: product.id },
              user: { id: candidate.id },
            },
          });

          if (!exists) {
            selectedUser = candidate;
            break;
          }
        }

        if (!selectedUser) {
          throw new Error(
            `No available reviewer for product "${product.name}".`,
          );
        }

        const review = reviewRepository.create({
          product,
          user: selectedUser,
          rating: ratings[j],
          review: getReviewText(
            product.category?.name ?? '',
            i + j,
          ),
        });

        await reviewRepository.save(review);
        insertedCount++;
      }
    }

    // Recalculate count and average for all 70 products.
    const allProducts = await productRepository.find();

    for (const product of allProducts) {
      const stats = await reviewRepository
        .createQueryBuilder('review')
        .select('COUNT(review.id)', 'count')
        .addSelect('AVG(review.rating)', 'average')
        .where('review.productId = :productId', {
          productId: product.id,
        })
        .getRawOne<{ count: string; average: string | null }>();

      await productRepository.update(product.id, {
        ratingsCount: Number(stats?.count ?? 0),
        averageRating: Number(
          Number(stats?.average ?? 0).toFixed(1),
        ),
      });
    }

    console.log(`New reviews inserted: ${insertedCount}`);
    console.log('Ratings recalculated for all products.');
  } catch (error) {
    console.error('Failed to seed remaining reviews:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seedRemainingReviews();
