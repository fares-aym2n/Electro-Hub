import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { WhitelistService } from './whitelist.service';
import { CurrentUser } from '../users/decorators/auth.decorator';
import type { payloadTypes } from '../utils/payload';
import { AuthRolesGuard } from '../users/guards/auth-role.guard';
import { ApiSecurity } from '@nestjs/swagger';
import { UserTypes } from '../utils/user-types';
import { Roles } from '../users/decorators/user-roles.decorator';

@Controller('/api/whitelist')
export class WhitelistController {
  constructor(
    private readonly whitelistService: WhitelistService,
  ) {}
  // POST: ~/api/whitelist/:productId
  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER, UserTypes.ADMIN)
  @ApiSecurity('bearer')
  getMyWhiteist(@CurrentUser() payload: payloadTypes) {
    return this.whitelistService.getMyWhitelist(payload.id);
  }

  // POST: ~/api/whiteList/:productId
  @Post('/:productId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER, UserTypes.ADMIN)
  @ApiSecurity('bearer')
  addProductToWhitelist(
    @CurrentUser() payload: payloadTypes,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.whitelistService.addProductToWhitelist(
      payload.id,
      productId,
    );
  }

  @HttpCode(204)
  @Delete('/:productId')
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.USER, UserTypes.ADMIN)
  @ApiSecurity('bearer')
  remove(
    @CurrentUser() payload: payloadTypes,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.whitelistService.deleteProductFromWhitelist(
      payload.id,
      productId,
    );
  }
}
