import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AiService } from 'src/ai/ai.service';
import { OpportunitiesModule } from 'src/opportunities/opportunities.module';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { AiModule } from 'src/ai/ai.module';
import { CrawlerService } from 'src/crawler/crawler.service';
import { OpportunitiesService } from 'src/opportunities/opportunities.service';
import { CrawlTargetService } from 'src/crawler/crawl-target/crawl-target.service';

@Module({
  imports: [OpportunitiesModule, CrawlerModule, AiModule],
  providers: [
    JobsService,
    AiService,
    CrawlerService,
    CrawlTargetService,
    OpportunitiesService,
  ],
  exports: [JobsService],
})
export class JobsModule {}
