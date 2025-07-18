import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { BulkOpportunityActionDto } from './dtos/bulk-opportunity-action.dto';
import { UsersService } from 'src/users/users.service';
import { OpportunitiesService } from 'src/opportunities/opportunities.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly opportunitiesService: OpportunitiesService,
  ) {}

  async getDashboardMetrics() {
    const totalUsers = await this.usersService.count();
    const totalOpportunities = await this.opportunitiesService.count({});
    const pendingOpportunities = await this.opportunitiesService.count({
      where: { is_approved: false },
    });
    const activeUsers = await this.usersService.count();

    const recentUsers = await this.usersService.count({
      where: {
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    const approvedOpportunities = await this.opportunitiesService.count({
      where: { is_approved: true },
    });

    return {
      totalUsers,
      totalOpportunities,
      pendingOpportunities,
      activeUsers,
      recentUsers,
      approvedOpportunities,
      metrics: {
        userGrowthRate: 0, // Calculate based on historical data
        opportunityApprovalRate:
          totalOpportunities > 0
            ? (approvedOpportunities / totalOpportunities) * 100
            : 0,
        avgOpportunitiesPerUser:
          totalUsers > 0 ? totalOpportunities / totalUsers : 0,
      },
    };
  }

  async getUsers(pagination: PaginationDto, search?: string) {
    const { page = 1, perPage = 10 } = pagination;
    const limit = perPage;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as any } },
            { first_name: { contains: search, mode: 'insensitive' as any } },
            { last_name: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.usersService.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          created_at: true,
          updated_at: true,
          interests: true,
          education_level: true,
          experience_years: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.usersService.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(id: string) {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserRole(id: string, role: UserRole) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.usersService.update(id, { role });
    const { password_hash, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
  }

  async deactivateUser(id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Since we don't have an is_active field, we'll keep the role as is for now
    // This could be extended to add an is_active field to the schema later
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async activateUser(id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Since we don't have an is_active field, we'll keep the role as is for now
    // This could be extended to add an is_active field to the schema later
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getOpportunities(pagination: PaginationDto, status?: string) {
    const { page = 1, perPage = 10 } = pagination;
    const limit = perPage;
    const skip = (page - 1) * limit;

    let where = {};
    if (status === 'pending') {
      where = { is_approved: false };
    } else if (status === 'approved') {
      where = { is_approved: true };
    }

    const [opportunities, total] = await Promise.all([
      this.opportunitiesService.findAll({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          created_by: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.opportunitiesService.count({ where }),
    ]);

    return {
      opportunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingOpportunities(pagination: PaginationDto) {
    return this.getOpportunities(pagination, 'pending');
  }

  async approveOpportunity(id: string) {
    const opportunity = await this.opportunitiesService.findOne({
      where: { id },
    });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    // Use the service's update method directly with Prisma types
    const updatedOpportunity = await this.opportunitiesService.update(id, {
      is_approved: true,
    } as any);

    return updatedOpportunity;
  }

  async rejectOpportunity(id: string) {
    const opportunity = await this.opportunitiesService.findOne({
      where: { id },
    });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    // Use the service's update method directly with Prisma types
    const updatedOpportunity = await this.opportunitiesService.update(id, {
      is_approved: false,
    } as any);

    return updatedOpportunity;
  }

  async bulkOpportunityAction(dto: BulkOpportunityActionDto) {
    const { ids, action } = dto;

    if (ids.length === 0) {
      throw new BadRequestException('No opportunities selected');
    }

    let updateData = {};
    switch (action) {
      case 'approve':
        updateData = { is_approved: true };
        break;
      case 'reject':
        updateData = { is_approved: false };
        break;
      case 'delete':
        await this.opportunitiesService.deleteMany({
          where: { id: { in: ids } },
        });
        return { count: ids.length, action: 'deleted' };
      default:
        throw new BadRequestException('Invalid action');
    }

    const result = await this.opportunitiesService.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    return { count: result.count, action };
  }

  async getUserAnalytics() {
    const totalUsers = await this.usersService.count();
    const activeUsers = totalUsers; // All users are considered active
    const inactiveUsers = 0;

    const usersByRole = await this.usersService.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    const recentSignups = await this.usersService.count({
      where: {
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      recentSignups,
      growthRate: 0, // Calculate based on historical data
    };
  }

  async getOpportunityAnalytics() {
    const totalOpportunities = await this.opportunitiesService.count({});
    const approvedOpportunities = await this.opportunitiesService.count({
      where: { is_approved: true },
    });
    const pendingOpportunities = await this.opportunitiesService.count({
      where: { is_approved: false },
    });

    const opportunitiesByCategory = await this.opportunitiesService.groupBy({
      by: ['category_id'],
      _count: { category_id: true },
    });

    const recentOpportunities = await this.opportunitiesService.count({
      where: {
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    return {
      totalOpportunities,
      approvedOpportunities,
      pendingOpportunities,
      opportunitiesByCategory,
      recentOpportunities,
      approvalRate:
        totalOpportunities > 0
          ? (approvedOpportunities / totalOpportunities) * 100
          : 0,
    };
  }

  async getEngagementAnalytics() {
    // This would typically involve click tracking, view counts, etc.
    // For now, we'll return basic engagement metrics
    return {
      totalViews: 0,
      totalClicks: 0,
      avgTimeOnSite: 0,
      bounceRate: 0,
      topPerformingOpportunities: [],
      userEngagementTrends: [],
    };
  }
}
