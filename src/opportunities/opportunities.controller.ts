import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dtos';
import { ResponseService } from 'src/utils/response/response.service';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
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
  async findAll() {
    const opportunities = await this.opportunitiesService.findAll();
    return this.responseService.success(
      'Opportunities fetched successfully',
      opportunities,
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
