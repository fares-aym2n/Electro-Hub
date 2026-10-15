import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty({ type: 'number', example: 3 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quantity: number;
}
