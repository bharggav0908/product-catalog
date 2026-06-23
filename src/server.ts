import { app } from './app';
import { env } from './config/env';
import { logger } from './middlewares/requestLogger';
import { prisma } from './config/database';

async function startServer(): Promise<void> {
  // Verify DB connection before accepting traffic
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.info(`🚀 Server running on port ${env.port}`);
    logger.info(`🌍 Environment: ${env.nodeEnv}`);
    logger.info(`📚 API Docs: http://localhost:${env.port}/docs`);
    logger.info(`❤️  Health:   http://localhost:${env.port}/health`);
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');
      await prisma.$disconnect();
      logger.info('Database disconnected');
      process.exit(0);
    });

    // Force-kill after 10 seconds
    setTimeout(() => {
      logger.error('Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
  process.on('SIGINT', () => { void shutdown('SIGINT'); });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

void startServer();
