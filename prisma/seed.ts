import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding library database...');

  // Create categories
  const fiction = await prisma.category.create({
    data: { name: 'Fiction', description: 'Fictional literature' }
  });

  const nonFiction = await prisma.category.create({
    data: { name: 'Non-Fiction', description: 'Non-fictional literature' }
  });

  const science = await prisma.category.create({
    data: { name: 'Science', description: 'Scientific literature' }
  });

  // Create publishers
  const penguin = await prisma.publisher.create({
    data: { 
      name: 'Penguin Books',
      email: 'contact@penguin.com',
      website: 'https://penguin.com'
    }
  });

  const harperCollins = await prisma.publisher.create({
    data: { 
      name: 'HarperCollins',
      email: 'info@harpercollins.com',
      website: 'https://harpercollins.com'
    }
  });

  // Create authors
  const jkRowling = await prisma.author.create({
    data: {
      firstName: 'J.K.',
      lastName: 'Rowling',
      biography: 'British author best known for the Harry Potter series'
    }
  });

  const georgeMartin = await prisma.author.create({
    data: {
      firstName: 'George R.R.',
      lastName: 'Martin',
      biography: 'American novelist and short story writer'
    }
  });

  const stephenKing = await prisma.author.create({
    data: {
      firstName: 'Stephen',
      lastName: 'King',
      biography: 'American author of horror, supernatural fiction, suspense, and fantasy novels'
    }
  });

  // Create books
  const harryPotter = await prisma.book.create({
    data: {
      title: 'Harry Potter and the Philosopher\'s Stone',
      isbn: '9780747532699',
      description: 'The first book in the Harry Potter series',
      language: 'English',
      pageCount: 223,
      publishedYear: 1997,
      categoryId: fiction.id
    }
  });

  const gameOfThrones = await prisma.book.create({
    data: {
      title: 'A Game of Thrones',
      isbn: '9780553103540',
      description: 'The first book in A Song of Ice and Fire series',
      language: 'English',
      pageCount: 694,
      publishedYear: 1996,
      categoryId: fiction.id
    }
  });

  const theShining = await prisma.book.create({
    data: {
      title: 'The Shining',
      isbn: '9780385121675',
      description: 'A horror novel by Stephen King',
      language: 'English',
      pageCount: 447,
      publishedYear: 1977,
      categoryId: fiction.id
    }
  });

  // Create book-author relationships
  await prisma.bookAuthor.create({
    data: {
      bookId: harryPotter.id,
      authorId: jkRowling.id,
      role: 'Author'
    }
  });

  await prisma.bookAuthor.create({
    data: {
      bookId: gameOfThrones.id,
      authorId: georgeMartin.id,
      role: 'Author'
    }
  });

  await prisma.bookAuthor.create({
    data: {
      bookId: theShining.id,
      authorId: stephenKing.id,
      role: 'Author'
    }
  });

  // Create editions
  const harryPotterEdition1 = await prisma.edition.create({
    data: {
      bookId: harryPotter.id,
      publisherId: penguin.id,
      editionNumber: '1st Edition',
      format: 'Hardcover',
      isbn: '9780747532699',
      publishedDate: new Date('1997-06-26'),
      price: 29.99,
      stockQuantity: 5,
      availableQuantity: 5
    }
  });

  const harryPotterEdition2 = await prisma.edition.create({
    data: {
      bookId: harryPotter.id,
      publisherId: penguin.id,
      editionNumber: '2nd Edition',
      format: 'Paperback',
      isbn: '9780747532743',
      publishedDate: new Date('1998-07-02'),
      price: 14.99,
      stockQuantity: 10,
      availableQuantity: 10
    }
  });

  const gameOfThronesEdition = await prisma.edition.create({
    data: {
      bookId: gameOfThrones.id,
      publisherId: harperCollins.id,
      editionNumber: '1st Edition',
      format: 'Hardcover',
      isbn: '9780553103540',
      publishedDate: new Date('1996-08-01'),
      price: 34.99,
      stockQuantity: 3,
      availableQuantity: 3
    }
  });

  // Create members
  const johnDoe = await prisma.member.create({
    data: {
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '555-0123',
      address: '123 Main St, City, State',
      membershipNumber: 'MEM001'
    }
  });

  const janeSmith = await prisma.member.create({
    data: {
      email: 'jane.smith@email.com',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '555-0456',
      address: '456 Oak Ave, City, State',
      membershipNumber: 'MEM002'
    }
  });

  // Create borrowing records
  await prisma.borrowing.create({
    data: {
      memberId: johnDoe.id,
      editionId: harryPotterEdition1.id,
      borrowedAt: new Date('2025-07-25'),
      dueDate: new Date('2025-08-25'),
      status: 'BORROWED'
    }
  });

  await prisma.borrowing.create({
    data: {
      memberId: janeSmith.id,
      editionId: gameOfThronesEdition.id,
      borrowedAt: new Date('2025-07-20'),
      dueDate: new Date('2025-08-20'),
      returnedAt: new Date('2025-07-30'),
      status: 'RETURNED'
    }
  });

  // Update available quantities
  await prisma.edition.update({
    where: { id: harryPotterEdition1.id },
    data: { availableQuantity: 4 } // 5 - 1 borrowed
  });

  await prisma.edition.update({
    where: { id: gameOfThronesEdition.id },
    data: { availableQuantity: 3 } // 3 - 0 (returned)
  });

  console.log('✅ Library database seeded successfully!');
  console.log(`📚 Created ${await prisma.book.count()} books`);
  console.log(`👥 Created ${await prisma.member.count()} members`);
  console.log(`📖 Created ${await prisma.edition.count()} editions`);
  console.log(`📋 Created ${await prisma.borrowing.count()} borrowing records`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 