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

  findAll() {
    return this.prisma.opportunity.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  findOne(query: Prisma.OpportunityFindFirstArgs) {
    return this.prisma.opportunity.findFirst(query);
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    const exists = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunity.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunity.delete({ where: { id } });
  }

  async createOpportunity(dto: CreateOpportunityDto) {
    const existing = await this.findOne({
      where: {
        title: dto.title,
        deadline: new Date(dto.deadline),
        location: dto.location,
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
        deadline: new Date(dto.deadline),
        source_url: dto.image_url,
        application_url: dto.link,
        category_id: category.id,
      },
    });

    return newOpportunity;
  }
}
