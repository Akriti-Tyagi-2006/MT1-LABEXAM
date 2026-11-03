/**
 * MT1 LAB EXAMINATION - Library Book Management Web Application
 * Part A: Built-in HTTP and FS Module Server
 * Port: 3000
 * Author: Akriti Tyagi (Akriti-Tyagi-2006)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module directory resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

// In-memory data store for book records
let books = [
  {
    id: 1,
    title: "The Alchemist",
    author: "Paulo Coelho",
    price: 350
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    price: 450
  },
  {
    id: 3,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    price: 500
  }
];

// Create HTTP Server using built-in http module
const server = http.createServer((req, res) => {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // Route 1: GET / -> Welcome message in HTML format
  if (method === 'GET' && pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Welcome - Library Management System</title>
        <style>
          body { font-family: sans-serif; margin: 40px; background: #f9fafb; color: #1f2937; }
          .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 650px; }
          h1 { color: #1e3a8a; }
          ul { line-height: 1.8; }
          a { color: #2563eb; text-decoration: none; font-weight: bold; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Welcome to the Library Book Management System</h1>
          <p>This server is powered by Node.js built-in <strong>HTTP</strong> and <strong>FS</strong> modules.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <h3>Available Endpoints:</h3>
          <ul>
            <li><a href="/books">/books</a> - List of books in JSON format (GET)</li>
            <li><a href="/about">/about</a> - Library application information (GET)</li>
            <li><a href="/home">/home</a> - Static HTML home page served using FS module (GET)</li>
            <li><code>/add-book</code> - Add a new book (POST with JSON body)</li>
          </ul>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Route 2: GET /books -> List of books in JSON format
  if (method === 'GET' && pathname === '/books') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(books, null, 2));
    return;
  }

  // Route 3: GET /about -> Library application information
  if (method === 'GET' && pathname === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>About - Library Management System</title>
        <style>
          body { font-family: sans-serif; margin: 40px; background: #f9fafb; color: #1f2937; }
          .card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 650px; }
          h1 { color: #1e3a8a; }
          p { line-height: 1.6; color: #4b5563; }
          a { color: #2563eb; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>About Library Book Management System</h1>
          <p><strong>Subject:</strong> Full Stack Development &ndash; Node.js Lab Examination (MT1)</p>
          <p><strong>Developer:</strong> Akriti Tyagi</p>
          <p><strong>GitHub:</strong> <a href="https://github.com/Akriti-Tyagi-2006" target="_blank">Akriti-Tyagi-2006</a></p>
          <p><strong>Technologies:</strong> Node.js, HTTP Module, FS Module, Express.js</p>
          <p>This application demonstrates custom HTTP request handling, routing, static file serving via FS, and RESTful API operations.</p>
          <p><a href="/">&larr; Back to Welcome Page</a> | <a href="/home">Visit Home Page &rarr;</a></p>
        </div>
      </body>
      </html>
    `);
    return;
  }

  // Route 4: GET /home -> Serve static HTML page using FS Module
  if (method === 'GET' && pathname === '/home') {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error: Failed to read index.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // Route 5: POST /add-book -> Accept book details in JSON format and add to array
  if (method === 'POST' && pathname === '/add-book') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const bookData = JSON.parse(body);
        const { id, title, author, price } = bookData;

        // Validation for required fields
        if (id === undefined || !title || !author || price === undefined) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            error: 'Validation Error',
            message: 'All fields (id, title, author, price) are required.'
          }, null, 2));
          return;
        }

        // Check if book with ID already exists
        const exists = books.some(b => b.id === Number(id));
        if (exists) {
          res.writeHead(409, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            error: 'Conflict',
            message: `Book with ID ${id} already exists.`
          }, null, 2));
          return;
        }

        const newBook = {
          id: Number(id),
          title: String(title).trim(),
          author: String(author).trim(),
          price: Number(price)
        };

        books.push(newBook);

        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          message: 'Book added successfully',
          book: newBook
        }, null, 2));
      } catch (parseError) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          error: 'Bad Request',
          message: 'Invalid JSON body in request.'
        }, null, 2));
      }
    });
    return;
  }

  // Error Handling: 404 for invalid routes
  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    error: 'Not Found',
    message: `Cannot ${method} ${pathname}. Route not found.`
  }, null, 2));
});

// Configure server to listen on port 3000
server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
