import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBorrowingDto } from '../dto/create-borrowing.dto';

@Injectable()
export class BorrowingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBorrowingDto: CreateBorrowingDto) {
    // Check if member exists and is active
    const member = await this.prisma.member.findUnique({
      where: { id: createBorrowingDto.memberId },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${createBorrowingDto.memberId} not found`);
    }

    if (!member.isActive) {
      throw new BadRequestException('Member account is inactive');
    }

    // Check if edition exists and has available copies
    const edition = await this.prisma.edition.findUnique({
      where: { id: createBorrowingDto.editionId },
      include: { book: true },
    });

    if (!edition) {
      throw new NotFoundException(`Book edition with ID ${createBorrowingDto.editionId} not found`);
    }

    if (edition.availableQuantity <= 0) {
      throw new ConflictException('No copies available for borrowing');
    }

    // Check if member has overdue books
    const overdueBooks = await this.prisma.borrowing.count({
      where: {
        memberId: createBorrowingDto.memberId,
        status: 'BORROWED',
        dueDate: { lt: new Date() },
      },
    });

    if (overdueBooks > 0) {
      throw new BadRequestException('Member has overdue books. Please return them first.');
    }

    // Check borrowing limit (max 5 books per member)
    const activeBorrowings = await this.prisma.borrowing.count({
      where: {
        memberId: createBorrowingDto.memberId,
        status: 'BORROWED',
      },
    });

    if (activeBorrowings >= 5) {
      throw new BadRequestException('Member has reached the maximum borrowing limit (5 books)');
    }

    // Set default due date (30 days from now) if not provided
    const dueDate = createBorrowingDto.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create borrowing and update available quantity
    const borrowing = await this.prisma.$transaction(async (prisma) => {
      const newBorrowing = await prisma.borrowing.create({
        data: {
          memberId: createBorrowingDto.memberId,
          editionId: createBorrowingDto.editionId,
          dueDate,
          notes: createBorrowingDto.notes,
        },
        include: {
          member: true,
          edition: {
            include: {
              book: true,
              publisher: true,
            },
          },
        },
      });

      // Update available quantity
      await prisma.edition.update({
        where: { id: createBorrowingDto.editionId },
        data: {
          availableQuantity: {
            decrement: 1,
          },
        },
      });

      return newBorrowing;
    });

    return borrowing;
  }

  async findAll() {
    return this.prisma.borrowing.findMany({
      include: {
        member: true,
        edition: {
          include: {
            book: true,
            publisher: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    // Validate ID format (basic validation for Prisma ID format)
    if (!id || typeof id !== 'string' || id.length < 10) {
      throw new NotFoundException(`Borrowing with ID ${id} not found`);
    }

    try {
      const borrowing = await this.prisma.borrowing.findUnique({
        where: { id },
        include: {
          member: true,
          edition: {
            include: {
              book: true,
              publisher: true,
            },
          },
        },
      });

      if (!borrowing) {
        throw new NotFoundException(`Borrowing with ID ${id} not found`);
      }

      return borrowing;
    } catch (error) {
      // Handle Prisma errors gracefully
      if (error.code === 'P2023') {
        throw new NotFoundException(`Borrowing with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findByMember(memberId: string) {
    return this.prisma.borrowing.findMany({
      where: { memberId },
      include: {
        edition: {
          include: {
            book: true,
            publisher: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: string) {
    return this.prisma.borrowing.findMany({
      where: { status: status as any },
      include: {
        member: true,
        edition: {
          include: {
            book: true,
            publisher: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOverdueBooks() {
    return this.prisma.borrowing.findMany({
      where: {
        status: 'BORROWED',
        dueDate: { lt: new Date() },
      },
      include: {
        member: true,
        edition: {
          include: {
            book: true,
            publisher: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async returnBook(id: string) {
    const borrowing = await this.findOne(id);

    if (borrowing.status === 'RETURNED') {
      throw new BadRequestException('Book has already been returned');
    }

    if (borrowing.status === 'LOST') {
      throw new BadRequestException('Cannot return a lost book');
    }

    // Calculate fine if overdue
    let fineAmount = 0;
    if (borrowing.dueDate < new Date()) {
      const daysOverdue = Math.ceil(
        (new Date().getTime() - borrowing.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      fineAmount = daysOverdue * 0.50; // $0.50 per day
    }

    const updatedBorrowing = await this.prisma.$transaction(async (prisma) => {
      const returnedBorrowing = await prisma.borrowing.update({
        where: { id },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          fineAmount: fineAmount > 0 ? fineAmount : null,
        },
        include: {
          member: true,
          edition: {
            include: {
              book: true,
              publisher: true,
            },
          },
        },
      });

      // Update available quantity
      await prisma.edition.update({
        where: { id: borrowing.editionId },
        data: {
          availableQuantity: {
            increment: 1,
          },
        },
      });

      return returnedBorrowing;
    });

    return updatedBorrowing;
  }

  async markAsLost(id: string) {
    const borrowing = await this.findOne(id);

    if (borrowing.status === 'RETURNED') {
      throw new BadRequestException('Cannot mark returned book as lost');
    }

    if (borrowing.status === 'LOST') {
      throw new BadRequestException('Book is already marked as lost');
    }

    // Calculate replacement cost (50% of book price)
    const replacementCost = borrowing.edition.price 
      ? parseFloat(borrowing.edition.price.toString()) * 0.5 
      : 25.00; // Default $25 if no price

    const updatedBorrowing = await this.prisma.borrowing.update({
      where: { id },
      data: {
        status: 'LOST',
        fineAmount: replacementCost,
        notes: borrowing.notes 
          ? `${borrowing.notes} - Marked as lost on ${new Date().toISOString()}`
          : `Marked as lost on ${new Date().toISOString()}`,
      },
      include: {
        member: true,
        edition: {
          include: {
            book: true,
            publisher: true,
          },
        },
      },
    });

    return updatedBorrowing;
  }

  async updateStatus(id: string, status: string) {
    const borrowing = await this.findOne(id);
    
    return this.prisma.borrowing.update({
      where: { id },
      data: { status: status as any },
      include: {
        member: true,
        edition: {
          include: {
            book: true,
            publisher: true,
          },
        },
      },
    });
  }

  // New method: Get borrowing statistics
  async getBorrowingStats() {
    const [totalBorrowings, activeBorrowings, overdueBorrowings, returnedBorrowings, lostBooks] = 
      await Promise.all([
        this.prisma.borrowing.count(),
        this.prisma.borrowing.count({ where: { status: 'BORROWED' } }),
        this.prisma.borrowing.count({ 
          where: { 
            status: 'BORROWED',
            dueDate: { lt: new Date() }
          } 
        }),
        this.prisma.borrowing.count({ where: { status: 'RETURNED' } }),
        this.prisma.borrowing.count({ where: { status: 'LOST' } }),
      ]);

    const totalFines = await this.prisma.borrowing.aggregate({
      _sum: { fineAmount: true },
      where: { fineAmount: { not: null } },
    });

    return {
      totalBorrowings,
      activeBorrowings,
      overdueBorrowings,
      returnedBorrowings,
      lostBooks,
      totalFines: totalFines._sum.fineAmount || 0,
    };
  }
} 