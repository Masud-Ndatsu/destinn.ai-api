import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { UtilsModule } from './utils/utils.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { CategoriesService } from './opportunities/categories/categories.service';

@Module({
  imports: [AuthModule, UsersModule, UtilsModule, OpportunitiesModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, CategoriesService],
})
export class AppModule {}
