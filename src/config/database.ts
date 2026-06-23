import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

declare global {
  // Prevent multiple Prisma client instances in development (hot-reload)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.isDevelopment ? ['query', 'warn', 'error'] : ['warn', 'error'],
    errorFormat: 'pretty',
  });
}

export const prisma: PrismaClient = global.__prisma ?? createPrismaClient();

if (env.isDevelopment) {
  global.__prisma = prisma;
}
