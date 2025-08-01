import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Returns a hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get library statistics' })
  @ApiResponse({ status: 200, description: 'Returns library statistics' })
  async getLibraryStats() {
    const [totalBooks, totalMembers, totalBorrowings, activeBorrowings] = await Promise.all([
      this.prisma.book.count(),
      this.prisma.member.count(),
      this.prisma.borrowing.count(),
      this.prisma.borrowing.count({ where: { status: 'BORROWED' } })
    ]);

    return {
      totalBooks,
      totalMembers,
      totalBorrowings,
      activeBorrowings,
      timestamp: new Date().toISOString()
    };
  }
}
