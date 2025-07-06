import { Test, TestingModule } from '@nestjs/testing';
import { CrawlTargetController } from './crawl-target.controller';

describe('CrawlTargetController', () => {
  let controller: CrawlTargetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrawlTargetController],
    }).compile();

    controller = module.get<CrawlTargetController>(CrawlTargetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
