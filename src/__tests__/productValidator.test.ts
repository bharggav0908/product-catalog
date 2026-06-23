// Mock env BEFORE importing productValidator (which imports env)
jest.mock('../config/env', () => ({
  env: {
    defaultPageSize: 20,
    maxPageSize: 100,
    isDevelopment: false,
    isTest: true,
    nodeEnv: 'test',
    port: 3000,
    allowedOrigins: [],
    databaseUrl: 'postgresql://test',
  },
}));

import { getProductsSchema, getProductByIdSchema } from '../validators/productValidator';

describe('Product Validators', () => {
  describe('getProductsSchema', () => {
    it('should apply default limit when not provided', () => {
      const result = getProductsSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it('should parse valid limit', () => {
      const result = getProductsSchema.safeParse({ limit: '50' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('should reject limit below 1', () => {
      const result = getProductsSchema.safeParse({ limit: '0' });
      expect(result.success).toBe(false);
    });

    it('should reject limit above 100', () => {
      const result = getProductsSchema.safeParse({ limit: '101' });
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric limit', () => {
      const result = getProductsSchema.safeParse({ limit: 'abc' });
      expect(result.success).toBe(false);
    });

    it('should accept a valid category', () => {
      const result = getProductsSchema.safeParse({ category: 'Electronics' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe('Electronics');
      }
    });

    it('should reject an invalid category', () => {
      const result = getProductsSchema.safeParse({ category: 'InvalidCategory' });
      expect(result.success).toBe(false);
    });

    it('should accept an optional cursor string', () => {
      const result = getProductsSchema.safeParse({ cursor: 'abc123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.cursor).toBe('abc123');
      }
    });

    it('should reject an empty cursor string', () => {
      const result = getProductsSchema.safeParse({ cursor: '' });
      expect(result.success).toBe(false);
    });

    it('should accept all parameters together', () => {
      const result = getProductsSchema.safeParse({
        limit: '10',
        cursor: 'validcursor',
        category: 'Books',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          limit: 10,
          cursor: 'validcursor',
          category: 'Books',
        });
      }
    });
  });

  describe('getProductByIdSchema', () => {
    it('should accept a valid UUID', () => {
      const result = getProductByIdSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('should reject a non-UUID string', () => {
      const result = getProductByIdSchema.safeParse({ id: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('should reject missing id', () => {
      const result = getProductByIdSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
