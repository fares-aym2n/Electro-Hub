import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.config.getOrThrow<string>(
        'CLOUDINARY_API_KEY',
      ),
      api_secret: this.config.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'electro-hub/users',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(
              new InternalServerErrorException(
                'Failed to upload image to Cloudinary',
              ),
            );
            return;
          }

          resolve(result.secure_url);
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const marker = '/upload/';
    const index = imageUrl.indexOf(marker);

    if (index === -1) return;

    const pathAfterUpload = imageUrl.slice(
      index + marker.length,
    );
    const parts = pathAfterUpload.split('/');
    const versionIndex = parts.findIndex((part) =>
      /^v\d+$/.test(part),
    );

    const publicIdParts =
      versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts;

    const publicId = publicIdParts
      .join('/')
      .replace(/\.[^/.]+$/, '');

    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  }
}
