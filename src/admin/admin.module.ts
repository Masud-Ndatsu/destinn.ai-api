import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsModule } from 'src/utils/utils.module';
import { UsersModule } from 'src/users/users.module';
import { OpportunitiesModule } from 'src/opportunities/opportunities.module';
import { CrawlerModule } from 'src/crawler/crawler.module';

@Module({
  imports: [UtilsModule, UsersModule, OpportunitiesModule, CrawlerModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
  exports: [AdminService],
})
export class AdminModule {}