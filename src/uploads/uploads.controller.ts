import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { uploadMultiFileDTO } from './dto/upload-multi-file.dto';
import { uploadSingleFileDTO } from './dto/upload-single-file.dto';

const MAX_FILE_SIZE = 2 * 1024 * 1024;

@Controller('/api/uploads')
export class UploadsController {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('single-file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  @ApiBody({ type: uploadSingleFileDTO })
  @ApiConsumes('multipart/form-data')
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('The file is not provided');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Please provide an image file only',
      );
    }

    const imageUrl = await this.cloudinaryService.uploadImage(
      file,
      'electro-hub/uploads',
    );

    return {
      message: 'File uploaded successfully',
      url: imageUrl,
    };
  }

  @Post('multiple-file')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 10,
      },
    }),
  )
  @ApiBody({ type: uploadMultiFileDTO })
  @ApiConsumes('multipart/form-data')
  public async uploadMultipleFile(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'The files are not provided',
      );
    }

    for (const file of files) {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException(
          'Please provide image files only',
        );
      }
    }

    const urls = await Promise.all(
      files.map((file) =>
        this.cloudinaryService.uploadImage(
          file,
          'electro-hub/uploads',
        ),
      ),
    );

    return {
      message: 'Files uploaded successfully',
      count: urls.length,
      urls,
    };
  }
}
