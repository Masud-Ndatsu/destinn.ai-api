import { Module } from '@nestjs/common';
import { ResponseService } from './response/response.service';
import { FileService } from './file/file.service';

@Module({
  providers: [ResponseService, FileService],
  exports: [ResponseService],
})
export class UtilsModule {}
