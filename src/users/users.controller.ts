import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  Res,
  UseGuards,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';

import { UserService } from './users.service';
import { registerTDO } from './dto/register.dto';
import { loginTDO } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import type { payloadTypes } from '../utils/payload';
import { CurrentUser } from './decorators/auth.decorator';
import { Roles } from './decorators/user-roles.decorator';
import { UserTypes } from '../utils/user-types';
import { AuthRolesGuard } from './guards/auth-role.guard';
import { updateTDO } from './dto/update.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { resetPasswordDTO } from './dto/reset-password.dto';
import {
  ApiSecurity,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { uploadImageDTO } from './dto/upload-image.dto';
import { join } from 'node:path';
import { memoryStorage } from 'multer';
import {
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { forgotPasswordDTO } from './dto/forgot-password.dto';

@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST: ~/api/users/auth/register
  @Post('/auth/register')
  public register(@Body() body: registerTDO) {
    return this.userService.register(body);
  }

  // POST: ~/api/users/auth/login
  @HttpCode(200)
  @Post('/auth/login')
  public async login(
    @Body() body: loginTDO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.userService.login(body);

    if ('token' in result) {
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }
    return result;
  }

  // GET: ~/api/users/auth/verify-email/:userId/:verificationToken
  @Get('/auth/verify-email/:userId/:verificationToken')
  public async verificationEmail(
    @Param('userId') userId: string,
    @Param('verificationToken') verificationToken: string,
    @Res() res: Response,
  ) {
    const isVerified = await this.userService.verifyEmail(
      Number(userId),
      verificationToken,
    );

    if (!isVerified) {
      throw new NotFoundException('Invalid verification link');
    }

    return res.sendFile(
      join(process.cwd(), 'public', 'email-verified.html'),
    );
  }

  // POST: ~/api/users/reset-password
  @Post('reset-password')
  public resetPassword(
    p0: number,
    p1: string,
    @Body()
    body: resetPasswordDTO,
  ) {
    return this.userService.resetPassword(body);
  }

  // GET: ~/api/users/me
  @Get('/me')
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  public getMe(@CurrentUser() payload: payloadTypes) {
    return this.userService.getCurrentUser(payload.id);
  }

  // GET: ~/api/users
  @Get()
  @UseGuards(AuthRolesGuard)
  @Roles(UserTypes.ADMIN)
  @ApiSecurity('bearer')
  public getAllUsers() {
    return this.userService.getAll();
  }

  // PATCH: ~/api/users/me
  @Patch('/me')
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  public updateMe(
    @CurrentUser() payload: payloadTypes,
    @Body() body: updateTDO,
  ) {
    return this.userService.update(payload.id, body);
  }

  // GET: ~/api/users/me/profile-image
  @Get('/me/profile-image')
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  public async getProfile(
    @CurrentUser() payload: payloadTypes,
    @Res() res: Response,
  ) {
    const imageUrl = await this.userService.getProfileImage(
      payload.id,
    );

    return res.redirect(imageUrl);
  }

  // POST: ~/api/users/me/upload_image
  @Post('/me/upload_image')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('profile_image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiSecurity('bearer')
  @ApiBody({ type: uploadImageDTO })
  @ApiConsumes('multipart/form-data')
  public uploadProfileImage(
    @CurrentUser() payload: payloadTypes,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp|gif)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.setProfileImage(payload.id, file);
  }

  // DELETE: ~/api/users/me/profile-image
  @Delete('/me/profile-image')
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  public removeImageProfile(
    @CurrentUser() payload: payloadTypes,
  ) {
    return this.userService.deleteProfileImage(payload.id);
  }

  // DELETE: ~/api/users/:id
  @Delete('/:id')
  @UseGuards(AuthGuard)
  @ApiSecurity('bearer')
  public deleteUser(
    @CurrentUser() payload: payloadTypes,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userService.delete(payload, id);
  }
}
