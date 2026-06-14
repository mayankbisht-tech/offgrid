/**
 * Shared API response helpers for Express route handlers.
 * Use these instead of inline res.json() calls.
 */
import type { Response } from 'express';

export function apiSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

export function apiError(res: Response, message: string, status = 400): void {
  res.status(status).json({ success: false, error: message });
}
