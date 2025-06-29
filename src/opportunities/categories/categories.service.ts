import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: Prisma.CategoryCreateArgs) {
    return this.prisma.category.create(dto);
  }

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Category not found');

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.category.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Category not found');

    return this.prisma.category.delete({ where: { id } });
  }
}
