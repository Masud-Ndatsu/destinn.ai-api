import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CrawlTargetService {
  constructor(private readonly prisma: PrismaService) {}

  async createTarget(data: { url: string; platform?: string; label?: string }) {
    return this.prisma.scrapeTarget.create({ data });
  }

  async getActiveTargets() {
    return this.prisma.scrapeTarget.findMany({
      where: { is_active: true },
    });
  }

  async markScraped(id: string) {
    return this.prisma.scrapeTarget.update({
      where: { id },
      data: { last_scraped_at: new Date() },
    });
  }
}
