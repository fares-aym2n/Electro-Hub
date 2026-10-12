import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Laptop' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;
  @ApiProperty({ example: 'laptop' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 120)
  slug: string;
}
