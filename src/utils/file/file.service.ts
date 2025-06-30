import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class FileService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get('CLOUDINARY_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder }, (error, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
        })
        .end(file.buffer);
    });
  }

  async deleteFile(url: string): Promise<{ result: string }> {
    try {
      const publicId = this.extractPublicIdFromUrl(url);

      const response = await cloudinary.uploader.destroy(publicId);
      return response;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete file.');
    }
  }

  extractPublicIdFromUrl(url: string): string {
    try {
      const parts = url.split('/');
      // Get the last part (e.g., "example-image.jpg")
      const filename = parts.pop()?.split('.')[0] || '';
      // Get the folder (e.g., "opportunities")
      const folder = parts[parts.length - 1] === 'upload' ? '' : parts.pop();

      return folder ? `${folder}/${filename}` : filename;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Invalid Cloudinary URL');
    }
  }
}
