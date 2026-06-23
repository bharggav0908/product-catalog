import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product Catalog API',
      version: '1.0.0',
      description: `
## Product Catalog API

A production-ready REST API for browsing a catalog of 200,000+ products.

### Features
- **Cursor-based pagination** (keyset pagination) — stable, consistent results even during concurrent inserts
- **Category filtering** with index-optimized queries
- **Swagger/OpenAPI documentation**
- **Zod validation** on all query parameters

### Pagination Strategy
Uses composite cursor on \`(updated_at, id)\` to guarantee:
- No duplicate products across pages
- No missing products even when data is inserted/updated mid-browse
- O(log n) query performance via B-tree index seeks

### Why not OFFSET?
OFFSET pagination reads and discards N rows before returning results.
With 200,000 rows, large offsets are slow (O(n)) and unstable —
a single insert can shift all rows and cause duplicates or gaps.
      `.trim(),
      contact: {
        name: 'API Support',
        email: 'support@productcatalog.com',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://your-app.onrender.com',
        description: 'Production server (Render)',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: {
              type: 'string',
              example: 'Premium Laptop 4200',
            },
            category: {
              type: 'string',
              example: 'Electronics',
            },
            price: {
              type: 'string',
              format: 'decimal',
              example: '1299.99',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-03-20T14:45:00Z',
            },
          },
          required: ['id', 'name', 'category', 'price', 'created_at', 'updated_at'],
        },
        Cursor: {
          type: 'object',
          properties: {
            updated_at: {
              type: 'string',
              format: 'date-time',
            },
            id: {
              type: 'string',
              format: 'uuid',
            },
          },
          required: ['updated_at', 'id'],
        },
        PaginatedProducts: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/Product' },
            },
            nextCursor: {
              oneOf: [{ $ref: '#/components/schemas/Cursor' }, { type: 'null' }],
              description: 'null when no more pages exist',
            },
            total: {
              type: 'integer',
              description: 'Approximate total count (for display purposes)',
            },
          },
          required: ['items', 'nextCursor'],
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            statusCode: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Validation failed' },
            details: {
              type: 'object',
              description: 'Additional error details (validation errors)',
            },
          },
          required: ['status', 'statusCode', 'message'],
        },
      },
    },
    tags: [
      { name: 'Products', description: 'Product catalog operations' },
      { name: 'Categories', description: 'Category listing' },
      { name: 'Health', description: 'Service health check' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
