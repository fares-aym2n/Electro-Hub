import {
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Length,
} from 'class-validator';
import { paymentMethod } from '../../utils/payment-method';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsEnum(paymentMethod)
  @ApiProperty({ example: 'card' })
  paymentMethod: paymentMethod;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  @ApiProperty({ example: 'Ahmad Mohamed' })
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 255)
  @ApiProperty({ example: '22 Elgezera street' })
  shippingAddress: string;
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  @ApiProperty({ example: 'El Mahalla' })
  city: string;
  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty({ example: '+201051987326' })
  phoneNumber: string;
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @ApiProperty({ example: 'Egypt' })
  country: string;
}
