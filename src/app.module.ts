import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { UtilsModule } from './utils/utils.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { CategoriesModule } from './categories/categories.module';
import { CategoriesService } from './opportunites/categories/categories.service';
import { CategoriesService } from './opportunites/categories/categories.service';

@Module({
  imports: [AuthModule, UsersModule, UtilsModule, OpportunitiesModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, CategoriesService],
})
export class AppModule {}
