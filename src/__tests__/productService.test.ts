import { Prisma } from '@prisma/client';

// ─── Mock the repository ──────────────────────────────────────────────────────

jest.mock('../repositories/productRepository', () => ({
  productRepository: {
    findMany: jest.fn(),
    findById: jest.fn(),
    getDistinctCategories: jest.fn(),
    countProducts: jest.fn(),
  },
}));

// Must mock env before importing service
jest.mock('../config/env', () => ({
  env: {
    defaultPageSize: 20,
    maxPageSize: 100,
    isDevelopment: false,
    isProduction: false,
    isTest: true,
    nodeEnv: 'test',
    port: 3000,
    allowedOrigins: [],
    databaseUrl: 'postgresql://test',
  },
}));

import { productService } from '../services/productService';
import { productRepository } from '../repositories/productRepository';
import { encodeCursor } from '../utils/cursor';

const mockRepo = productRepository as jest.Mocked<typeof productRepository>;

const makeProduct = (overrides: Partial<{
  id: string;
  updated_at: Date;
  category: string;
}> = {}) => ({
  id: overrides.id ?? '550e8400-e29b-41d4-a716-446655440000',
  name: 'Premium Laptop 4200',
  category: overrides.category ?? 'Electronics',
  price: new Prisma.Decimal('1299.99'),
  created_at: new Date('2024-01-15T10:30:00.000Z'),
  updated_at: overrides.updated_at ?? new Date('2024-03-20T14:45:00.000Z'),
});

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return items with no nextCursor when results fit in one page', async () => {
      const products = [makeProduct(), makeProduct({ id: '550e8400-e29b-41d4-a716-446655440001' })];
      mockRepo.findMany.mockResolvedValue(products);

      const result = await productService.getProducts({ limit: 20 });

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it('should return nextCursor when limit+1 rows returned', async () => {
      // 21 items returned for limit=20 → next page exists
      const products = Array.from({ length: 21 }, (_, i) =>
        makeProduct({ id: `550e8400-e29b-41d4-a716-44665544${String(i).padStart(4, '0')}` }),
      );
      mockRepo.findMany.mockResolvedValue(products);

      const result = await productService.getProducts({ limit: 20 });

      expect(result.items).toHaveLength(20);
      expect(result.nextCursor).not.toBeNull();
      expect(result.nextCursor).toHaveProperty('updated_at');
      expect(result.nextCursor).toHaveProperty('id');
    });

    it('should pass decoded cursor to repository when cursor provided', async () => {
      const cursorPayload = {
        updated_at: '2024-03-20T14:45:00.000Z',
        id: '550e8400-e29b-41d4-a716-446655440000',
      };
      const encoded = encodeCursor(cursorPayload);

      mockRepo.findMany.mockResolvedValue([]);

      await productService.getProducts({ limit: 20, cursor: encoded });

      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: cursorPayload,
          limit: 20,
        }),
      );
    });

    it('should throw 400 for an invalid/malformed cursor', async () => {
      await expect(
        productService.getProducts({ limit: 20, cursor: 'malformed!!!' }),
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it('should pass category filter to repository', async () => {
      mockRepo.findMany.mockResolvedValue([]);

      await productService.getProducts({ limit: 10, category: 'Books' });

      expect(mockRepo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Books' }),
      );
    });

    it('should serialize price as string in response', async () => {
      mockRepo.findMany.mockResolvedValue([makeProduct()]);

      const result = await productService.getProducts({ limit: 20 });

      expect(typeof result.items[0].price).toBe('string');
      expect(result.items[0].price).toBe('1299.99');
    });
  });

  describe('getProductById', () => {
    it('should return a product when found', async () => {
      mockRepo.findById.mockResolvedValue(makeProduct());

      const result = await productService.getProductById('550e8400-e29b-41d4-a716-446655440000');

      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.name).toBe('Premium Laptop 4200');
    });

    it('should throw 404 when product not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(
        productService.getProductById('550e8400-e29b-41d4-a716-446655440099'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('getCategories', () => {
    it('should return list of categories', async () => {
      const categories = ['Electronics', 'Books', 'Clothing'];
      mockRepo.getDistinctCategories.mockResolvedValue(categories);

      const result = await productService.getCategories();

      expect(result).toEqual(categories);
    });
  });
});
