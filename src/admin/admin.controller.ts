import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserRoleDto } from './dtos/update-user-role.dto';
import { BulkOpportunityActionDto } from './dtos/bulk-opportunity-action.dto';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ResponseService } from 'src/utils/response/response.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly responseService: ResponseService,
  ) {}

  @Get('dashboard')
  async getDashboardMetrics() {
    const metrics = await this.adminService.getDashboardMetrics();
    return this.responseService.success(
      'Dashboard metrics retrieved successfully',
      metrics,
    );
  }

  @Get('users')
  async getUsers(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
  ) {
    const users = await this.adminService.getUsers(pagination, search);
    return this.responseService.success('Users retrieved successfully', users);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.adminService.getUser(id);
    return this.responseService.success('User retrieved successfully', user);
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    const user = await this.adminService.updateUserRole(id, dto.role);
    return this.responseService.success('User role updated successfully', user);
  }

  @Post('users/:id/deactivate')
  async deactivateUser(@Param('id') id: string) {
    const user = await this.adminService.deactivateUser(id);
    return this.responseService.success('User deactivated successfully', user);
  }

  @Post('users/:id/activate')
  async activateUser(@Param('id') id: string) {
    const user = await this.adminService.activateUser(id);
    return this.responseService.success('User activated successfully', user);
  }

  @Get('opportunities')
  async getOpportunities(
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
  ) {
    const opportunities = await this.adminService.getOpportunities(
      pagination,
      status,
    );
    return this.responseService.success(
      'Opportunities retrieved successfully',
      opportunities,
    );
  }

  @Get('opportunities/pending')
  async getPendingOpportunities(@Query() pagination: PaginationDto) {
    const opportunities =
      await this.adminService.getPendingOpportunities(pagination);
    return this.responseService.success(
      'Pending opportunities retrieved successfully',
      opportunities,
    );
  }

  @Put('opportunities/:id/approve')
  async approveOpportunity(@Param('id') id: string) {
    const opportunity = await this.adminService.approveOpportunity(id);
    return this.responseService.success(
      'Opportunity approved successfully',
      opportunity,
    );
  }

  @Put('opportunities/:id/reject')
  async rejectOpportunity(@Param('id') id: string) {
    const opportunity = await this.adminService.rejectOpportunity(id);
    return this.responseService.success(
      'Opportunity rejected successfully',
      opportunity,
    );
  }

  @Post('opportunities/bulk-action')
  async bulkOpportunityAction(@Body() dto: BulkOpportunityActionDto) {
    const result = await this.adminService.bulkOpportunityAction(dto);
    return this.responseService.success(
      'Bulk action completed successfully',
      result,
    );
  }

  @Get('analytics/users')
  async getUserAnalytics() {
    const analytics = await this.adminService.getUserAnalytics();
    return this.responseService.success(
      'User analytics retrieved successfully',
      analytics,
    );
  }

  @Get('analytics/opportunities')
  async getOpportunityAnalytics() {
    const analytics = await this.adminService.getOpportunityAnalytics();
    return this.responseService.success(
      'Opportunity analytics retrieved successfully',
      analytics,
    );
  }

  @Get('analytics/engagement')
  async getEngagementAnalytics() {
    const analytics = await this.adminService.getEngagementAnalytics();
    return this.responseService.success(
      'Engagement analytics retrieved successfully',
      analytics,
    );
  }
}
