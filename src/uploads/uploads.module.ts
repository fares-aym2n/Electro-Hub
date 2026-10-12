import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadsController],
  imports: [CloudinaryModule],
})
export class UploadsModule {}
