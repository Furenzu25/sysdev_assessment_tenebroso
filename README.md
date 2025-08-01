# Library Management System API

A comprehensive library management system built with NestJS, Prisma, and PostgreSQL. This system provides full CRUD operations for managing books, members, borrowings, and categories with advanced business logic and validation.

## 🚀 Features

### Core Functionality
- **Books Management**: Create, read, update, delete books with categories and authors
- **Members Management**: Manage library members with borrowing history
- **Borrowing System**: Complete borrowing workflow with fine calculation
- **Categories**: Organize books by categories/genres
- **Inventory Tracking**: Track book editions, stock quantities, and availability

### Advanced Features
- **Fine Calculation**: Automatic overdue fine calculation ($0.50/day)
- **Borrowing Limits**: Maximum 5 books per member
- **Overdue Prevention**: Members with overdue books cannot borrow new books
- **Lost Book Handling**: Replacement cost calculation (50% of book price)
- **Real-time Inventory**: Automatic stock updates on borrow/return
- **Comprehensive Logging**: Detailed operation logging
- **API Documentation**: Interactive Swagger UI

### Technical Features
- **Type Safety**: Full TypeScript implementation
- **Data Validation**: Comprehensive input validation with class-validator
- **Error Handling**: Graceful error handling with custom exception filters
- **Database Transactions**: ACID-compliant operations
- **RESTful API**: Standard REST endpoints with proper HTTP status codes
- **CORS Support**: Cross-origin resource sharing enabled
- **Environment Configuration**: Flexible environment-based configuration

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sysdev_assessment_tenebroso
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/library_db"
   PORT=3000
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb library_db
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Generate Prisma client
   npx prisma generate
   
   # Seed the database (optional)
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production build
   npm run build
   npm run start:prod
   ```

## 📚 API Endpoints

### Application
- `GET /` - Hello message
- `GET /health` - Health check
- `GET /stats` - Library statistics

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create a new category
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Books
- `GET /books` - Get all books
- `POST /books` - Create a new book
- `GET /books/search` - Search books
- `GET /books/isbn/:isbn` - Get book by ISBN
- `GET /books/:id` - Get book by ID
- `PATCH /books/:id` - Update book
- `DELETE /books/:id` - Delete book
- `POST /books/:id/authors` - Add author to book
- `DELETE /books/:id/authors/:authorId` - Remove author from book

### Members
- `GET /members` - Get all members
- `POST /members` - Create a new member
- `GET /members/search` - Search members
- `GET /members/:id` - Get member by ID
- `GET /members/:id/borrowings` - Get member's borrowing history
- `PATCH /members/:id` - Update member
- `DELETE /members/:id` - Delete member

### Borrowings
- `GET /borrowings` - Get all borrowings
- `POST /borrowings` - Create a new borrowing
- `GET /borrowings/overdue` - Get overdue books
- `GET /borrowings/status/:status` - Get borrowings by status
- `GET /borrowings/member/:memberId` - Get member's borrowings
- `GET /borrowings/:id` - Get borrowing by ID
- `POST /borrowings/:id/return` - Return a book
- `POST /borrowings/:id/lost` - Mark book as lost
- `GET /borrowings/stats/overview` - Get borrowing statistics

## 🔧 Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Application port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

### Database Schema
The system uses a comprehensive database schema with the following main entities:
- **Members**: Library patrons with contact information
- **Categories**: Book categories/genres
- **Publishers**: Book publishers
- **Authors**: Book authors
- **Books**: Main book information
- **BookAuthors**: Many-to-many relationship between books and authors
- **Editions**: Book editions with inventory tracking
- **Borrowings**: Borrowing records with status tracking

## 🧪 Testing

### Manual Testing
1. Start the application: `npm run start:dev`
2. Open Swagger UI: http://localhost:3000/api
3. Test endpoints using the interactive interface

### API Testing Examples
```bash
# Create a category
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Fiction", "description": "Fictional literature"}'

# Create a book
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Sample Book", "isbn": "978-1234567890", "categoryId": "category-id"}'

# Create a member
curl -X POST http://localhost:3000/members \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "firstName": "John", "lastName": "Doe", "membershipNumber": "MEM001"}'
```

## 📊 Business Rules

### Borrowing Rules
- Members can borrow up to 5 books simultaneously
- Members with overdue books cannot borrow new books
- Books are automatically returned after 30 days (configurable)
- Overdue fines are calculated at $0.50 per day

### Inventory Rules
- Book availability is tracked in real-time
- Stock quantities are automatically updated on borrow/return
- Lost books incur a replacement cost (50% of book price)

### Data Integrity
- Foreign key constraints ensure data consistency
- Unique constraints prevent duplicate entries
- Soft deletes maintain referential integrity

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.
