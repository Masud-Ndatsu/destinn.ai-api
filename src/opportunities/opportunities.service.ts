import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dtos';
import { Prisma } from '@prisma/client';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

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
    const opportunity = await this.findOne({
      where: {
        title: dto.title,
        deadline: dto.deadline,
        location: dto.location,
      },
    });

    if (opportunity) {
      throw new ConflictException('Opportunity already exists');
    }

    const newOpportunity = await this.create({
      data:  {
        category_id:
      }
    })
  }
}
