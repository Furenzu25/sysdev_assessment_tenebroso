import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from '../dto/create-book.dto';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'Book created successfully' })
  @ApiResponse({ status: 409, description: 'ISBN already exists' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ status: 200, description: 'Returns all books' })
  findAll() {
    return this.booksService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search books by title, description, or ISBN' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Returns matching books' })
  search(@Query('q') query: string) {
    return this.booksService.search(query);
  }

  @Get('isbn/:isbn')
  @ApiOperation({ summary: 'Get book by ISBN' })
  @ApiParam({ name: 'isbn', description: 'Book ISBN' })
  @ApiResponse({ status: 200, description: 'Returns book details' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findByIsbn(@Param('isbn') isbn: string) {
    return this.booksService.findByIsbn(isbn);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get book by ID' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Returns book details' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update book information' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Book updated successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({ status: 409, description: 'ISBN already exists' })
  update(@Param('id') id: string, @Body() updateBookDto: Partial<CreateBookDto>) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete book' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete book with active borrowings' })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }

  @Post(':id/authors')
  @ApiOperation({ summary: 'Add author to book' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiResponse({ status: 201, description: 'Author added successfully' })
  @ApiResponse({ status: 404, description: 'Book or author not found' })
  @ApiResponse({ status: 409, description: 'Author already associated with book' })
  addAuthor(
    @Param('id') id: string,
    @Body() body: { authorId: string; role?: string }
  ) {
    return this.booksService.addAuthor(id, body.authorId, body.role);
  }

  @Delete(':id/authors/:authorId')
  @ApiOperation({ summary: 'Remove author from book' })
  @ApiParam({ name: 'id', description: 'Book ID' })
  @ApiParam({ name: 'authorId', description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author removed successfully' })
  @ApiResponse({ status: 404, description: 'Author-book relationship not found' })
  removeAuthor(@Param('id') id: string, @Param('authorId') authorId: string) {
    return this.booksService.removeAuthor(id, authorId);
  }
} 