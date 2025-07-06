import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { OpportunitiesService } from 'src/opportunities/opportunities.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoriesService } from 'src/opportunities/categories/categories.service';
import { AiService } from 'src/ai/ai.service';
import { CrawlTargetService } from './crawl-target/crawl-target.service';
import { CrawlTargetController } from './crawl-target/crawl-target.controller';

@Module({
  providers: [
    CrawlerService,
    OpportunitiesService,
    CategoriesService,
    PrismaService,
    AiService,
    CrawlTargetService,
  ],
  exports: [PrismaService, CrawlerService, CrawlTargetService],
  controllers: [CrawlTargetController],
})
export class CrawlerModule {}
