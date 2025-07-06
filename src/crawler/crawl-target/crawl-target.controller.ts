import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrawlTargetService } from './crawl-target.service';

@Controller('crawl-target')
export class CrawlTargetController {
  constructor(private readonly crawlTargetService: CrawlTargetService) {}

  @Post()
  create(@Body() body: { url: string; platform?: string; label?: string }) {
    return this.crawlTargetService.createTarget(body);
  }

  @Get()
  findAll() {
    return this.crawlTargetService.getActiveTargets();
  }

  //   @Post(':id/toggle')
  //   toggle(@Param('id') id: string) {
  //     return this.crawlTargetService.toggleActive(id);
  //   }
}
