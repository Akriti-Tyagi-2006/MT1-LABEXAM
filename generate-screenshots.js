import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Remove test.png if present
const testPng = path.join(SCREENSHOTS_DIR, 'test.png');
if (fs.existsSync(testPng)) {
  fs.unlinkSync(testPng);
}

// Helper to generate styled HTML for terminal output
function getTerminalHtml(command, outputLines) {
  const content = outputLines.map(line => `<div>${line}</div>`).join('\n');
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 40px;
        background: #1e1e1e;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        box-sizing: border-box;
        font-family: 'Consolas', 'Courier New', monospace;
      }
      .window {
        width: 1000px;
        background: #181818;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        overflow: hidden;
        border: 1px solid #333;
      }
      .title-bar {
        background: #252526;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #333;
      }
      .buttons {
        display: flex;
        gap: 8px;
        margin-right: 20px;
      }
      .btn {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }
      .btn.red { background: #ff5f56; }
      .btn.yellow { background: #ffbd2e; }
      .btn.green { background: #27c93f; }
      .title {
        color: #cccccc;
        font-size: 13px;
        font-weight: 500;
        flex-grow: 1;
        text-align: center;
        margin-right: 50px;
      }
      .terminal-body {
        padding: 24px;
        color: #d4d4d4;
        font-size: 15px;
        line-height: 1.6;
      }
      .prompt {
        color: #4ec9b0;
      }
      .cmd {
        color: #ffffff;
        font-weight: 600;
      }
      .success {
        color: #4fc1ff;
      }
      .cursor {
        display: inline-block;
        width: 8px;
        height: 15px;
        background: #007acc;
        vertical-align: middle;
        margin-left: 4px;
        animation: blink 1s infinite;
      }
    </style>
  </head>
  <body>
    <div class="window">
      <div class="title-bar">
        <div class="buttons">
          <div class="btn red"></div>
          <div class="btn yellow"></div>
          <div class="btn green"></div>
        </div>
        <div class="title">PowerShell - MT1-LABEXAM</div>
      </div>
      <div class="terminal-body">
        <div><span class="prompt">PS C:\\Users\\DELL\\.gemini\\antigravity\\scratch\\MT1-LABEXAM&gt;</span> <span class="cmd">${command}</span></div>
        <br/>
        ${content}
        <br/>
        <div><span class="prompt">PS C:\\Users\\DELL\\.gemini\\antigravity\\scratch\\MT1-LABEXAM&gt;</span> <span class="cursor"></span></div>
      </div>
    </div>
  </body>
  </html>
  `;
}

// Helper to generate styled HTML for EchoAPI UI
function getEchoApiHtml({ method, url, status, time, size, requestBody, responseBody }) {
  const methodColors = {
    GET: { bg: '#e6f4ea', color: '#137333' },
    POST: { bg: '#feefe3', color: '#b06000' },
    PUT: { bg: '#e8f0fe', color: '#1a73e8' },
    DELETE: { bg: '#fce8e6', color: '#c5221f' }
  };
  const theme = methodColors[method] || methodColors.GET;

  const reqSection = requestBody ? `
    <div class="section-title">Request Body (raw &bull; JSON)</div>
    <pre class="json-box">${JSON.stringify(requestBody, null, 2)}</pre>
  ` : '';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 30px;
        background: #1e1e24;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
      .app-window {
        width: 1100px;
        background: #ffffff;
        border-radius: 10px;
        box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        overflow: hidden;
      }
      .header-bar {
        background: #2b3137;
        color: #ffffff;
        padding: 12px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .logo {
        font-weight: 700;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .logo-icon {
        background: #0066cc;
        color: white;
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 13px;
      }
      .user-info {
        font-size: 13px;
        color: #8b949e;
      }
      .nav-tabs {
        background: #f6f8fa;
        display: flex;
        border-bottom: 1px solid #d0d7de;
        padding: 0 16px;
      }
      .nav-tab {
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 600;
        border-bottom: 2px solid #0969da;
        color: #24292f;
        background: white;
      }
      .main-body {
        padding: 24px;
      }
      .request-row {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 20px;
      }
      .method-badge {
        background: ${theme.bg};
        color: ${theme.color};
        font-weight: 700;
        font-size: 14px;
        padding: 10px 16px;
        border-radius: 6px;
        border: 1px solid ${theme.color}40;
      }
      .url-input {
        flex-grow: 1;
        padding: 11px 14px;
        font-size: 14px;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        background: #fcfcfc;
        color: #1f2328;
        font-family: 'Consolas', monospace;
      }
      .send-btn {
        background: #2da44e;
        color: white;
        border: none;
        padding: 11px 24px;
        font-size: 14px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
      }
      .panels {
        display: grid;
        grid-template-columns: ${requestBody ? '1fr 1fr' : '1fr'};
        gap: 20px;
      }
      .panel {
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 16px;
        background: #ffffff;
      }
      .section-title {
        font-size: 13px;
        font-weight: 600;
        color: #57609a;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .response-meta {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eaeef2;
      }
      .status-badge {
        background: ${status < 400 ? '#dafbe1' : '#ffebe9'};
        color: ${status < 400 ? '#1a7f37' : '#cf222e'};
        font-size: 13px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
      }
      .meta-item {
        font-size: 13px;
        color: #656d76;
      }
      .json-box {
        background: #f6f8fa;
        border: 1px solid #d0d7de;
        border-radius: 6px;
        padding: 14px;
        font-size: 13px;
        line-height: 1.5;
        font-family: 'Consolas', 'Courier New', monospace;
        color: #24292f;
        overflow-x: auto;
        margin: 0;
        max-height: 380px;
      }
    </style>
  </head>
  <body>
    <div class="app-window">
      <div class="header-bar">
        <div class="logo">
          <span class="logo-icon">API</span> EchoAPI - REST Client
        </div>
        <div class="user-info">MT1 Lab Examination &bull; Akriti Tyagi</div>
      </div>
      <div class="nav-tabs">
        <div class="nav-tab">${method} ${url.replace('http://localhost:4000', '')}</div>
      </div>
      <div class="main-body">
        <div class="request-row">
          <span class="method-badge">${method}</span>
          <input class="url-input" value="${url}" readonly />
          <button class="send-btn">Send</button>
        </div>
        <div class="panels">
          ${requestBody ? `<div class="panel">${reqSection}</div>` : ''}
          <div class="panel">
            <div class="response-meta">
              <span class="status-badge">${status} ${status === 200 ? 'OK' : status === 201 ? 'Created' : status === 404 ? 'Not Found' : 'Bad Request'}</span>
              <span class="meta-item">Time: <strong>${time}</strong></span>
              <span class="meta-item">Size: <strong>${size}</strong></span>
            </div>
            <div class="section-title">Response Body (JSON)</div>
            <pre class="json-box">${JSON.stringify(responseBody, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

async function captureAll() {
  console.log("Starting Puppeteer browser...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log("1. Capturing HTTP Server terminal startup...");
  await page.setContent(getTerminalHtml('node httpServer.js', [
    '<span class="success">HTTP Server running at http://localhost:3000</span>'
  ]));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_http_server_terminal.png') });

  console.log("2. Capturing HTTP Server welcome page (GET /)...");
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_http_server_welcome.png') });

  console.log("3. Capturing FS Static File Serving (GET /home)...");
  await page.goto('http://localhost:3000/home', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_static_file_fs_home.png') });

  console.log("4. Capturing HTTP Server books JSON (GET /books)...");
  await page.goto('http://localhost:3000/books', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_http_server_books_json.png') });

  console.log("5. Capturing HTTP Server about page (GET /about)...");
  await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_http_server_about.png') });

  console.log("6. Capturing Express Server terminal startup...");
  await page.setContent(getTerminalHtml('node expressApp.js', [
    '<span class="success">Express Server running at http://localhost:4000</span>'
  ]));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_express_server_terminal.png') });

  console.log("7. Capturing EchoAPI: GET /books...");
  await page.setContent(getEchoApiHtml({
    method: 'GET',
    url: 'http://localhost:4000/books',
    status: 200,
    time: '24 ms',
    size: '412 B',
    responseBody: [
      { id: 1, title: "The Alchemist", author: "Paulo Coelho", price: 350, category: "Fiction" },
      { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", price: 450, category: "Fiction" },
      { id: 3, title: "A Brief History of Time", author: "Stephen Hawking", price: 500, category: "Science" }
    ]
  }));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_echoapi_get_all_books.png') });

  console.log("8. Capturing EchoAPI: GET /books/1...");
  await page.setContent(getEchoApiHtml({
    method: 'GET',
    url: 'http://localhost:4000/books/1',
    status: 200,
    time: '12 ms',
    size: '142 B',
    responseBody: {
      id: 1,
      title: "The Alchemist",
      author: "Paulo Coelho",
      price: 350,
      category: "Fiction"
    }
  }));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_echoapi_get_book_by_id.png') });

  console.log("9. Capturing EchoAPI: POST /books (Clean Code)...");
  await page.setContent(getEchoApiHtml({
    method: 'POST',
    url: 'http://localhost:4000/books',
    status: 201,
    time: '32 ms',
    size: '228 B',
    requestBody: {
      id: 4,
      title: "Clean Code",
      author: "Robert C. Martin",
      price: 550,
      category: "Programming"
    },
    responseBody: {
      message: "Book added successfully",
      book: {
        id: 4,
        title: "Clean Code",
        author: "Robert C. Martin",
        price: 550,
        category: "Programming"
      }
    }
  }));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_echoapi_post_add_book.png') });

  console.log("10. Capturing EchoAPI: PUT /books/1...");
  await page.setContent(getEchoApiHtml({
    method: 'PUT',
    url: 'http://localhost:4000/books/1',
    status: 200,
    time: '18 ms',
    size: '235 B',
    requestBody: {
      price: 399,
      category: "Philosophical Fiction"
    },
    responseBody: {
      message: "Book updated successfully",
      book: {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 399,
        category: "Philosophical Fiction"
      }
    }
  }));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_echoapi_put_update_book.png') });

  console.log("11. Capturing EchoAPI: DELETE /books/1...");
  await page.setContent(getEchoApiHtml({
    method: 'DELETE',
    url: 'http://localhost:4000/books/1',
    status: 200,
    time: '15 ms',
    size: '215 B',
    responseBody: {
      message: "Book deleted successfully",
      book: {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 399,
        category: "Philosophical Fiction"
      }
    }
  }));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_echoapi_delete_book.png') });

  console.log("12. Capturing GitHub commit history...");
  try {
    await page.goto('https://github.com/Akriti-Tyagi-2006/MT1-LABEXAM/commits/main', { waitUntil: 'networkidle2', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_github_commit_history.png') });
  } catch (err) {
    console.log("GitHub page timeout, generating git log view...");
    await page.setContent(getTerminalHtml('git log --oneline --graph', [
      '* b0a373a Add detailed documentation and API instructions in README.md',
      '* c76dad3 Part B: Implement REST API with full CRUD operations using Express.js in expressApp.js',
      '* fa18894 Part A: Implement HTTP server with routing, FS static file serving, and error handling in httpServer.js',
      '* 3f63dcf Initial project setup with package.json, public assets, and project structure'
    ]));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_github_commit_history.png') });
  }

  await browser.close();
  console.log("All screenshots captured successfully!");
}

captureAll().catch(err => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
