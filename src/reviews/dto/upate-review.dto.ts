import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ALLOWED_RATINGS } from './create-reviews.dto';

export class updateReviewDTO {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'I like it' })
  review?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsIn(ALLOWED_RATINGS, {
    message: 'Rating must be between 1 and 5 in increments of 0.5 (e.g., 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)',
  })
  @ApiPropertyOptional({ example: 4.5 })
  rating?: number;
}
