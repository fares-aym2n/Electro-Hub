import {
  Length,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  MinLength,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class updateProductDTO {
  @IsString()
  @Length(3, 150)
  @IsNotEmpty()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Gaming Laptop' })
  name?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @IsOptional()
  @ApiPropertyOptional({
    example: 'High-performance gaming laptop',
  })
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(5)
  @IsOptional()
  @ApiPropertyOptional({ example: 1500 })
  price?: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  @IsOptional()
  @ApiPropertyOptional({
    example: 'https://example.com/laptop.jpg',
  })
  image?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({ example: 10 })
  stockQuantity?: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ example: false })
  isFeatured?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    example: 2,
    description: 'ID of an existing category',
  })
  categoryId?: number;

  @IsInt()
  @ApiPropertyOptional({
    example: 30,
    description: 'Precision of the discount',
  })
  discount?: number;
}
