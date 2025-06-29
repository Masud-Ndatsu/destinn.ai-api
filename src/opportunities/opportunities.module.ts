import { Module } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';

@Module({
  providers: [OpportunitiesService, CategoriesService],
  controllers: [OpportunitiesController, CategoriesController]
})
export class OpportunitiesModule {}
