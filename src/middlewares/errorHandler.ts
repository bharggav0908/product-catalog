import { Request, Response, NextFunction } from 'express';
import { logger } from './requestLogger';

// ─── Custom Application Error ─────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Error Shape ──────────────────────────────────────────────────────────────

interface ErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  stack?: string;
}

// ─── Global Error Middleware ──────────────────────────────────────────────────

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = 'Internal server error';

  // Known operational errors
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Prisma errors
  else if (error.constructor.name === 'PrismaClientKnownRequestError') {
    statusCode = 400;
    message = 'Database request error';
  } else if (error.constructor.name === 'PrismaClientValidationError') {
    statusCode = 400;
    message = 'Invalid database query';
  }

  // Log 5xx errors
  if (statusCode >= 500) {
    logger.error({
      message: 'Unhandled error',
      error: error.message,
      stack: error.stack,
    });
  }

  const response: ErrorResponse = {
    status: 'error',
    statusCode,
    message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
}

// ─── 404 Handler ──────────────────────────────────────────────────────────────

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Route ${req.method} ${req.path} not found`,
  });
}
