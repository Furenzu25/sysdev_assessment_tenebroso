import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from '../dto/create-member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    // Check if email already exists
    const existingEmail = await this.prisma.member.findUnique({
      where: { email: createMemberDto.email }
    });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Check if membership number already exists
    const existingMembership = await this.prisma.member.findUnique({
      where: { membershipNumber: createMemberDto.membershipNumber }
    });
    if (existingMembership) {
      throw new ConflictException('Membership number already exists');
    }

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

    // Check for email conflicts if email is being updated
    if (updateMemberDto.email) {
      const existingEmail = await this.prisma.member.findFirst({
        where: {
          email: updateMemberDto.email,
          id: { not: id }
        }
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Check for membership number conflicts if membership number is being updated
    if (updateMemberDto.membershipNumber) {
      const existingMembership = await this.prisma.member.findFirst({
        where: {
          membershipNumber: updateMemberDto.membershipNumber,
          id: { not: id }
        }
      });
      if (existingMembership) {
        throw new ConflictException('Membership number already exists');
      }
    }

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