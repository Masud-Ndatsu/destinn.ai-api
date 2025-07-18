import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async findMany(filter?: Prisma.UserFindManyArgs) {
    return this.prisma.user.findMany(filter);
  }

  async count(filter?: Prisma.UserCountArgs) {
    return this.prisma.user.count(filter);
  }

  async groupBy(filter: any) {
    return this.prisma.user.groupBy(filter);
  }
}
