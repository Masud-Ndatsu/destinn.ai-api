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
import { createId } from '@paralleldrive/cuid2';

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

  @Get('featured')
  async findFeatured() {
    let opportunities = await this.opportunitiesService.findAll({
      take: 4,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        category: true,
      },
    });

    // Fallback data if no opportunities are found
    if (!opportunities || opportunities.length === 0) {
      opportunities = [
        {
          id: createId(),
          title: 'Software Developer Internship',
          description:
            'Join our team as a software developer intern. Work on exciting projects and gain hands-on experience in modern web development.',
          location: 'Remote',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          source_url: 'https://example.com/opportunity-1',
          application_url: 'https://example.com/apply-1',
          category_id: createId(),
          is_approved: true,
          created_by_id: null,
          source_type: 'ADMIN' as any,
          created_at: new Date(),
          updated_at: new Date(),
          category: {
            id: createId(),
            name: 'Technology',
            slug: 'technology',
            thumbnail_url: null,
            created_at: new Date(),
          },
        },
        {
          id: createId(),
          title: 'Marketing Coordinator Position',
          description:
            'Exciting opportunity to join our marketing team. Help us create compelling campaigns and grow our brand presence.',
          location: 'New York, NY',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          source_url: 'https://example.com/opportunity-2',
          application_url: 'https://example.com/apply-2',
          category_id: createId(),
          is_approved: true,
          created_by_id: null,
          source_type: 'ADMIN' as any,
          created_at: new Date(),
          updated_at: new Date(),
          category: {
            id: createId(),
            name: 'Marketing',
            slug: 'marketing',
            thumbnail_url: null,
            created_at: new Date(),
          } as any,
        },
        {
          id: createId(),
          title: 'Data Analyst Opportunity',
          description:
            'Work with large datasets and help drive business decisions through data-driven insights.',
          location: 'San Francisco, CA',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          source_url: 'https://example.com/opportunity-3',
          application_url: 'https://example.com/apply-3',
          category_id: createId(),
          is_approved: true,
          created_by_id: null,
          source_type: 'ADMIN' as any,
          created_at: new Date(),
          updated_at: new Date(),
          category: {
            id: createId(),
            name: 'Data Science',
            slug: 'data-science',
            thumbnail_url: null,
            created_at: new Date(),
          },
        },
      ] as any[];
    }

    return this.responseService.success(
      'Featured opportunities fetched successfully',
      opportunities,
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
        orderBy: {
          created_at: 'desc',
        },
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
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
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
