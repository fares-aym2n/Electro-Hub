import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export const ALLOWED_RATINGS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export class createReviewDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'I like it' })
  review: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsIn(ALLOWED_RATINGS, {
    message: 'Rating must be between 1 and 5 in increments of 0.5 (e.g., 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)',
  })
  @ApiProperty({ example: 4.5 })
  rating: number;
}
