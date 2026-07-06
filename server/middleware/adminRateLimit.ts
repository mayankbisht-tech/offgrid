/**
 * Rate-limiter for the admin router.
 *
 * Provides a last line of defence if the ADMIN_API_KEY leaks.
 * 100 requests / 15 minutes per source IP.
 *
 * Uses a simple in-process sliding-window map — no external Redis dependency.
 * For multi-instance deployments, swap to express-rate-limit + redis store.
 */
import type { Request, Response, NextFunction } from 'express';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

const hits = new Map<string, number[]>();

export function adminRateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? 'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const existing = (hits.get(ip) ?? []).filter((ts) => ts > windowStart);
  existing.push(now);
  hits.set(ip, existing);

  if (existing.length > MAX_REQUESTS) {
    res.status(429).json({ success: false, error: 'Too many requests — slow down.' });
    return;
  }

  next();
}
