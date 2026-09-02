# 🚀 CrawlAI

> A lightweight web data extraction tool built with Node.js, Express.js, and Cheerio.

CrawlAI makes it easy to extract structured information from webpages through a simple and user-friendly interface.

It supports product extraction, complete webpage extraction, custom CSS-selector extraction, and JSON/CSV exports.

## 🌐 Live Demo

👉 Try CrawlAI: https://crawlai-960r.onrender.com

## 📸 Preview

![CrawlAI Screenshot](crawlai-screenshot.png)

---

## 🎯 What Problem Does CrawlAI Solve?

Collecting information from websites manually can be repetitive and time-consuming.

CrawlAI simplifies this process by allowing users to:

1. Enter a webpage URL
2. Choose an extraction mode
3. Extract structured information
4. View the results
5. Download the data as JSON or CSV

The project was built to gain practical experience with **web scraping, backend development, data extraction, APIs, security, and deployment**.

---
## 💡 Why I Built CrawlAI

I built CrawlAI as a hands-on project to strengthen my understanding of web scraping, backend development, APIs, data extraction, security, and deployment.

Instead of building only a small demo, I wanted to take the idea from development to a publicly accessible application.

This project helped me understand the complete journey:

**Idea → Development → Security → GitHub → Deployment → Live Application**

CrawlAI is also an ongoing project, and I plan to continue improving it with new extraction capabilities and features.

----

## ✨ Key Features

- 🔍 **Product Extraction** — Extract product titles, prices, availability, images, and URLs.
- 📄 **Everything Extraction** — Extract page title, description, headings, links, images, and text.
- 🎯 **Custom Extraction** — Extract specific webpage elements using CSS selectors.
- 📋 **JSON Export** — Download extracted data as JSON.
- 📊 **CSV Export** — Download structured data as CSV.
- 🔐 **URL Validation** — Validate URLs before making requests.
- 🛡️ **Basic SSRF Protection** — Block localhost and common private/internal IP ranges.
- 🚦 **Rate Limiting** — Help prevent excessive API requests.
- ⏱️ **Request Timeout** — Prevent requests from running indefinitely.
- 📱 **Responsive Interface** — Works across different screen sizes.

---

## 🛠️ Technologies Used

| **Technology** | **Purpose** |
|---|---|
| HTML | Frontend structure |
| CSS | User interface and responsive design |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | Web server and API |
| Cheerio | HTML parsing and data extraction |
| Git & GitHub | Version control |
| Render | Cloud deployment |

---

## 🔄 How It Works

```text
Enter URL
    ↓
Choose Extraction Mode
    ↓
CrawlAI Fetches Webpage
    ↓
Cheerio Parses HTML
    ↓
Structured Data Generated
    ↓
View Results
    ↓
Download JSON / CSV
