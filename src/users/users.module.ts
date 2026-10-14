import { Module } from '@nestjs/common';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { MailModule } from '../mails/mail.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [UserController],
  providers: [UserService, AuthService],
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<StringValue>('JWT_EXPIRED'),
          },
        };
      },
    }),
    MailModule,
    CloudinaryModule,
  ],
  exports: [UserService],
})
export class UserModule {}
