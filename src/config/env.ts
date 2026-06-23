import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  DEFAULT_PAGE_SIZE: z.string().default('20'),
  MAX_PAGE_SIZE: z.string().default('100'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  databaseUrl: parsed.data.DATABASE_URL,
  port: parseInt(parsed.data.PORT, 10),
  nodeEnv: parsed.data.NODE_ENV,
  allowedOrigins: parsed.data.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
  defaultPageSize: parseInt(parsed.data.DEFAULT_PAGE_SIZE, 10),
  maxPageSize: parseInt(parsed.data.MAX_PAGE_SIZE, 10),
  isDevelopment: parsed.data.NODE_ENV === 'development',
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
};
