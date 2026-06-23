import { Response } from 'express';

// ─── Success Responses ────────────────────────────────────────────────────────

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json({
    status: 'success',
    data,
  });
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

// ─── Error Responses ──────────────────────────────────────────────────────────

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  details?: unknown,
): void {
  const body: Record<string, unknown> = {
    status: 'error',
    statusCode,
    message,
  };

  if (details !== undefined) {
    body.details = details;
  }

  res.status(statusCode).json(body);
}

export function sendNotFound(res: Response, resource = 'Resource'): void {
  sendError(res, `${resource} not found`, 404);
}

export function sendBadRequest(res: Response, message: string, details?: unknown): void {
  sendError(res, message, 400, details);
}
