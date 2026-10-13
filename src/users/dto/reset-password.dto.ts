import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class resetPasswordDTO {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  public userId: number;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  public resetPasswordToken: string;
  @Length(5, 150)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'test1234' })
  public newPassword: string;
}
