import { Category } from '../src/categories/entities/category.entity.js';
import dataSource from './data-source.js';

const categoriesData = [
  { name: 'Smartphones', slug: 'smartphones' },
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Tablets', slug: 'tablets' },
  { name: 'Monitors', slug: 'monitors' },
  { name: 'Headphones', slug: 'headphones' },
  { name: 'Keyboards', slug: 'keyboards' },
  { name: 'Computer Mice', slug: 'computer-mice' },
  { name: 'Gaming Consoles', slug: 'gaming-consoles' },
  { name: 'Smartwatches', slug: 'smartwatches' },
  { name: 'Accessories', slug: 'accessories' },
];

async function seedCategories() {
  try {
    await dataSource.initialize();

    const categoryRepository =
      dataSource.getRepository(Category);

    for (const categoryData of categoriesData) {
      const exists = await categoryRepository.findOneBy({
        slug: categoryData.slug,
      });

      if (!exists) {
        await categoryRepository.save(categoryData);
      }
    }

    console.log('Categories seeded successfully');
  } catch (error) {
    console.error('Failed to seed categories:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seedCategories();
