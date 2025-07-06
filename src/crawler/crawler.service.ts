import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AiService } from 'src/ai/ai.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CrawlerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {
    this.crawlAndCleanOpportunity(
      'https://www.opportunitiesforafricans.com/category/scholarships/',
      // 'https://opportunitydesk.org/',
    );
  }

  private readonly logger = new Logger(CrawlerService.name);

  async crawlAndCleanOpportunity(url: string) {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Extract the HTML block you want to parse (e.g., the whole body)
      const blockHtml = $('body').html() || '';

      // Use the AI service to parse opportunities from the HTML block
      const parsedOpportunities =
        await this.aiService.parseBlockToOpportunities(blockHtml);

      return parsedOpportunities;
    } catch (error) {
      this.logger.error(`Failed to crawl ${url}`, error);
      throw new InternalServerErrorException('Crawler failed');
    }
  }

  async extractRealApplicationLink(
    applicationUrl: string,
  ): Promise<string | null> {
    try {
      const { data } = await axios.get(applicationUrl);
      const $ = cheerio.load(data);

      const visibleHtml = $('body').html();

      // Use AI for semantic extraction
      const aiLink =
        await this.aiService.extractApplicationLinkFromHtmlWithHrefContext(
          visibleHtml as string,
        );

      return aiLink;
    } catch (err) {
      console.error('Link extraction error:', err.message);
      return null;
    }
  }
}
