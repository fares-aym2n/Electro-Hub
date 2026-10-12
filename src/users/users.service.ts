import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { registerTDO } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { loginTDO } from './dto/login.dto';
import { payloadTypes } from '../utils/payload';
import { updateTDO } from './dto/update.dto';
import { AuthService } from './auth.service';
import { forgotPasswordDTO } from './dto/forgot-password.dto';
import { resetPasswordDTO } from './dto/reset-password.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Create new user
   * @param  registerTDO for create user
   * @returns JWT
   */
  public async register(registerTDO: registerTDO) {
    return this.authService.register(registerTDO);
  }

  /**
   *Login user
   * @param loginTDO data for login user
   * @returns JWT
   */
  public async login(loginTDO: loginTDO) {
    return this.authService.login(loginTDO);
  }

  /**
   * Get all users
   * @returns all users
   */
  public async getAll() {
    const users = await this.userRepository.find();
    return {
      results: users.length,
      users,
    };
  }

  /**
   * Get current user
   * @param id id from payload token
   * @returns current user
   */
  public async getCurrentUser(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User is not found');
    }
    return user;
  }

  /**
   * Update the user
   * @param id id from payload token
   * @param dto  data for update user
   * @returns updated user
   */
  public async update(
    id: number,
    dto: updateTDO,
  ): Promise<User> {
    const { username, password } = dto;
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User is not found');
    }

    user.password =
      (await this.authService.hashePassword(password)) ??
      user.password;
    user.username = username ?? user.username;
    return this.userRepository.save(user);
  }

  /**
   *
   * @param payload payload from JWT
   * @param id id of user you want to delete
   * @returns success message
   */
  public async delete(
    payload: payloadTypes,
    id: number,
  ): Promise<string> {
    const user = await this.getCurrentUser(id);

    if (user?.id === payload.id || payload.role === 'admin') {
      await this.userRepository.remove(user);
      return 'User deleted successfuly';
    }
    throw new ForbiddenException(
      'Access denied. You are not allawed',
    );
  }

  /**
   *
   * @param id id of the looged in user
   * @returns profile image path
   */
  public async getProfileImage(id: number): Promise<string> {
    const user = await this.getCurrentUser(id);

    if (!user.profile_image) {
      throw new NotFoundException(
        'The profile image is not found',
      );
    }
    return user.profile_image;
  }

  /**
   *
   * @param id id of the looged in user
   * @param profileImage profile image
   * @returns user
   */
  public async setProfileImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<User> {
    if (!file) {
      throw new BadRequestException('Profile image is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Only image files are allowed',
      );
    }

    const user = await this.getCurrentUser(id);

    // Upload the new image first.
    const newImageUrl =
      await this.cloudinaryService.uploadImage(file);
    const oldImageUrl = user.profile_image;

    user.profile_image = newImageUrl;

    try {
      const savedUser = await this.userRepository.save(user);

      // Delete the old Cloudinary image after saving the new URL.
      if (oldImageUrl && oldImageUrl !== newImageUrl) {
        try {
          await this.cloudinaryService.deleteImage(oldImageUrl);
        } catch {
          // The new image is saved; a failed old-image deletion
          // should not undo the successful update.
        }
      }

      return savedUser;
    } catch (error) {
      // Avoid leaving the newly uploaded image behind if saving fails.
      try {
        await this.cloudinaryService.deleteImage(newImageUrl);
      } catch {
        // Keep the original database error.
      }

      throw error;
    }
  }

  /**
   *
   * @param id id of the logged in user
   * @returns success message
   */
  public async deleteProfileImage(id: number): Promise<string> {
    const user = await this.getCurrentUser(id);

    if (!user.profile_image) {
      throw new BadRequestException(
        'The image is already removed',
      );
    }

    const imageUrl = user.profile_image;

    // Clear the database reference first.
    user.profile_image = null;
    await this.userRepository.save(user);

    try {
      await this.cloudinaryService.deleteImage(imageUrl);
    } catch {
      // The database reference is cleared, but the Cloudinary
      // asset may need manual cleanup if deletion fails.
    }

    return 'Image removed successfully';
  }

  public async verifyEmail(
    userId: number,
    verificationToken: string,
  ): Promise<boolean> {
    const user = await this.getCurrentUser(userId);

    if (user.verificationToken === null) {
      throw new NotFoundException(
        'The verificationToken is not provided.',
      );
    }

    if (user.verificationToken !== verificationToken) {
      throw new BadRequestException(
        'The verificationToken is invalid.',
      );
    }

    user.isEmailValidation = true;
    user.verificationToken = null;

    await this.userRepository.save(user);

    return true;
  }

  /**
   * send Reset Password Email
   * @param email user emil
   * @returns success message
   */
  public sendResetPassword(body: forgotPasswordDTO) {
    return this.authService.sendResetPasswordLink(body);
  }
  /**
   * get reset password link
   * @param userId user id from the link
   * @param resetPasswordToken reset password token from the link
   * @returns success message
   */

  public getResetPassword(
    userId: number,
    resetPasswordToken: string,
  ) {
    return this.authService.getResetPasswordLink(
      userId,
      resetPasswordToken,
    );
  }
  /**
   * Reset the password
   * @param dto data for the reset password
   * @returns a success message
   */
  public resetPassword(dto: resetPasswordDTO) {
    return this.authService.resetPassword(dto);
  }
}
