/**
 * MT1 LAB EXAMINATION - Library Book Management Web Application
 * Part B: Library Management REST API Using Express.js
 * Port: 4000
 * Author: Akriti Tyagi (Akriti-Tyagi-2006)
 */

import express from 'express';

const app = express();
const PORT = 4000;

// B1. Configure JSON parsing middleware
app.use(express.json());

// B1 & B3. Initialize an array containing at least three sample book records
let books = [
  {
    id: 1,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 350,
    category: "Fiction"
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 450,
    category: "Fiction"
  },
  {
    id: 3,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    price: 500,
    category: "Science"
  }
];

// Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: "Welcome to Library Management REST API",
    documentation: {
      "GET /books": "Retrieve all books",
      "GET /books/:id": "Retrieve a book by ID",
      "POST /books": "Add a new book",
      "PUT /books/:id": "Update book details",
      "DELETE /books/:id": "Delete a book"
    }
  });
});

// B2. GET /books - Retrieve all books
app.get('/books', (req, res) => {
  res.status(200).json(books);
});

// B2. GET /books/:id - Retrieve a book by ID
app.get('/books/:id', (req, res) => {
  const bookId = Number(req.params.id);

  if (isNaN(bookId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Book ID must be a valid number."
    });
  }

  const book = books.find(b => b.id === bookId);

  if (!book) {
    return res.status(404).json({
      error: "Not Found",
      message: `Book with ID ${bookId} not found.`
    });
  }

  res.status(200).json(book);
});

// B2. POST /books - Add a new book
app.post('/books', (req, res) => {
  const { id, title, author, price, category } = req.body;

  // Validation
  if (id === undefined || !title || !author || price === undefined || !category) {
    return res.status(400).json({
      error: "Validation Error",
      message: "id, title, author, price, and category are all required fields."
    });
  }

  const numericId = Number(id);
  if (isNaN(numericId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Book ID must be a valid number."
    });
  }

  // Check if book with ID already exists
  const existingBook = books.find(b => b.id === numericId);
  if (existingBook) {
    return res.status(409).json({
      error: "Conflict",
      message: `Book with ID ${numericId} already exists.`
    });
  }

  const newBook = {
    id: numericId,
    title: String(title).trim(),
    author: String(author).trim(),
    price: Number(price),
    category: String(category).trim()
  };

  books.push(newBook);

  // Return HTTP status code 201 when book is successfully created
  res.status(201).json({
    message: "Book added successfully",
    book: newBook
  });
});

// B2. PUT /books/:id - Update book details
app.put('/books/:id', (req, res) => {
  const bookId = Number(req.params.id);

  if (isNaN(bookId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Book ID must be a valid number."
    });
  }

  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({
      error: "Not Found",
      message: `Book with ID ${bookId} not found.`
    });
  }

  const { title, author, price, category } = req.body;

  if (title === undefined && author === undefined && price === undefined && category === undefined) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Provide at least one field to update (title, author, price, category)."
    });
  }

  // Update existing book fields
  if (title !== undefined) books[bookIndex].title = String(title).trim();
  if (author !== undefined) books[bookIndex].author = String(author).trim();
  if (price !== undefined) books[bookIndex].price = Number(price);
  if (category !== undefined) books[bookIndex].category = String(category).trim();

  res.status(200).json({
    message: "Book updated successfully",
    book: books[bookIndex]
  });
});

// B2. DELETE /books/:id - Delete a book
app.delete('/books/:id', (req, res) => {
  const bookId = Number(req.params.id);

  if (isNaN(bookId)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Book ID must be a valid number."
    });
  }

  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({
      error: "Not Found",
      message: `Book with ID ${bookId} not found.`
    });
  }

  const deletedBook = books.splice(bookIndex, 1)[0];

  res.status(200).json({
    message: "Book deleted successfully",
    book: deletedBook
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found.`
  });
});

// B1. Configure the application to listen on port 4000
app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
