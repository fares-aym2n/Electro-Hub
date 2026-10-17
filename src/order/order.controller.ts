import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CurrentUser } from '../users/decorators/auth.decorator';
import type { payloadTypes } from '../utils/payload';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthRolesGuard } from '../users/guards/auth-role.guard';
import { Roles } from '../users/decorators/user-roles.decorator';
import { UserTypes } from '../utils/user-types';
import { ApiOperation, ApiSecurity } from '@nestjs/swagger';

@Controller('/api/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/checkout')
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER, UserTypes.ADMIN)
  @ApiSecurity('bearer')
  createOrder(
    @CurrentUser() payload: payloadTypes,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(payload.id, dto);
  }

  @Get('my-orders')
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER, UserTypes.ADMIN)
  @ApiSecurity('bearer')
  getMyOrders(@CurrentUser() payload: payloadTypes) {
    return this.orderService.getMyOrders(payload.id);
  }

  @Get(':orderId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.ADMIN)
  @ApiOperation({
    summary: 'Get Order Details by Order ID (Admin Only)',
  })
  @ApiSecurity('bearer')
  getOrderById(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.orderService.getOrderById(orderId);
  }
}
