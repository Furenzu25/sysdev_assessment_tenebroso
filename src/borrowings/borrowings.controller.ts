import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BorrowingsService } from './borrowings.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';

@ApiTags('borrowings')
@Controller('borrowings')
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) {}

  @Post()
  @ApiOperation({ summary: 'Borrow a book' })
  @ApiResponse({ status: 201, description: 'Book borrowed successfully' })
  @ApiResponse({ status: 400, description: 'Member not active or invalid request' })
  @ApiResponse({ status: 404, description: 'Member or edition not found' })
  @ApiResponse({ status: 409, description: 'No copies available' })
  create(@Body() createBorrowingDto: CreateBorrowingDto) {
    return this.borrowingsService.create(createBorrowingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all borrowing records' })
  @ApiResponse({ status: 200, description: 'Returns all borrowing records' })
  findAll() {
    return this.borrowingsService.findAll();
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue books' })
  @ApiResponse({ status: 200, description: 'Returns overdue borrowing records' })
  getOverdueBooks() {
    return this.borrowingsService.getOverdueBooks();
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get borrowings by status' })
  @ApiParam({ name: 'status', description: 'Borrowing status (BORROWED, RETURNED, OVERDUE, LOST)' })
  @ApiResponse({ status: 200, description: 'Returns borrowings with specified status' })
  findByStatus(@Param('status') status: string) {
    return this.borrowingsService.findByStatus(status);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get borrowings by member' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Returns member borrowing history' })
  findByMember(@Param('memberId') memberId: string) {
    return this.borrowingsService.findByMember(memberId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get borrowing by ID' })
  @ApiParam({ name: 'id', description: 'Borrowing ID' })
  @ApiResponse({ status: 200, description: 'Returns borrowing details' })
  @ApiResponse({ status: 404, description: 'Borrowing not found' })
  findOne(@Param('id') id: string) {
    return this.borrowingsService.findOne(id);
  }

  @Post(':id/return')
  @ApiOperation({ summary: 'Return a borrowed book' })
  @ApiParam({ name: 'id', description: 'Borrowing ID' })
  @ApiResponse({ status: 200, description: 'Book returned successfully' })
  @ApiResponse({ status: 400, description: 'Book already returned' })
  @ApiResponse({ status: 404, description: 'Borrowing not found' })
  returnBook(@Param('id') id: string) {
    return this.borrowingsService.returnBook(id);
  }

  @Post(':id/lost')
  @ApiOperation({ summary: 'Mark book as lost' })
  @ApiParam({ name: 'id', description: 'Borrowing ID' })
  @ApiResponse({ status: 200, description: 'Book marked as lost' })
  @ApiResponse({ status: 400, description: 'Cannot mark returned book as lost' })
  @ApiResponse({ status: 404, description: 'Borrowing not found' })
  markAsLost(@Param('id') id: string) {
    return this.borrowingsService.markAsLost(id);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get borrowing statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns borrowing statistics' })
  getBorrowingStats() {
    return this.borrowingsService.getBorrowingStats();
  }
} 