import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CrawlerService } from '../crawler/crawler.service';
import { OpportunitiesService } from 'src/opportunities/opportunities.service';
import { AiService } from 'src/ai/ai.service';
import { CategoriesService } from 'src/opportunities/categories/categories.service';
import { CrawlTargetService } from 'src/crawler/crawl-target/crawl-target.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly opportunityService: OpportunitiesService,
    private readonly categoriesService: CategoriesService,
    private readonly aiService: AiService,
    private readonly crawlTargetService: CrawlTargetService,
  ) {}

  @Cron('0 */10 * * * *')
  async scrapeOpportunitiesJob() {
    this.logger.log('🕸️ Starting scraping job...');

    const targets = await this.crawlTargetService.getActiveTargets();

    const urls = [
      'https://www.opportunitiesforafricans.com/category/scholarships/',
    ];

    if (!targets.length) return;

    for (const target of targets) {
      try {
        // 1. Crawl and parse new opportunities from the URL
        const crawledOpportunities =
          await this.crawlerService.crawlAndCleanOpportunity(target.url);
        this.logger.debug({ crawledOpportunities });

        // 2. Fetch all existing opportunities from the DB
        const existingOpportunities = await this.opportunityService.findAll();

        // 3. Use AI to filter out duplicates in a single request
        const uniqueOpportunities = await this.aiService.isDuplicateAI(
          crawledOpportunities,
          existingOpportunities,
        );
        this.logger.debug({ uniqueOpportunities });

        // 4. Prepare DTOs for bulk create
        const dtos = uniqueOpportunities.map((opp) => ({
          title: opp.title,
          description: opp.description,
          category_id: opp.category_id || '',
          application_url: opp.application_url || '',
          location: opp.location || '',
          deadline: opp.deadline || false,
          company: 'Unknown',
          image_url: opp.thumbnail_url || '',
        }));

        // 5. Bulk create unique opportunities
        await this.opportunityService.bulkCreate(dtos);

        dtos.forEach((opp) => {
          this.logger.log(`✅ Opportunity saved: ${opp.title}`);
        });
      } catch (error) {
        this.logger.error(
          `❌ Error processing URL ${target.url}: ${error.message}`,
        );
      }
    }

    this.logger.log('🎯 Scraping job complete');
  }
}
