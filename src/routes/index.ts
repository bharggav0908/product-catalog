import { Router, Request, Response } from 'express';
import { productRoutes } from './productRoutes';
import { categoryRoutes } from './categoryRoutes';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Returns service health status and uptime. Used by Render for health checks.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   description: Process uptime in seconds
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

export { router as apiRoutes };
