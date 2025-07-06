import { Test, TestingModule } from '@nestjs/testing';
import { CrawlTargetService } from './crawl-target.service';

describe('CrawlTargetService', () => {
  let service: CrawlTargetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrawlTargetService],
    }).compile();

    service = module.get<CrawlTargetService>(CrawlTargetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
