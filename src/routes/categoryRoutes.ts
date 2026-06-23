import { Router } from 'express';
import { productController } from '../controllers/productController';

const router = Router();

/**
 * @openapi
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all product categories
 *     description: Returns the list of distinct product categories available in the catalog.
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [Electronics, Clothing, Books, Sports, Home, Grocery, Beauty, Automotive, Toys, Furniture]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req, res, next) => {
  void productController.getCategories(req, res, next);
});

export { router as categoryRoutes };
