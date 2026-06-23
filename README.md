# Product Catalog API

> A production-ready backend service for browsing a catalog of **200,000+ products** with cursor-based pagination, category filtering, and Swagger documentation.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)](https://neon.tech)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://prisma.io)

---

## Project Overview

This service demonstrates how to design a **scalable, consistent product catalog backend** that handles:

- **200,000 products** in a Neon PostgreSQL database
- **Cursor-based (keyset) pagination** — stable even during concurrent inserts/updates
- **Category filtering** with composite database indexes
- **Clean Architecture** — Repository → Service → Controller layers
- **React + Tailwind frontend** with Load More pattern

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  React + Vite Frontend (Port 5173)                              │
│  ProductList → CategoryFilter → ProductCard → ProductDetail     │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTP (proxied in dev)
┌─────────────────────────▼───────────────────────────────────────┐
│  Express.js API (Port 3000)                                     │
│                                                                 │
│  Routes → Controllers → Services → Repositories                │
│                          │                                      │
│  Middleware:             │                                      │
│  • Helmet (security)     │                                      │
│  • CORS                  │                                      │
│  • Morgan + Winston      │                                      │
│  • Zod validation        │                                      │
│  • Error handler         │                                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │ Prisma ORM
┌─────────────────────────▼───────────────────────────────────────┐
│  Neon PostgreSQL                                                │
│  Table: products (200,000 rows)                                 │
│  Indexes: (updated_at DESC, id DESC)                            │
│           (category, updated_at DESC, id DESC)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Language | TypeScript 5 (strict mode) |
| Framework | Express.js 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL (Neon) |
| Validation | Zod |
| Logging | Winston + Morgan |
| API Docs | Swagger / OpenAPI 3.0 |
| Testing | Jest + ts-jest |
| Linting | ESLint + Prettier |
| Frontend | React 18 + Vite + Tailwind CSS |

---

## Database Schema

```sql
CREATE TABLE products (
  id         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT          NOT NULL,
  category   TEXT          NOT NULL,
  price      DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Cursor pagination index
CREATE INDEX idx_products_updated_at_id
  ON products (updated_at DESC, id DESC);

-- Category-filtered cursor pagination index
CREATE INDEX idx_products_category_updated_at_id
  ON products (category, updated_at DESC, id DESC);
```

---

## Pagination Strategy

### Why NOT OFFSET Pagination

OFFSET pagination (`LIMIT 20 OFFSET 100`) has two fatal problems at scale:

**Problem 1 — Performance degrades linearly**
```sql
-- PostgreSQL must scan AND discard 100,000 rows to return page 5,001
SELECT * FROM products ORDER BY updated_at DESC LIMIT 20 OFFSET 100000;
-- Execution time: ~800ms at 200K rows (vs ~2ms with cursor)
```

**Problem 2 — Unstable under concurrent writes**

Imagine a user is on page 3. Meanwhile, 5 new products are inserted at the top:

```
Before insert:  [P1, P2, P3, P4, P5, P6, P7, P8, ...]
                 Page 1      Page 2

After 5 inserts: [NEW1, NEW2, NEW3, NEW4, NEW5, P1, P2, P3, P4, P5, P6, ...]
                  ←────────── Page 1 ──────────→  ←──── Page 2 ────→
```

The user's "page 2" (OFFSET 20) now shows `P1–P5` again — **5 duplicate products**.

### Cursor Pagination (Keyset)

We sort by `(updated_at DESC, id DESC)` and encode the **last seen values** as a cursor:

```
cursor = base64url({ "updated_at": "2024-03-20T14:45:00Z", "id": "uuid-of-last-item" })
```

**Page 1:**
```sql
SELECT * FROM products
ORDER BY updated_at DESC, id DESC
LIMIT 21;  -- fetch limit+1 to detect next page
```

**Page 2 (cursor provided):**
```sql
SELECT * FROM products
WHERE
  updated_at < '2024-03-20T14:45:00Z'
  OR (updated_at = '2024-03-20T14:45:00Z' AND id < 'uuid-of-last-item')
ORDER BY updated_at DESC, id DESC
LIMIT 21;
```

**Why this is stable:** The WHERE clause anchors to a specific point in the dataset by value, not by position. New inserts at the top don't affect the cursor position — the next page always starts exactly after the last seen item.

**The `id` tie-breaker:** `updated_at` alone is not unique (many products can have the same timestamp). Adding `id` (UUID, which sorts lexicographically) makes the composite cursor fully deterministic.

### OFFSET vs Cursor Comparison

| Property | OFFSET | Cursor (Keyset) |
|----------|--------|-----------------|
| Query complexity | Simple | Moderate |
| Performance at large offsets | O(n) — slow | O(log n) — fast |
| Stable under concurrent writes | ❌ No | ✅ Yes |
| Can jump to arbitrary page | ✅ Yes | ❌ No |
| Duplicate-free guarantee | ❌ No | ✅ Yes |
| Skip-free guarantee | ❌ No | ✅ Yes |
| Works with filters | ✅ Yes | ✅ Yes |

---

## Database Indexes

### Index 1: `(updated_at DESC, id DESC)`
```sql
CREATE INDEX idx_products_updated_at_id ON products (updated_at DESC, id DESC);
```
**Purpose:** Covers the `ORDER BY` clause in all unfilterd queries. PostgreSQL can use this index to seek directly to the cursor position — no full table scan needed. The compound `(updated_at, id)` also covers the `WHERE` condition in cursor queries.

### Index 2: `(category, updated_at DESC, id DESC)`
```sql
CREATE INDEX idx_products_category_updated_at_id ON products (category, updated_at DESC, id DESC);
```
**Purpose:** Covers filtered queries (`WHERE category = 'Electronics'`). The leading `category` column lets PostgreSQL skip directly to matching rows, then use the trailing columns for the sort. Without this, PostgreSQL would need to scan all rows with the right category and then sort them.

---

## Seed Script

```bash
npm run seed
```

The seed script:
1. Generates 200,000 products **in memory** in batches of 10,000
2. Inserts each batch with `prisma.product.createMany()` (bulk insert — one SQL statement per batch)
3. Uses realistic random timestamps spread over 2 years
4. Displays real-time progress and category distribution

Expected runtime: **~30–90 seconds** depending on Neon tier and network latency.

---

## API Documentation

Interactive Swagger UI: [http://localhost:3000/docs](http://localhost:3000/docs)

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health + uptime |
| GET | `/products` | Paginated product list |
| GET | `/products/:id` | Single product by UUID |
| GET | `/categories` | All distinct categories |

### GET /products

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Items per page (1–100) |
| `cursor` | string | — | Base64url cursor from previous response |
| `category` | string | — | Filter by category |

**Example Request:**
```bash
curl "http://localhost:3000/products?limit=20&category=Electronics"
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Premium Laptop 4200",
        "category": "Electronics",
        "price": "1299.99",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-03-20T14:45:00.000Z"
      }
    ],
    "nextCursor": {
      "updated_at": "2024-03-19T09:00:00.000Z",
      "id": "abc12345-..."
    },
    "nextCursorEncoded": "eyJ1cGRhdGVkX2F0IjoiMjAyNC0wMy0xOVQwOTowMDowMC4wMDBaIiwiaWQiOiJhYmMxMjM0NS0uLi4ifQ"
  }
}
```

**Next page:**
```bash
curl "http://localhost:3000/products?limit=20&category=Electronics&cursor=eyJ1cGRhdGVkX2F0Ij..."
```

---

## Installation

### Prerequisites
- Node.js 18+
- npm 9+
- A [Neon PostgreSQL](https://neon.tech) account (free tier works)

### 1. Clone and Install

```bash
git clone https://github.com/your-username/product-catalog.git
cd product-catalog
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL` from Neon:
```
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 3. Run Database Migration

```bash
npx prisma migrate dev --name init
```

### 4. Seed the Database

```bash
npm run seed
```

### 5. Start the Server

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start
```

### 6. Start the Frontend (optional)

```bash
cd frontend
npm install
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)  
API Docs: [http://localhost:3000/docs](http://localhost:3000/docs)

---

## Running Tests

```bash
npm test              # Run all tests
npm run test:coverage # With coverage report
```

**Test coverage includes:**
- Cursor encode/decode utilities (round-trip, invalid inputs)
- Zod validator schemas (limit, cursor, category, UUID)
- Service layer (pagination logic, 404 handling, category filtering)

---

## Deployment

### Database — Neon PostgreSQL

1. Sign up at [neon.tech](https://neon.tech) (free tier)
2. Create a new project
3. Copy the connection string from the dashboard
4. Run migrations: `DATABASE_URL="..." npx prisma migrate deploy`
5. Run seed: `DATABASE_URL="..." npm run seed`

### Backend — Render

1. Push code to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repository
4. Configure:
   - **Build Command:** `npm install && npm run build && npx prisma generate`
   - **Start Command:** `npm start`
   - **Environment Variables:** `DATABASE_URL`, `NODE_ENV=production`, `PORT=3000`
5. Deploy

### Frontend — Vercel / Netlify

```bash
cd frontend
npm run build
# Deploy the `dist/` directory
```

Set `VITE_API_URL` env variable to your Render backend URL.

---

## Project Structure

```
product-catalog/
├── prisma/
│   └── schema.prisma       # Database schema with indexes
├── scripts/
│   └── seed.ts             # Bulk seed script (200K products)
├── src/
│   ├── config/
│   │   ├── database.ts     # Prisma client singleton
│   │   ├── env.ts          # Zod-validated environment variables
│   │   └── swagger.ts      # OpenAPI spec configuration
│   ├── controllers/
│   │   └── productController.ts
│   ├── middlewares/
│   │   ├── errorHandler.ts # Global error + 404 middleware
│   │   └── requestLogger.ts # Morgan + Winston
│   ├── repositories/
│   │   └── productRepository.ts # All Prisma queries
│   ├── routes/
│   │   ├── categoryRoutes.ts
│   │   ├── productRoutes.ts
│   │   └── index.ts
│   ├── services/
│   │   └── productService.ts   # Business logic
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types
│   ├── utils/
│   │   ├── cursor.ts           # Base64url encode/decode
│   │   └── response.ts         # JSON response helpers
│   ├── validators/
│   │   └── productValidator.ts # Zod schemas
│   ├── __tests__/
│   │   ├── cursor.test.ts
│   │   ├── productService.test.ts
│   │   └── productValidator.test.ts
│   ├── app.ts              # Express application setup
│   └── server.ts           # Entry point + graceful shutdown
├── frontend/
│   └── src/
│       ├── api/client.ts   # Axios API client
│       ├── components/     # ProductCard, CategoryFilter, Spinner
│       ├── hooks/          # useProducts, useProduct
│       ├── pages/          # ProductList, ProductDetail
│       └── types/          # Frontend type definitions
├── .env.example
├── jest.config.ts
├── tsconfig.json
└── README.md
```

---

## Future Improvements

- **Search**: Full-text search using PostgreSQL `tsvector` or Elasticsearch
- **Caching**: Redis cache for category list and popular products
- **Rate limiting**: `express-rate-limit` per IP
- **Authentication**: JWT-based API keys for write operations
- **Webhooks**: Real-time product update notifications
- **Analytics**: Query performance tracking with `pg_stat_statements`
- **GraphQL**: Alternative GraphQL API layer with cursor relay spec
- **Docker**: Containerized local development with `docker-compose`
- **CI/CD**: GitHub Actions pipeline for test + deploy on merge
