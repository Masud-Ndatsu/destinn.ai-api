import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dtos';
import { Prisma } from '@prisma/client';
import { CategoriesService } from './categories/categories.service';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
  ) {}

  create(dto: Prisma.OpportunityCreateArgs) {
    return this.prisma.opportunity.create(dto);
  }

  findAll(filter?: Prisma.OpportunityFindManyArgs) {
    return this.prisma.opportunity.findMany(filter);
  }

  findOne(filter: Prisma.OpportunityFindFirstArgs) {
    return this.prisma.opportunity.findFirst(filter);
  }
  count(filter: Prisma.OpportunityCountArgs) {
    return this.prisma.opportunity.count(filter);
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    const exists = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunity.update({
      where: { id },
      data: { ...dto, deadline: dto.deadline as string },
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunity.delete({ where: { id } });
  }

  async createOpportunity(dto: CreateOpportunityDto) {
    console.log({ deadline: dto.deadline });
    const existing = await this.findOne({
      where: {
        title: dto.title,
        location: dto.location,
        ...(dto.deadline ? { deadline: new Date(dto.deadline as string) } : {}),
      },
    });

    if (existing) {
      throw new ConflictException('Opportunity already exists');
    }

    // Validate category
    const category = await this.categoriesService.findOne({
      where: { id: dto.category_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Create opportunity
    const newOpportunity = await this.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        deadline: new Date(dto.deadline as string),
        source_url: dto.image_url,
        application_url: dto.application_url,
        category_id: category.id,
      },
    });

    return newOpportunity;
  }

  /**
   * Bulk create opportunities without duplicate or category checks.
   * Returns an array of created opportunities.
   */
  async bulkCreate(opportunities: CreateOpportunityDto[]) {
    const created = await Promise.all(
      opportunities.map(async (dto) => {
        return this.create({
          data: {
            title: dto.title,
            description: dto.description,
            location: dto.location,
            deadline: dto.deadline ? new Date(dto.deadline as string) : null,
            source_url: dto.image_url,
            application_url: dto.application_url,
            category_id: dto.category_id,
          },
        });
      }),
    );
    return created;
  }

  async updateMany(filter: Prisma.OpportunityUpdateManyArgs) {
    return this.prisma.opportunity.updateMany(filter);
  }

  async deleteMany(filter: Prisma.OpportunityDeleteManyArgs) {
    return this.prisma.opportunity.deleteMany(filter);
  }

  async groupBy(filter: any) {
    return this.prisma.opportunity.groupBy(filter);
  }
}
