import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Prisma handles unique constraints (name) at database level
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: Partial<CreateCategoryDto>) {
    const category = await this.findOne(id);

    // Prisma handles unique constraints at database level
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);

    // Check if category has books
    const booksCount = await this.prisma.book.count({
      where: { categoryId: id },
    });

    if (booksCount > 0) {
      throw new ConflictException(
        `Cannot delete category. It has ${booksCount} associated books.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
} 