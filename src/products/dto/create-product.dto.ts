import {
  Length,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  MinLength,
  IsInt,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class createProductDTO {
  @IsString()
  @Length(3, 150)
  @IsNotEmpty()
  @ApiProperty({ example: 'Gaming Laptop' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @ApiProperty({ example: 'High-performance gaming laptop' })
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(5)
  @ApiProperty({ example: 1500 })
  price: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 500)
  @ApiProperty({
    example: 'https://example.com/laptop.jpg',
  })
  image: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({ example: 10, default: 0 })
  stockQuantity?: number;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ example: true, default: true })
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ example: false, default: false })
  isFeatured?: boolean;

  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 1,
    description: 'ID of an existing category',
  })
  categoryId: number;
}
