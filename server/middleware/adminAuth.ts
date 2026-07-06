/**
 * Admin API authentication middleware.
 *
 * Service-to-service only — validates `x-admin-api-key` header against the
 * ADMIN_API_KEY env var.  No user cookies, no JWT sessions from the offgrid
 * consumer app.
 *
 * Every request that passes here will have `req.actingUser` populated from the
 * `x-acting-user` header sent by CRM-offgrid so audit logs know *which* CRM
 * team-member took the action.
 */
import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      /** CRM team-member id/email forwarded in x-acting-user header */
      actingUser?: string;
    }
  }
}

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey || expectedKey.length < 32) {
    // Misconfigured server — refuse all requests until key is set
    res.status(503).json({ success: false, error: 'Admin API is not configured.' });
    return;
  }

  const providedKey = req.headers['x-admin-api-key'];

  if (!providedKey || providedKey !== expectedKey) {
    res.status(401).json({ success: false, error: 'Unauthorized: invalid or missing x-admin-api-key.' });
    return;
  }

  // Propagate the acting CRM user for audit logging
  const actingUser = req.headers['x-acting-user'];
  if (typeof actingUser === 'string' && actingUser.trim()) {
    req.actingUser = actingUser.trim();
  }

  next();
}
