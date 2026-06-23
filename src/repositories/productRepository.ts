import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { CursorPayload, Product } from '../types';

export interface FindManyOptions {
  limit: number;
  cursor?: CursorPayload;
  category?: string;
}

/**
 * Builds the WHERE clause for cursor-based keyset pagination.
 *
 * For ORDER BY (updated_at DESC, id DESC), we want rows that come
 * AFTER the cursor position. With DESC ordering, "after" means:
 *   - updated_at < cursor.updated_at, OR
 *   - updated_at = cursor.updated_at AND id < cursor.id
 *
 * This is equivalent to the composite tuple comparison:
 *   (updated_at, id) < (cursor.updated_at, cursor.id)
 */
function buildCursorWhere(
  cursor: CursorPayload,
  category?: string,
): Prisma.ProductWhereInput {
  const cursorDate = new Date(cursor.updated_at);

  const cursorCondition: Prisma.ProductWhereInput = {
    OR: [
      { updated_at: { lt: cursorDate } },
      {
        AND: [
          { updated_at: { equals: cursorDate } },
          { id: { lt: cursor.id } },
        ],
      },
    ],
  };

  if (category) {
    return {
      AND: [{ category }, cursorCondition],
    };
  }

  return cursorCondition;
}

// ─── Repository ───────────────────────────────────────────────────────────────

export const productRepository = {
  /**
   * Fetches a page of products using keyset (cursor) pagination.
   *
   * Returns limit + 1 rows so the service layer can detect
   * whether a next page exists without an extra COUNT query.
   */
  async findMany(options: FindManyOptions): Promise<Product[]> {
    const { limit, cursor, category } = options;

    const where: Prisma.ProductWhereInput = cursor
      ? buildCursorWhere(cursor, category)
      : category
        ? { category }
        : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ updated_at: 'desc' }, { id: 'desc' }],
      take: limit + 1, // fetch one extra to detect next page
    });

    return products as Product[];
  },

  /**
   * Finds a single product by UUID.
   */
  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    return product as Product | null;
  },

  /**
   * Returns all distinct category values from the database.
   * Results are cached at the service layer.
   */
  async getDistinctCategories(): Promise<string[]> {
    const results = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return results.map((r) => r.category);
  },

  /**
   * Returns the total count of products matching optional category filter.
   * Used for informational purposes in responses.
   */
  async countProducts(category?: string): Promise<number> {
    return prisma.product.count({
      where: category ? { category } : {},
    });
  },
};
