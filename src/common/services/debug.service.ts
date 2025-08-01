import { Injectable } from '@nestjs/common';

@Injectable()
export class DebugService {
  private readonly logger = console;

  logError(operation: string, error: any, context?: any) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      operation,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      context,
      type: 'ERROR'
    };

    this.logger.error('🔴 ERROR LOG:', JSON.stringify(errorLog, null, 2));
  }

  logOperation(operation: string, data: any, result?: any) {
    const operationLog = {
      timestamp: new Date().toISOString(),
      operation,
      input: data,
      result: result ? 'SUCCESS' : 'PENDING',
      type: 'OPERATION'
    };

    this.logger.log('🔵 OPERATION LOG:', JSON.stringify(operationLog, null, 2));
  }

  logValidation(operation: string, field: string, value: any, constraint: string) {
    const validationLog = {
      timestamp: new Date().toISOString(),
      operation,
      validation: {
        field,
        value,
        constraint,
        status: 'FAILED'
      },
      type: 'VALIDATION'
    };

    this.logger.warn('🟡 VALIDATION LOG:', JSON.stringify(validationLog, null, 2));
  }

  logBusinessRule(operation: string, rule: string, details: any) {
    const businessLog = {
      timestamp: new Date().toISOString(),
      operation,
      businessRule: {
        rule,
        details,
        status: 'APPLIED'
      },
      type: 'BUSINESS_RULE'
    };

    this.logger.log('🟢 BUSINESS RULE LOG:', JSON.stringify(businessLog, null, 2));
  }
} 