import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { UtilsModule } from './utils/utils.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { CategoriesService } from './opportunities/categories/categories.service';
import { CrawlerModule } from './crawler/crawler.module';
import { AiModule } from './ai/ai.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    UtilsModule,
    OpportunitiesModule,
    CrawlerModule,
    AiModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, CategoriesService],
})
export class AppModule {}
