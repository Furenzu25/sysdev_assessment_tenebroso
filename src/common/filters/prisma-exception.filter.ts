import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ErrorResponse } from '../interfaces/error-response.interface';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database operation failed';
    let details = {};

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'A record with this unique field already exists';
        details = {
          field: this.extractFieldFromConstraint(exception.meta?.target),
          constraint: 'UNIQUE',
          suggestion: 'Use a different value for this field'
        };
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Referenced record does not exist';
        details = {
          field: exception.meta?.field_name,
          constraint: 'FOREIGN_KEY',
          suggestion: 'Ensure the referenced record exists before creating this relationship'
        };
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        details = {
          constraint: 'NOT_FOUND',
          suggestion: 'Check if the record exists and you have the correct ID'
        };
        break;
      case 'P2021':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database table does not exist';
        details = {
          constraint: 'TABLE_NOT_FOUND',
          suggestion: 'Check database schema and run migrations if needed'
        };
        break;
      case 'P2022':
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database column does not exist';
        details = {
          field: exception.meta?.column_name,
          constraint: 'COLUMN_NOT_FOUND',
          suggestion: 'Check database schema and run migrations if needed'
        };
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Database operation failed';
        details = {
          constraint: 'UNKNOWN_ERROR',
          suggestion: 'Check database logs for more details'
        };
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: exception.code,
      timestamp: new Date().toISOString(),
      path: request.url,
      details,
      debug: {
        operation: 'DATABASE',
        entity: this.extractEntityFromError(exception),
        method: request.method
      }
    };

    response.status(status).json(errorResponse);
  }

  private extractFieldFromConstraint(target: any): string {
    if (Array.isArray(target)) {
      return target.join(', ');
    }
    return target || 'unknown';
  }

  private extractEntityFromError(exception: Prisma.PrismaClientKnownRequestError): string {
    const message = exception.message;
    if (message.includes('Member')) return 'Member';
    if (message.includes('Book')) return 'Book';
    if (message.includes('Category')) return 'Category';
    if (message.includes('Borrowing')) return 'Borrowing';
    if (message.includes('Edition')) return 'Edition';
    return 'Unknown';
  }
} 