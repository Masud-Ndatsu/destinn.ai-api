import { Module } from '@nestjs/common';
import { ResponseService } from './response/response.service';
import { FileService } from './file/file.service';
import { ConfigModule } from '@nestjs/config';
import { FileController } from './file/file.controller';
import { UtilsService } from './utils.service';

@Module({
  imports: [ConfigModule],
  providers: [ResponseService, FileService, UtilsService],
  exports: [ResponseService, FileService, UtilsService],
  controllers: [FileController],
})
export class UtilsModule {}
