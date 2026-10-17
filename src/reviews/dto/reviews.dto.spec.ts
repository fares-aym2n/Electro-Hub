import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { createReviewDTO } from './create-reviews.dto';
import { updateReviewDTO } from './upate-review.dto';

describe('Reviews DTOs', () => {
  describe('createReviewDTO', () => {
    it('should validate valid review dto', async () => {
      const dto = plainToInstance(createReviewDTO, {
        review: 'Great product',
        rating: 4.5,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid half-star ratings', async () => {
      for (const val of [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]) {
        const dto = plainToInstance(createReviewDTO, {
          review: 'Valid rating',
          rating: val,
        });
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject invalid decimal increments such as 3.7 or 4.2', async () => {
      for (const val of [0.5, 3.7, 4.2, 5.5, 0]) {
        const dto = plainToInstance(createReviewDTO, {
          review: 'Invalid increment',
          rating: val,
        });
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('rating');
      }
    });

    it('should fail validation when rating is less than 1', async () => {
      const dto = plainToInstance(createReviewDTO, {
        review: 'Bad product',
        rating: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('rating');
    });

    it('should fail validation when rating is greater than 5', async () => {
      const dto = plainToInstance(createReviewDTO, {
        review: 'Bad product',
        rating: 6,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('rating');
    });

    it('should fail validation when review is empty', async () => {
      const dto = plainToInstance(createReviewDTO, {
        review: '',
        rating: 3,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('updateReviewDTO', () => {
    it('should validate empty update dto because all fields are optional', async () => {
      const dto = plainToInstance(updateReviewDTO, {});

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate valid partial update', async () => {
      const dto = plainToInstance(updateReviewDTO, {
        rating: 4,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when updated rating is out of bounds', async () => {
      const dto = plainToInstance(updateReviewDTO, {
        rating: 10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('rating');
    });
  });
});
