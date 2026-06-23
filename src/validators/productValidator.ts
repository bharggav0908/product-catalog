import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../types';
import { env } from '../config/env';

// ─── Get Products Query ───────────────────────────────────────────────────────

export const getProductsSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? parseInt(val, 10) : env.defaultPageSize))
    .pipe(
      z
        .number()
        .int('limit must be an integer')
        .min(1, 'limit must be at least 1')
        .max(env.maxPageSize, `limit cannot exceed ${env.maxPageSize}`),
    ),

  cursor: z
    .string()
    .min(1, 'cursor cannot be empty string')
    .optional(),

  category: z
    .enum(PRODUCT_CATEGORIES, {
      errorMap: () => ({
        message: `category must be one of: ${PRODUCT_CATEGORIES.join(', ')}`,
      }),
    })
    .optional(),
});

export type GetProductsQuery = z.infer<typeof getProductsSchema>;

// ─── Get Product By ID ────────────────────────────────────────────────────────

export const getProductByIdSchema = z.object({
  id: z
    .string()
    .uuid('id must be a valid UUID'),
});

export type GetProductByIdParams = z.infer<typeof getProductByIdSchema>;

// ─── Seed Request (Optional endpoint) ────────────────────────────────────────

export const seedRequestSchema = z.object({
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'confirm must be true to proceed with seeding' }),
  }),
});
