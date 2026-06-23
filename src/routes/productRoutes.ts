import { Router } from 'express';
import { productController } from '../controllers/productController';

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products with cursor pagination
 *     description: |
 *       Returns a paginated list of products ordered by `updated_at DESC, id DESC`.
 *
 *       **Cursor Pagination**: Pass the `nextCursorEncoded` from a previous response
 *       as the `cursor` query parameter to get the next page. The cursor encodes
 *       `(updated_at, id)` which guarantees stable pagination even under concurrent writes.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of products to return per page
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Base64-encoded cursor from previous page's `nextCursorEncoded`
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Electronics, Clothing, Books, Sports, Home, Grocery, Beauty, Automotive, Toys, Furniture]
 *         description: Filter products by category
 *     responses:
 *       200:
 *         description: Successful paginated response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/PaginatedProducts'
 *             example:
 *               status: success
 *               data:
 *                 items:
 *                   - id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Premium Laptop 4200"
 *                     category: "Electronics"
 *                     price: "1299.99"
 *                     created_at: "2024-01-15T10:30:00.000Z"
 *                     updated_at: "2024-03-20T14:45:00.000Z"
 *                 nextCursor:
 *                   updated_at: "2024-03-19T09:00:00.000Z"
 *                   id: "abc12345-..."
 *                 nextCursorEncoded: "eyJ1cGRhdGVkX2F0IjoiMjAyNC0wMy0xOVQwOTowMDowMC4..."
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req, res, next) => {
  void productController.getProducts(req, res, next);
});

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a single product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product UUID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid UUID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', (req, res, next) => {
  void productController.getProductById(req, res, next);
});

export { router as productRoutes };
