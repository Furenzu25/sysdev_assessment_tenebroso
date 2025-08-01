import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: any, context?: string) {
    console.log(`[${new Date().toISOString()}] [${context || this.context || 'APP'}] ${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    console.error(`[${new Date().toISOString()}] [${context || this.context || 'APP'}] ERROR: ${message}`);
    if (trace) {
      console.error(`[${new Date().toISOString()}] [${context || this.context || 'APP'}] TRACE: ${trace}`);
    }
  }

  warn(message: any, context?: string) {
    console.warn(`[${new Date().toISOString()}] [${context || this.context || 'APP'}] WARN: ${message}`);
  }

  debug(message: any, context?: string) {
    console.debug(`[${new Date().toISOString()}] [${context || this.context || 'APP'}] DEBUG: ${message}`);
  }

  verbose(message: any, context?: string) {
    console.log(`[${new Date().toISOString()}] [${context || this.context || 'APP'}] VERBOSE: ${message}`);
  }
} 