import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService';
import { getProductsSchema, getProductByIdSchema } from '../validators/productValidator';
import { sendSuccess, sendNotFound, sendBadRequest } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

export const productController = {
  /**
   * GET /products
   * Returns a paginated list of products, ordered by updated_at DESC, id DESC.
   */
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = getProductsSchema.safeParse(req.query);

      if (!parsed.success) {
        sendBadRequest(res, 'Validation failed', parsed.error.flatten().fieldErrors);
        return;
      }

      const { limit, cursor, category } = parsed.data;
      const result = await productService.getProducts({ limit, cursor, category });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /products/:id
   * Returns a single product by UUID.
   */
  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = getProductByIdSchema.safeParse(req.params);

      if (!parsed.success) {
        sendBadRequest(res, 'Invalid product ID format', parsed.error.flatten().fieldErrors);
        return;
      }

      const product = await productService.getProductById(parsed.data.id);
      sendSuccess(res, product);
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 404) {
        sendNotFound(res, 'Product');
        return;
      }
      next(error);
    }
  },

  /**
   * GET /categories
   * Returns all distinct product categories.
   */
  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await productService.getCategories();
      sendSuccess(res, { categories });
    } catch (error) {
      next(error);
    }
  },
};
