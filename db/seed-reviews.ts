
import { Product } from '../src/products/products.entity.js';
import { Review } from '../src/reviews/reviews.entity.js';
import { User } from '../src/users/users.entity.js';
import dataSource from './data-source.js';

function getReviewTemplates(categoryName: string): string[] {
  const category = categoryName.toLowerCase();

  if (category.includes('smartphone')) {
    return [
      'Excellent camera and smooth performance.',
      'Battery life could be better, but overall it is good.',
      'Great screen and responsive apps.',
    ];
  }

  if (category.includes('laptop')) {
    return [
      'Fast and reliable for daily work.',
      'Good performance, but it gets warm under heavy use.',
      'Excellent display and build quality.',
    ];
  }

  if (category.includes('tablet')) {
    return [
      'Great for studying and watching videos.',
      'Good screen, but charging is a little slow.',
      'Lightweight and easy to use.',
    ];
  }

  if (category.includes('monitor')) {
    return [
      'Sharp picture and smooth refresh rate.',
      'Good colors, but brightness needs adjustment.',
      'Excellent for work and gaming.',
    ];
  }

  if (category.includes('headphone')) {
    return [
      'Clear sound and comfortable fit.',
      'Good audio, but noise cancellation could improve.',
      'Great sound quality for everyday use.',
    ];
  }

  if (category.includes('keyboard')) {
    return [
      'Comfortable keys and great typing feedback.',
      'Good keyboard, but it is a little noisy.',
      'Solid build and responsive keys.',
    ];
  }

  if (category.includes('mouse')) {
    return [
      'Accurate sensor and comfortable grip.',
      'Works well, but the size takes some getting used to.',
      'Smooth tracking and responsive clicks.',
    ];
  }

  if (category.includes('gaming console')) {
    return [
      'Great graphics and fast loading times.',
      'Good gaming experience, but games are expensive.',
      'Smooth gameplay and responsive controls.',
    ];
  }

  if (category.includes('smartwatch')) {
    return [
      'Useful features and a bright display.',
      'Good watch, but battery life could improve.',
      'Comfortable and easy to use.',
    ];
  }

  return [
    'Useful product with good build quality.',
    'Works well, but there is room for improvement.',
    'Good quality and practical design.',
  ];
}

async function seedReviews() {
  try {
    await dataSource.initialize();

    const productRepository = dataSource.getRepository(Product);
    const userRepository = dataSource.getRepository(User);
    const reviewRepository = dataSource.getRepository(Review);

    const products = await productRepository.find({
      relations: { category: true },
      order: { id: 'ASC' },
      take: 50,
    });

    const users = await userRepository.find({
      order: { id: 'ASC' },
      take: 50,
    });

    if (products.length !== 50 || users.length !== 50) {
      throw new Error(
        `Expected 50 products and 50 users. Found ${products.length} products and ${users.length} users.`,
      );
    }

    // Different ratings to create more realistic averages.
    const ratings = [
      5, 2, 4, 3, 5, 1, 4, 5, 2, 3,
      4, 5, 2, 4, 3, 5, 1, 4, 3, 5,
      2, 4, 5, 3, 4, 1, 5, 2, 4, 3,
      5, 4, 2, 5, 3, 4, 1, 5, 3, 4,
      2, 5, 4, 3, 5, 2, 4, 1, 5, 3,
    ];

    let insertedCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const templates = getReviewTemplates(
        product.category?.name ?? '',
      );

      // Start with a user not used by the previous four-review pattern.
      let selectedUser: User | undefined;

      for (let offset = 0; offset < users.length; offset++) {
        const userIndex = (i * 4 + 4 + offset) % users.length;
        const candidate = users[userIndex];

        const existingReview = await reviewRepository.findOne({
          where: {
            product: { id: product.id },
            user: { id: candidate.id },
          },
        });

        if (!existingReview) {
          selectedUser = candidate;
          break;
        }
      }

      if (!selectedUser) {
        console.warn(
          `Skipped product "${product.name}": all users have reviewed it.`,
        );
        continue;
      }

      const rating = ratings[i];
      const reviewText = templates[i % templates.length];

      const review = reviewRepository.create({
        review: reviewText,
        rating,
        product,
        user: selectedUser,
      });

      await reviewRepository.save(review);
      insertedCount++;
    }

    // Recalculate ratings using all existing and newly inserted reviews.
    for (const product of products) {
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
    console.log('Product ratings recalculated successfully.');
  } catch (error) {
    console.error('Failed to seed reviews:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seedReviews();
