import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dtos';
import { ResponseService } from 'src/utils/response/response.service';
import { CategoriesService } from './categories/categories.service';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
    private readonly categoriesService: CategoriesService,
    readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() dto: CreateOpportunityDto) {
    const newOpportunity =
      await this.opportunitiesService.createOpportunity(dto);
    return this.responseService.success(
      'Opportunity created successfully',
      newOpportunity,
    );
  }

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
  ) {
    const { page = 1, perPage = 10 } = pagination;
    const skip = (page - 1) * perPage;

    // Build Prisma where filter for search
    let where = {};
    if (search) {
      where = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Fetch paginated data and total count
    const [opportunities, total] = await Promise.all([
      this.opportunitiesService.findAll({
        skip,
        take: perPage,
        where,
      }),
      this.opportunitiesService.count({ where }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    const response = {
      data: opportunities,
      meta: {
        total,
        totalPages,
        currentPage: page,
        perPage: perPage,
      },
    };
    return this.responseService.success(
      'Opportunities fetched successfully',
      response,
    );
  }

  @Get(':category_slug')
  async findByCategoryID(
    @Param('category_slug') category_slug: string,
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
  ) {
    const { page = 1, perPage = 10 } = pagination;
    const skip = (page - 1) * perPage;

    const category = await this.categoriesService.findOne({
      where: { slug: category_slug },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Build Prisma where filter for search within category
    let where: any = { category_id: category.id };
    if (search) {
      where = {
        ...where,
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Fetch paginated data and total count for this category
    const [opportunities, total] = await Promise.all([
      this.opportunitiesService.findAll({
        skip,
        take: perPage,
        where,
      }),
      this.opportunitiesService.count({ where }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    const response = {
      data: opportunities,
      meta: {
        total,
        totalPages,
        currentPage: page,
        perPage: perPage,
      },
    };
    return this.responseService.success(
      'Opportunities fetched successfully',
      response,
    );
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const opportunity = await this.opportunitiesService.findOne({
      where: { id },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    return this.responseService.success(
      'Opportunity fetched successfully',
      opportunity,
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto) {
    const updated = await this.opportunitiesService.update(id, dto);
    return this.responseService.success(
      'Opportunity updated successfully',
      updated,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const removed = await this.opportunitiesService.remove(id);
    return this.responseService.success(
      'Opportunity deleted successfully',
      removed,
    );
  }
}
