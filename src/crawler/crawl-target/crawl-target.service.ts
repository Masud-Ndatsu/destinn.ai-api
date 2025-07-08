import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class CrawlTargetService {
  async count(filter: Prisma.ScrapeTargetCountArgs) {
    return this.prisma.scrapeTarget.count(filter);
  }
  constructor(private readonly prisma: PrismaService) {}

  async createTarget(data: { url: string; platform?: string; label?: string }) {
    try {
      await axios.head(data.url, { timeout: 5000 });

      return this.prisma.scrapeTarget.create({ data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new BadRequestException(
            `URL "${data.url}" returned status ${error.response.status}: ${error.response.statusText}`,
          );
        } else if (error.request) {
          throw new BadRequestException(
            `No response received from URL "${data.url}". It might be down or unreachable.`,
          );
        } else {
          throw new BadRequestException(
            `Error setting up request for URL "${data.url}": ${error.message}`,
          );
        }
      } else {
        throw new BadRequestException(
          `An unexpected error occurred while checking URL "${data.url}": ${error.message}`,
        );
      }
    }
  }

  async findOne(filter: Prisma.ScrapeTargetFindFirstArgs) {
    return this.prisma.scrapeTarget.findFirst(filter);
  }

  async findAll(filter: Prisma.ScrapeTargetFindManyArgs) {
    return this.prisma.scrapeTarget.findMany(filter);
  }

  async update(updateDto: Prisma.ScrapeTargetUpdateArgs) {
    return this.prisma.scrapeTarget.update(updateDto);
  }

  async delete(filter: Prisma.ScrapeTargetDeleteArgs) {
    return this.prisma.scrapeTarget.delete(filter);
  }

  async getActiveTargets() {
    return this.prisma.scrapeTarget.findMany({
      where: {
        is_active: true,
      },
    });
  }
}
