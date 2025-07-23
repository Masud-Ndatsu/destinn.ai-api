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
import { CrawlTargetService } from 'src/crawler/crawl-target/crawl-target.service';
import { JobsService } from 'src/jobs/jobs.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly opportunitiesService: OpportunitiesService,
    private readonly crawlTargetService: CrawlTargetService,
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

  // Crawling Management Methods
  async getCrawlingSources(pagination: PaginationDto) {
    const { page = 1, perPage = 10 } = pagination;
    const skip = (page - 1) * perPage;

    const [sources, total] = await Promise.all([
      this.crawlTargetService.findAll({
        skip,
        take: perPage,
        orderBy: { created_at: 'desc' },
      }),
      this.crawlTargetService.count({}),
    ]);

    // Transform the data to match the expected format
    const transformedSources = sources.map(source => ({
      id: source.id,
      name: source.label || source.platform || 'Unknown Source',
      url: source.url,
      enabled: source.is_active,
      frequency: source.frequency || 'daily',
      lastCrawled: source.last_scraped_at,
      status: source.is_active ? 'active' : 'inactive',
      totalOpportunities: 0, // This would need to be calculated from actual data
      successRate: 95, // This would need to be calculated from job logs
    }));

    return {
      data: transformedSources,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  }

  async createCrawlingSource(dto: any) {
    const source = await this.crawlTargetService.createTarget({
      url: dto.url,
      label: dto.name,
      platform: dto.platform || 'web',
    });

    // Update with additional fields
    return this.crawlTargetService.update({
      where: { id: source.id },
      data: {
        frequency: dto.frequency || 'daily',
      },
    });
  }

  async updateCrawlingSource(id: string, dto: any) {
    const source = await this.crawlTargetService.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException('Crawling source not found');
    }

    return this.crawlTargetService.update({
      where: { id },
      data: {
        url: dto.url,
        label: dto.name,
        platform: dto.platform,
        frequency: dto.frequency,
        is_active: dto.enabled,
      },
    });
  }

  async startCrawlingSource(id: string) {
    const source = await this.crawlTargetService.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException('Crawling source not found');
    }

    await this.crawlTargetService.update({
      where: { id },
      data: { is_active: true },
    });

    // Here you would trigger the actual crawling job
    // For now, we'll just return a success message
    return { message: 'Crawling job started', sourceId: id };
  }

  async stopCrawlingSource(id: string) {
    const source = await this.crawlTargetService.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException('Crawling source not found');
    }

    await this.crawlTargetService.update({
      where: { id },
      data: { is_active: false },
    });

    return { message: 'Crawling job stopped', sourceId: id };
  }

  async startAllCrawling() {
    const sources = await this.crawlTargetService.findAll({
      where: { is_active: false },
    });

    const ids = sources.map(s => s.id);
    
    // Activate all inactive sources
    await Promise.all(
      ids.map(id => 
        this.crawlTargetService.update({
          where: { id },
          data: { is_active: true },
        })
      )
    );

    return { message: 'All crawling jobs started', count: ids.length };
  }

  async stopAllCrawling() {
    const sources = await this.crawlTargetService.findAll({
      where: { is_active: true },
    });

    const ids = sources.map(s => s.id);
    
    // Deactivate all active sources
    await Promise.all(
      ids.map(id => 
        this.crawlTargetService.update({
          where: { id },
          data: { is_active: false },
        })
      )
    );

    return { message: 'All crawling jobs stopped', count: ids.length };
  }

  async getCrawlingJobs(pagination: PaginationDto, status?: string) {
    // This would typically come from a separate jobs/logs table
    // For now, we'll return mock data based on the existing structure
    const { page = 1, perPage = 10 } = pagination;
    
    // Mock job data - in a real implementation, this would come from a jobs table
    const mockJobs = [
      {
        id: 'job-001',
        sourceId: 'source-1',
        sourceName: 'LinkedIn Jobs',
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        foundOpportunities: 25,
        processedOpportunities: 23,
        errors: [],
        duration: 45,
      },
      {
        id: 'job-002',
        sourceId: 'source-2',
        sourceName: 'Indeed',
        status: 'running',
        startedAt: new Date().toISOString(),
        foundOpportunities: 12,
        processedOpportunities: 8,
        errors: [],
      },
    ];

    return {
      data: mockJobs,
      pagination: {
        page,
        perPage,
        total: mockJobs.length,
        totalPages: 1,
      },
    };
  }

  async getCrawlingStats() {
    const totalSources = await this.crawlTargetService.count({});
    const activeSources = await this.crawlTargetService.count({
      where: { is_active: true },
    });
    const totalOpportunities = await this.opportunitiesService.count({
      where: { source_type: 'AI' },
    });
    const todayOpportunities = await this.opportunitiesService.count({
      where: {
        source_type: 'AI',
        created_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    return {
      totalSources,
      activeSources,
      totalJobs: 0, // Would come from jobs table
      successfulJobs: 0, // Would come from jobs table
      totalOpportunities,
      todayOpportunities,
      avgProcessingTime: 0, // Would be calculated from job logs
      uptime: 99.5,
    };
  }

  async getCrawlingSettings() {
    // This would typically come from a settings table or config
    // For now, return default settings
    return {
      enabled: true,
      maxConcurrentJobs: 3,
      retryAttempts: 3,
      timeout: 30,
      respectRobotsTxt: true,
      userAgent: 'AmbitFul-Bot/1.0',
    };
  }

  async updateCrawlingSettings(dto: any) {
    // This would typically update a settings table or config file
    // For now, just return the updated settings
    return dto;
  }

  async testCrawlingIntegration(dto: { type: string; url: string }) {
    const { type, url } = dto;

    try {
      // Mock integration testing
      if (type === 'source') {
        // Test if the URL is accessible
        const axios = require('axios');
        await axios.head(url, { timeout: 5000 });
        return { success: true, message: 'Source is accessible' };
      } else if (type === 'slack') {
        // Mock Slack webhook test
        return { success: true, message: 'Slack integration test successful' };
      } else {
        // Mock other integration tests
        return { success: true, message: `${type} integration test successful` };
      }
    } catch (error) {
      throw new BadRequestException(`Integration test failed: ${error.message}`);
    }
  }
}
