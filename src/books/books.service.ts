import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    // Prisma handles unique constraints (ISBN) at database level
    return this.prisma.book.create({
      data: createBookDto,
      include: {
        category: true,
        bookAuthors: {
          include: {
            author: true
          }
        },
        editions: {
          include: {
            publisher: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.book.findMany({
      include: {
        category: true,
        bookAuthors: {
          include: {
            author: true
          }
        },
        editions: {
          include: {
            publisher: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    // Validate ID format (basic validation for Prisma ID format)
    if (!id || typeof id !== 'string' || id.length < 10) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    try {
      const book = await this.prisma.book.findUnique({
        where: { id },
        include: {
          category: true,
          bookAuthors: {
            include: {
              author: true
            }
          },
          editions: {
            include: {
              publisher: true
            }
          }
        }
      });

      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }

      return book;
    } catch (error) {
      // Handle Prisma errors gracefully
      if (error.code === 'P2023') {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findByIsbn(isbn: string) {
    const book = await this.prisma.book.findUnique({
      where: { isbn },
      include: {
        category: true,
        bookAuthors: {
          include: {
            author: true
          }
        },
        editions: {
          include: {
            publisher: true
          }
        }
      }
    });

    if (!book) {
      throw new NotFoundException(`Book with ISBN ${isbn} not found`);
    }

    return book;
  }

  async search(query: string) {
    return this.prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { isbn: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        category: true,
        bookAuthors: {
          include: {
            author: true
          }
        },
        editions: {
          include: {
            publisher: true
          }
        }
      }
    });
  }

  async update(id: string, updateBookDto: Partial<CreateBookDto>) {
    // Check if book exists
    await this.findOne(id);

    // Prisma handles unique constraints at database level
    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
      include: {
        category: true,
        bookAuthors: {
          include: {
            author: true
          }
        },
        editions: {
          include: {
            publisher: true
          }
        }
      }
    });
  }

  async remove(id: string) {
    // Check if book exists
    await this.findOne(id);

    // Check if book has editions with active borrowings
    const editionsWithBorrowings = await this.prisma.edition.findFirst({
      where: {
        bookId: id,
        borrowings: {
          some: {
            status: 'BORROWED'
          }
        }
      }
    });

    if (editionsWithBorrowings) {
      throw new ConflictException('Cannot delete book with active borrowings');
    }

    return this.prisma.book.delete({
      where: { id }
    });
  }

  async addAuthor(bookId: string, authorId: string, role: string = 'Author') {
    // Check if book exists
    await this.findOne(bookId);

    // Check if author exists
    const author = await this.prisma.author.findUnique({
      where: { id: authorId }
    });
    if (!author) {
      throw new NotFoundException(`Author with ID ${authorId} not found`);
    }

    // Check if relationship already exists
    const existingRelation = await this.prisma.bookAuthor.findUnique({
      where: {
        bookId_authorId: {
          bookId,
          authorId
        }
      }
    });

    if (existingRelation) {
      throw new ConflictException('Author already associated with this book');
    }

    return this.prisma.bookAuthor.create({
      data: {
        bookId,
        authorId,
        role
      },
      include: {
        book: true,
        author: true
      }
    });
  }

  async removeAuthor(bookId: string, authorId: string) {
    const relation = await this.prisma.bookAuthor.findUnique({
      where: {
        bookId_authorId: {
          bookId,
          authorId
        }
      }
    });

    if (!relation) {
      throw new NotFoundException('Author-book relationship not found');
    }

    return this.prisma.bookAuthor.delete({
      where: {
        bookId_authorId: {
          bookId,
          authorId
        }
      }
    });
  }
} 