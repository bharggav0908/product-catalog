import morgan from 'morgan';
import winston from 'winston';
import { env } from '../config/env';

// ─── Winston Logger ───────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: env.isDevelopment ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    env.isDevelopment
      ? winston.format.combine(winston.format.colorize(), winston.format.simple())
      : winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    // In production you'd add file transports:
    // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// ─── Morgan HTTP Logger ───────────────────────────────────────────────────────

// Custom token: response time in ms
morgan.token('response-time-ms', (_req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

const morganFormat = env.isDevelopment
  ? ':method :url :status :res[content-length] - :response-time ms'
  : ':remote-addr :method :url :status :res[content-length] :response-time ms :user-agent';

// Morgan streams to Winston
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export const requestLogger = morgan(morganFormat, {
  stream,
  // Skip logging for health checks to reduce noise
  skip: (req) => req.url === '/health',
});
