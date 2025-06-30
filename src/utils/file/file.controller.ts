import {
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseService } from '../response/response.service';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    readonly responseService: ResponseService,
  ) {}

  @Post('upload/:folder')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('folder') folder: string,
  ) {
    console.log({ file, folder });
    const response = await this.fileService.uploadFile(file, folder);
    return this.responseService.success('File uploaded successfully', {
      url: response.secure_url,
    });
  }

  @Delete('delete/:url')
  deleteFile(@Param('url') url: string) {
    return this.fileService.deleteFile(url);
  }
}
