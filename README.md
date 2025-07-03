# Branion - AI-Powered Knowledge Organizer

Branion is a full-stack AI-powered web application that allows users to upload, save, and search documents, links, and notes intelligently. It leverages modern technologies like Google OAuth for login, pgvector + PostgreSQL for semantic search, and Gemini AI for embedding and answering user queries. The platform is designed for knowledge workers, students, and developers who want to store and retrieve context-aware content with minimal effort.


## 📚 Index
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure-backend)
- [Semantic Search Architecture](#-semantic-search-architecture)
- [File & Content Processing Flow](#-file--content-processing-flow)
- [Security](#-security)
- [Development Setup](#-development-setup)
- [Planned Improvements](#-planned-improvements)
- [License](#-license)
- [Author](#-author)


## 🚀 Features

- 🔐 **Google OAuth Authentication**: Secure user login using Passport.js with session-based authentication.
- 📎 **Link Saving with Metadata Extraction**: Automatically extracts title, content, and thumbnails from URLs (YouTube, Twitter, websites).
- 📄 **Document Upload**: Users can upload documents (like PDFs) which are stored in cloud storage and semantically indexed.
- 🗒️ **Note Taking**: Users can save short or long-form notes manually, which are also embedded and searchable.
- 🔍 **AI-Powered Semantic Search**: Users can search saved content using natural language queries with context-based ranking.
- 💬 **AI Query Responses**: The app can respond to user questions using Gemini, pulling context from the most relevant document, note, or link.

## ⚙️ Tech Stack

### Backend:
- **Node.js + Express**
- **PostgreSQL** with `pgvector` extension
- **Prisma ORM** + `raw SQL` (for vector type support)
- **Passport.js** for OAuth
- **Tebi Storage** (S3-compatible object storage)
- **Puppeteer** (for Twitter/Web scraping)
- **Gemini API** (for embeddings and generative answers)

### Frontend:
- [Frontend](https://github.com/Jaya-Vashisth/frontend-marklet)
- API routes exposed via `/api/v1/...`

## 🧠 Semantic Search Architecture

1. **User Query** is converted to an embedding vector via Gemini.
2. Query embedding is matched using cosine similarity in Postgres (`<=>` operator via pgvector).
3. Optional keyword and date relevance is scored using SQL.
4. Gemini can optionally summarize the most relevant match into a natural language answer.

## 📂 Folder Structure (Backend)
```
├── prisma
├── src
│   ├── config
│   ├── controllers
│   ├── middlewares
│   ├── routes
│   ├── services
│   ├── app.ts
│   └── prisma.ts
├── .env
├── .gitignore
├── nodemon.json
├── package-lock.json
├── package.json
```

## 📦 File & Content Processing Flow

### 📎 Links
1. User submits a link.
2. Metadata (title, content, image) is fetched using:
   - YouTube API for YouTube links
   - Puppeteer for Twitter and generic web pages
3. A text summary is constructed and sent to Gemini for embedding.
4. Result is saved to the `Content` table in PostgreSQL along with its type (`LINK`).

### 📄 Documents
1. User uploads a document (e.g., PDF).
2. It is uploaded to **Tebi** (S3-compatible storage).
3. Content is extracted (e.g., via `pdf-parse`).
4. Text is embedded using Gemini and stored along with metadata.
5. The file URL, title, content, and embedding are saved in the DB as type `DOCUMENT`.

### 🗒️ Notes
1. Users create manual notes from the frontend.
2. The note text is embedded via Gemini.
3. Stored in the same `Content` table with type `NOTE`.'

## 🛡️ Security

- Rate limiting via `express-rate-limit`
- `helmet` for securing HTTP headers
- Input sanitization & validation for user data
- Session cookies marked `HttpOnly`, `SameSite=None`, `Secure`

## 🧪 Development Setup

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Environment variables required
- GEMINI_API_KEY
- YOUTUBE_API_KEY
- TEBI_ACCESS_KEY
- TEBI_SECRET_KEY
- DATABASE_URL (PostgreSQL)
- CLIENT_URL (Frontend URL)
- SESSION_SECRET
```

## 📃 License
MIT License

## 🧑‍💻 Author
Jaya Vashisth
