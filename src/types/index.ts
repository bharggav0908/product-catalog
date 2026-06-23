import { Prisma } from '@prisma/client';

// ─── Product Types ────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  category: string;
  price: Prisma.Decimal;
  created_at: Date;
  updated_at: Date;
}

export interface ProductResponse {
  id: string;
  name: string;
  category: string;
  price: string;
  created_at: string;
  updated_at: string;
}

// ─── Pagination Types ─────────────────────────────────────────────────────────

export interface CursorPayload {
  updated_at: string; // ISO string
  id: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: CursorPayload | null;
  nextCursorEncoded?: string;
}

// ─── Query Types ──────────────────────────────────────────────────────────────

export interface GetProductsQuery {
  limit: number;
  cursor?: string;
  category?: string;
}

export interface ProductFilters {
  limit: number;
  cursor?: CursorPayload;
  category?: string;
}

// ─── Category Types ───────────────────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Sports',
  'Home',
  'Grocery',
  'Beauty',
  'Automotive',
  'Toys',
  'Furniture',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
