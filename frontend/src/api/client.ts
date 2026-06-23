import axios from 'axios';
import type { ApiResponse, PaginatedResponse, Product, ProductsQueryParams } from '../types';

// In dev, Vite proxy forwards /api → localhost:3000
// In production, set VITE_API_URL env variable
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request / Response interceptors ─────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const message =
        (error.response?.data as { message?: string })?.message ??
        error.message ??
        'Network error';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  },
);

// ─── API Functions ────────────────────────────────────────────────────────────

export const api = {
  async getProducts(params: ProductsQueryParams = {}): Promise<PaginatedResponse> {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', String(params.limit));
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.category) query.set('category', params.category);

    const { data } = await apiClient.get<ApiResponse<PaginatedResponse>>(
      `/products?${query.toString()}`,
    );
    return data.data!;
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return data.data!;
  },

  async getCategories(): Promise<string[]> {
    const { data } = await apiClient.get<ApiResponse<{ categories: string[] }>>('/categories');
    return data.data!.categories;
  },
};
