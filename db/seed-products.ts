
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import dataSource from './data-source.js';
import { Product } from '../src/products/entities/products.entity.js';
import { User } from '../src/users/entities/users.entity.js';
import { Category } from '../src/categories/entities/category.entity.js';

async function seedProducts() {
  try {
    await dataSource.initialize();

    const fileContent = await readFile(
      resolve(process.cwd(), 'data.json'),
      'utf-8',
    );

    const data = JSON.parse(fileContent);

    const productRepository = dataSource.getRepository(Product);
    const userRepository = dataSource.getRepository(User);
    const categoryRepository = dataSource.getRepository(Category);

    // Map original emails to the transformed emails used in seed-users.ts
    const emailMap = new Map<string, string>();
    const usedEmails = new Set<string>();

    for (const userData of data.users) {
      const baseName = userData.username
        .split(/[_\s.-]/)[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      let email = `${baseName}@gmail.com`;
      let suffix = 1;

      while (usedEmails.has(email)) {
        email = `${baseName}${suffix}@gmail.com`;
        suffix++;
      }

      usedEmails.add(email);
      emailMap.set(userData.email, email);
    }

    let insertedCount = 0;

    for (const relation of data.relationships.products) {
      const productData = data.products[relation.productIndex];

      if (!productData) {
        throw new Error(
          `Product not found at index ${relation.productIndex}`,
        );
      }

      const existingProduct = await productRepository.findOneBy({
        name: productData.name,
      });

      if (existingProduct) continue;

      const category = await categoryRepository.findOneBy({
        slug: relation.categorySlug,
      });

      if (!category) {
        throw new Error(
          `Category not found: ${relation.categorySlug}`,
        );
      }

      const transformedEmail = emailMap.get(relation.creatorEmail);

      if (!transformedEmail) {
        throw new Error(
          `Creator email not found: ${relation.creatorEmail}`,
        );
      }

      const creator = await userRepository.findOneBy({
        email: transformedEmail,
      });

      if (!creator) {
        throw new Error(
          `Creator not found in database: ${transformedEmail}`,
        );
      }

      const product = productRepository.create({
        ...productData,
        averageRating: 0,
        ratingsCount: 0,
        category,
        user: creator,
      });

      await productRepository.save(product);
      insertedCount++;
    }

    console.log(`Products seeded successfully: ${insertedCount}`);
  } catch (error) {
    console.error('Failed to seed products:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seedProducts();
