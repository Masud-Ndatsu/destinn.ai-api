import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CrawlTargetService } from './crawl-target.service';
import { ResponseService } from 'src/utils/response/response.service';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { AddCrawlTargetDto } from './dtos/add-crawl-target.dto';

@Controller('crawl-target')
export class CrawlTargetController {
  constructor(
    private readonly crawlTargetService: CrawlTargetService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() dto: AddCrawlTargetDto) {
    const target = await this.crawlTargetService.findOne({
      where: { url: dto.url },
    });

    if (target) {
      throw new ConflictException('Scrape target already exists');
    }

    const newTarget = await this.crawlTargetService.createTarget(dto);

    return this.responseService.success(
      'New scrape target added successfully',
      newTarget,
    );
  }

  @Get()
  async findAll(@Query() paginate: PaginationDto) {
    const { page = 1, perPage = 10 } = paginate;
    const skip = (page - 1) * perPage;

    const [targets, total] = await Promise.all([
      this.crawlTargetService.findAll({
        skip,
        take: perPage,
      }),
      this.crawlTargetService.count({}),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return this.responseService.success(
      'Scrape targets retrieved successfully',
      {
        data: targets,
        meta: {
          total,
          totalPages,
          currentPage: page,
          perPage,
        },
      },
    );
  }

  @Post(':id/toggle')
  async toggle(@Param('id') id: string) {
    const target = await this.crawlTargetService.findOne({
      where: { id },
    });

    if (!target) {
      throw new NotFoundException('Scrape target not found');
    }

    // Toggle the is_active status
    const updatedTarget = await this.crawlTargetService.update({
      where: { id: target.id },
      data: { is_active: !target.is_active },
    });

    return this.responseService.success(
      `Scrape target ${updatedTarget.is_active ? 'activated' : 'deactivated'} successfully`,
      updatedTarget,
    );
  }

  @Delete(':id')
  async deleteById(@Param('id') id: string) {
    const target = await this.crawlTargetService.findOne({ where: { id } });

    if (!target) {
      throw new NotFoundException('Scrape not found');
    }

    await this.crawlTargetService.delete({ where: { id } });

    return this.responseService.success('Scrape target deleted successfully');
  }
}
