import { Module } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [UtilsModule],
  providers: [OpportunitiesService, CategoriesService, PrismaService],
  controllers: [OpportunitiesController, CategoriesController],
  exports: [OpportunitiesService, CategoriesService, PrismaService],
})
export class OpportunitiesModule {}
