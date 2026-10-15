import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add_cart-item.dto';
import { CurrentUser } from '../users/decorators/auth.decorator';
import { Roles } from '../users/decorators/user-roles.decorator';
import { UserTypes } from '../utils/user-types';
import type { payloadTypes } from '../utils/payload';
import { updateCartItemDto } from './dto/update-cart.dto';
import {ApiSecurity } from '@nestjs/swagger';
import { AuthRolesGuard } from '../users/guards/auth-role.guard';

@Controller('/api/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET: ~/api/carts/:id
  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER)
  @ApiSecurity('bearer')
  findCart(@CurrentUser() payload: payloadTypes) {
    return this.cartService.getCart(payload.id);
  }

  // POST: ~/api/carts/:productId
  @Post('/:productId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER)
  @ApiSecurity('bearer')
  addItem(
    @CurrentUser() payload: payloadTypes,
    @Body() dto: AddCartItemDto,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.addItemToCart(
      payload.id,
      productId,
      dto.quantity,
    );
  }

  // PATCH: ~/api/carts/:productId
  @Patch('/:productId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER)
  @ApiSecurity('bearer')
  updateCartItem(
    @CurrentUser() payload: payloadTypes,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: updateCartItemDto,
  ) {
    return this.cartService.updateItemCart(
      payload.id,
      productId,
      dto.quantity,
    );
  }

  // DELETE: ~/api/carts/:productId

  @Delete('/:productId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER)
  @ApiSecurity('bearer')
  deleteItem(
    @CurrentUser() payload: payloadTypes,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.deleteItemFromCart(
      payload.id,
      productId,
    );
  }

  // DELETE: ~/api/carts
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER)
  @ApiSecurity('bearer')
  @Delete()
  clearCart(@CurrentUser() payload: payloadTypes) {
    return this.cartService.clearCart(payload.id);
  }
}
