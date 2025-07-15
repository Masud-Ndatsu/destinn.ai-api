import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dtos';
import { UtilsService } from 'src/utils/utils.service';
import { ResponseService } from 'src/utils/response/response.service';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    readonly utilsService: UtilsService,
    readonly responseService: ResponseService,
  ) {}

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    const slug = this.utilsService.slugify(dto.name);
    const newCategory = await this.categoriesService.create({
      data: {
        ...dto,
        slug,
      },
    });
    return this.responseService.success(
      'Category created successfully',
      newCategory,
    );
  }

  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    const { page = 1, perPage = 10 } = pagination;
    const skip = (page - 1) * perPage;
    let where = {};

    const [categories, total] = await Promise.all([
      this.categoriesService.findAll({
        skip,
        take: perPage,
        where,
      }),
      this.categoriesService.count({ where }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    const response = {
      data: categories,
      meta: {
        total,
        totalPages,
        currentPage: page,
        perPage: perPage,
      },
    };
    return this.responseService.success(
      'Categories retrieved successfully',
      response,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoriesService.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return this.responseService.success(
      'Category retrieved successfully',
      category,
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    const updated = await this.categoriesService.update(id, dto);
    return this.responseService.success(
      'Category updated successfully',
      updated,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const removed = await this.categoriesService.remove(id);
    return this.responseService.success(
      'Category deleted successfully',
      removed,
    );
  }
}
