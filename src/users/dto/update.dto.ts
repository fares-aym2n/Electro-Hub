import { IsOptional, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class updateTDO {
  @IsOptional()
  @Length(2, 150)
  @ApiPropertyOptional({ example: 'test-user' })
  username?: string;

  @IsOptional()
  @Length(5, 150)
  @ApiPropertyOptional({ example: 'test1234' })
  password?: string;
}