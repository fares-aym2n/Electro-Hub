
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import bcrypt from 'bcryptjs';

import dataSource from './data-source.js';
import { User } from '../src/users/users.entity.js';

async function seedUsers() {
  try {
    await dataSource.initialize();

    const fileContent = await readFile(
      resolve(process.cwd(), 'data.json'),
      'utf-8',
    );

    const data = JSON.parse(fileContent);
    const userRepository = dataSource.getRepository(User);

    const usedEmails = new Set<string>();
    let insertedCount = 0;

    for (const userData of data.users) {
      // استخدم أول جزء من username كاسم للإيميل.
      const baseName = userData.username
        .split(/[_\s.-]/)[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      let email = `${baseName}@gmail.com`;
      let suffix = 1;

      // منع تكرار الإيميلات بين المستخدمين في نفس الملف.
      while (usedEmails.has(email)) {
        email = `${baseName}${suffix}@gmail.com`;
        suffix++;
      }

      usedEmails.add(email);

      // منع إضافة مستخدم موجود بالفعل.
      const existingUser = await userRepository.findOneBy({
        email,
      });

      if (existingUser) {
        continue;
      }

      const hashedPassword = await bcrypt.hash(
        userData.password,
        12,
      );

      const user = userRepository.create({
        ...userData,
        email,
        password: hashedPassword,
      });

      await userRepository.save(user);
      insertedCount++;
    }

    console.log(`Users seeded successfully: ${insertedCount}`);
  } catch (error) {
    console.error('Failed to seed users:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seedUsers();
