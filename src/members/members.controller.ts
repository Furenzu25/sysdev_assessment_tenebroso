import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from '../dto/create-member.dto';

@ApiTags('members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new library member' })
  @ApiResponse({ status: 201, description: 'Member created successfully' })
  @ApiResponse({ status: 409, description: 'Email or membership number already exists' })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all library members' })
  @ApiResponse({ status: 200, description: 'Returns all members' })
  findAll() {
    return this.membersService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search member by email' })
  @ApiQuery({ name: 'email', description: 'Member email address' })
  @ApiResponse({ status: 200, description: 'Returns member if found' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findByEmail(@Query('email') email: string) {
    return this.membersService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by ID' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Returns member details' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Get(':id/borrowings')
  @ApiOperation({ summary: 'Get member borrowing history' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Returns borrowing history' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  getBorrowingHistory(@Param('id') id: string) {
    return this.membersService.getBorrowingHistory(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update member information' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Member updated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 409, description: 'Email or membership number already exists' })
  update(@Param('id') id: string, @Body() updateMemberDto: Partial<CreateMemberDto>) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete member' })
  @ApiParam({ name: 'id', description: 'Member ID' })
  @ApiResponse({ status: 200, description: 'Member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete member with active borrowings' })
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }
} 