import { AppError } from '../middlewares/errorHandler';
import { productRepository } from '../repositories/productRepository';
import { CursorPayload, PaginatedResponse, Product, ProductResponse } from '../types';
import { decodeCursor, encodeCursor } from '../utils/cursor';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serializeProduct(product: Product): ProductResponse {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price.toFixed(2),
    created_at: product.created_at.toISOString(),
    updated_at: product.updated_at.toISOString(),
  };
}

function extractCursor(product: Product): CursorPayload {
  return {
    updated_at: product.updated_at.toISOString(),
    id: product.id,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const productService = {
  /**
   * Retrieves a paginated list of products using keyset pagination.
   *
   * Strategy:
   * 1. Decode the cursor (if provided) to get the last seen (updated_at, id)
   * 2. Fetch limit + 1 rows from DB
   * 3. If we got limit + 1 rows, a next page exists — encode cursor from row[limit]
   * 4. Return only the first `limit` rows
   */
  async getProducts(options: {
    limit: number;
    cursor?: string;
    category?: string;
  }): Promise<PaginatedResponse<ProductResponse>> {
    const { limit, cursor: cursorString, category } = options;

    let cursor: CursorPayload | undefined;

    if (cursorString) {
      const decoded = decodeCursor(cursorString);
      if (!decoded) {
        throw new AppError('Invalid or malformed cursor', 400);
      }
      cursor = decoded;
    }

    const rows = await productRepository.findMany({ limit, cursor, category });

    const hasNextPage = rows.length > limit;
    const pageRows = hasNextPage ? rows.slice(0, limit) : rows;

    const nextCursor =
      hasNextPage && pageRows.length > 0
        ? extractCursor(pageRows[pageRows.length - 1])
        : null;

    const encodedNextCursor = nextCursor ? encodeCursor(nextCursor) : null;

    return {
      items: pageRows.map(serializeProduct),
      nextCursor: encodedNextCursor
        ? { updated_at: nextCursor!.updated_at, id: nextCursor!.id }
        : null,
      // We expose the encoded string as a separate field for convenience
      ...(encodedNextCursor ? { nextCursorEncoded: encodedNextCursor } : {}),
    } as PaginatedResponse<ProductResponse>;
  },

  /**
   * Returns a single product by its UUID.
   */
  async getProductById(id: string): Promise<ProductResponse> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new AppError(`Product with id '${id}' not found`, 404);
    }

    return serializeProduct(product);
  },

  /**
   * Returns all distinct product categories.
   */
  async getCategories(): Promise<string[]> {
    return productRepository.getDistinctCategories();
  },
};
