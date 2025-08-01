import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../interfaces/error-response.interface';

@Catch()
export class BusinessExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Only handle specific business logic exceptions
    if (!this.isBusinessLogicError(exception)) {
      return; // Let other filters handle it
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Handle different types of business logic errors
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;
    let details = {};

    // Check for specific error types
    if (exception.message.includes('Member has reached the maximum borrowing limit')) {
      status = HttpStatus.BAD_REQUEST;
      details = {
        field: 'borrowing_limit',
        constraint: 'MAX_BORROWINGS',
        suggestion: 'Return some books before borrowing new ones'
      };
    } else if (exception.message.includes('Member has overdue books')) {
      status = HttpStatus.BAD_REQUEST;
      details = {
        field: 'overdue_books',
        constraint: 'OVERDUE_PREVENTION',
        suggestion: 'Return overdue books before borrowing new ones'
      };
    } else if (exception.message.includes('No copies available')) {
      status = HttpStatus.CONFLICT;
      details = {
        field: 'availability',
        constraint: 'OUT_OF_STOCK',
        suggestion: 'Check back later or try a different edition'
      };
    } else if (exception.message.includes('Member account is inactive')) {
      status = HttpStatus.BAD_REQUEST;
      details = {
        field: 'member_status',
        constraint: 'INACTIVE_ACCOUNT',
        suggestion: 'Contact library staff to reactivate your account'
      };
    } else if (exception.message.includes('Cannot delete member with active borrowings')) {
      status = HttpStatus.CONFLICT;
      details = {
        field: 'active_borrowings',
        constraint: 'ACTIVE_BORROWINGS',
        suggestion: 'Return all borrowed books before deleting the member'
      };
    } else if (exception.message.includes('Cannot delete book with active borrowings')) {
      status = HttpStatus.CONFLICT;
      details = {
        field: 'book_borrowings',
        constraint: 'ACTIVE_BORROWINGS',
        suggestion: 'Wait for all borrowed copies to be returned before deleting'
      };
    } else if (exception.message.includes('Cannot delete category')) {
      status = HttpStatus.CONFLICT;
      details = {
        field: 'category_books',
        constraint: 'ASSOCIATED_BOOKS',
        suggestion: 'Remove or reassign all books in this category before deleting'
      };
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: 'BUSINESS_LOGIC_ERROR',
      timestamp: new Date().toISOString(),
      path: request.url,
      details,
      debug: {
        operation: 'BUSINESS_LOGIC',
        entity: this.extractEntityFromError(exception),
        method: request.method
      }
    };

    response.status(status).json(errorResponse);
  }

  private extractEntityFromError(exception: Error): string {
    const message = exception.message;
    if (message.includes('Member')) return 'Member';
    if (message.includes('Book')) return 'Book';
    if (message.includes('Category')) return 'Category';
    if (message.includes('Borrowing')) return 'Borrowing';
    if (message.includes('Edition')) return 'Edition';
    return 'Unknown';
  }

  private isBusinessLogicError(exception: any): boolean {
    if (!exception || !exception.message) return false;
    
    const businessLogicMessages = [
      'Member has reached the maximum borrowing limit',
      'Member has overdue books',
      'No copies available',
      'Member account is inactive',
      'Cannot delete member with active borrowings',
      'Cannot delete book with active borrowings',
      'Cannot delete category'
    ];

    return businessLogicMessages.some(msg => exception.message.includes(msg));
  }
} 