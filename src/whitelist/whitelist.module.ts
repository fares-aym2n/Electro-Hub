import { Module } from '@nestjs/common';
import { WhitelistService } from './whitelist.service';
import { WhitelistController } from './whitelist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Whitelist } from './entities/whitelist.entity';
import { Product } from '../products/entities/products.entity';
import { UserModule } from '../users/users.module';

@Module({
  controllers: [WhitelistController],
  providers: [WhitelistService],
  imports: [
    TypeOrmModule.forFeature([Whitelist, Product]),
    JwtModule,
    UserModule,
  ],
})
export class WhitelistModule {}
