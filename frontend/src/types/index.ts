// ─── Product Types ────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  created_at: string;
  updated_at: string;
}

// ─── Pagination Types ─────────────────────────────────────────────────────────

export interface CursorPayload {
  updated_at: string;
  id: string;
}

export interface PaginatedResponse {
  items: Product[];
  nextCursor: CursorPayload | null;
  nextCursorEncoded?: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export type ProductCategory =
  | 'Electronics'
  | 'Clothing'
  | 'Books'
  | 'Sports'
  | 'Home'
  | 'Grocery'
  | 'Beauty'
  | 'Automotive'
  | 'Toys'
  | 'Furniture';

export const ALL_CATEGORIES: ProductCategory[] = [
  'Electronics', 'Clothing', 'Books', 'Sports', 'Home',
  'Grocery', 'Beauty', 'Automotive', 'Toys', 'Furniture',
];

export interface ProductsQueryParams {
  limit?: number;
  cursor?: string;
  category?: string;
}
