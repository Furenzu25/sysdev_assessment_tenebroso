# SysDev Assessment Backend

A NestJS backend application with Prisma ORM and PostgreSQL database.

## Features

- 🚀 **NestJS** - Progressive Node.js framework
- 🗄️ **Prisma** - Type-safe database client
- 📊 **PostgreSQL** - Reliable database
- 📚 **Swagger** - API documentation
- ✅ **Validation** - Request validation with class-validator
- 🔧 **Configuration** - Environment-based configuration

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sysdev_assessment_db"

# Application
PORT=3000
NODE_ENV=development

# JWT (for authentication if needed later)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 3. Database Setup

1. **Create PostgreSQL Database:**
   ```sql
   CREATE DATABASE sysdev_assessment_db;
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

### 4. Start the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access:

- **API Documentation:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health

## Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app.controller.ts    # Main application controller
├── app.service.ts       # Main application service
├── app.module.ts        # Root application module
├── main.ts             # Application entry point
└── prisma/
    ├── prisma.service.ts # Prisma database service
    └── prisma.module.ts  # Prisma module

prisma/
└── schema.prisma       # Database schema definition
```

## Database Models

The application includes the following models:

- **User** - User management
- **Post** - Content management

## Development

### Adding New Features

1. Create controllers in `src/controllers/`
2. Create services in `src/services/`
3. Create DTOs in `src/dto/`
4. Update modules as needed

### Database Changes

1. Modify `prisma/schema.prisma`
2. Generate Prisma client: `npx prisma generate`
3. Create migration: `npx prisma migrate dev --name <migration-name>`

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

1. Set environment variables for production
2. Build the application: `npm run build`
3. Start in production mode: `npm run start:prod`

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
