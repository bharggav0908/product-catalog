import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { apiRoutes } from './routes';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────

app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for Swagger UI compatibility
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (env.allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ──────────────────────────────────────────────────────────

app.use(requestLogger);

// ─── API Documentation ────────────────────────────────────────────────────────

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Product Catalog API Docs',
  }),
);

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/', apiRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

// 404 — must come after all routes
app.use(notFoundHandler);

// Global error handler — must be last middleware (4 params)
app.use(errorHandler);

export { app };
