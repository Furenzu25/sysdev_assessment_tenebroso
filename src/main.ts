import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { BusinessExceptionFilter } from './common/filters/business-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global exception filters (order matters - Prisma first, then business logic)
  app.useGlobalFilters(new PrismaExceptionFilter(), new BusinessExceptionFilter());

  // Global interceptor for consistent responses
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Library Management System API')
    .setDescription('A comprehensive library management system with books, members, borrowings, and categories')
    .setVersion('1.0')
    .addTag('app', 'Application endpoints')
    .addTag('categories', 'Book categories management')
    .addTag('books', 'Books management')
    .addTag('members', 'Library members management')
    .addTag('borrowings', 'Book borrowing operations')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
