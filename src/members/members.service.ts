import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    // Prisma handles unique constraints (email, membershipNumber) at database level
    return this.prisma.member.create({
      data: createMemberDto,
      include: {
        borrowings: {
          include: {
            edition: {
              include: {
                book: true
              }
            }
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.member.findMany({
      include: {
        borrowings: {
          include: {
            edition: {
              include: {
                book: true
              }
            }
          }
        }
      }
    });
  }

  async findOne(id: string) {
    // Validate ID format (basic validation for Prisma ID format)
    if (!id || typeof id !== 'string' || id.length < 10) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Additional validation for Prisma ID format (should start with specific pattern)
    if (!id.match(/^[a-zA-Z0-9]{20,}$/)) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    try {
      const member = await this.prisma.member.findUnique({
        where: { id },
        include: {
          borrowings: {
            include: {
              edition: {
                include: {
                  book: true
                }
              }
            }
          }
        }
      });

      if (!member) {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }

      return member;
    } catch (error) {
      // Handle Prisma errors gracefully
      if (error.code === 'P2023') {
        throw new NotFoundException(`Member with ID ${id} not found`);
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    const member = await this.prisma.member.findUnique({
      where: { email },
      include: {
        borrowings: {
          include: {
            edition: {
              include: {
                book: true
              }
            }
          }
        }
      }
    });

    if (!member) {
      throw new NotFoundException(`Member with email ${email} not found`);
    }

    return member;
  }

  async update(id: string, updateMemberDto: Partial<CreateMemberDto>) {
    // Check if member exists
    await this.findOne(id);

    // Prisma handles unique constraints at database level
    return this.prisma.member.update({
      where: { id },
      data: updateMemberDto,
      include: {
        borrowings: {
          include: {
            edition: {
              include: {
                book: true
              }
            }
          }
        }
      }
    });
  }

  async remove(id: string) {
    // Check if member exists
    await this.findOne(id);

    // Check if member has active borrowings
    const activeBorrowings = await this.prisma.borrowing.findFirst({
      where: {
        memberId: id,
        status: 'BORROWED'
      }
    });

    if (activeBorrowings) {
      throw new ConflictException('Cannot delete member with active borrowings');
    }

    return this.prisma.member.delete({
      where: { id }
    });
  }

  async getBorrowingHistory(id: string) {
    await this.findOne(id);

    return this.prisma.borrowing.findMany({
      where: { memberId: id },
      include: {
        edition: {
          include: {
            book: true,
            publisher: true
          }
        }
      },
      orderBy: { borrowedAt: 'desc' }
    });
  }
} 