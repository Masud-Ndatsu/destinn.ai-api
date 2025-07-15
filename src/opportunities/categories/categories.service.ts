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

  async findAll(filter?: Prisma.CategoryFindManyArgs) {
    const cats = await this.prisma.category.findMany(filter);
    return cats;
  }

  findOne(filter: Prisma.CategoryFindFirstArgs) {
    return this.prisma.category.findFirst(filter);
  }
  count(filter: Prisma.CategoryCountArgs) {
    return this.prisma.category.count(filter);
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
