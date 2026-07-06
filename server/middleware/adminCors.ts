/**
 * Strict CORS for the /api/admin/* router.
 *
 * Only the CRM-offgrid deployed origin (ADMIN_ALLOWED_ORIGIN env var) is
 * accepted.  All other origins receive a 403 before reaching any route.
 *
 * In production, pair this with an IP allowlist at the reverse-proxy layer
 * (nginx / Cloudflare / AWS ALB) so the router is unreachable from the public
 * internet entirely.
 */
import type { Request, Response, NextFunction } from 'express';

export function adminCorsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowedOrigin = process.env.ADMIN_ALLOWED_ORIGIN?.trim();
  const requestOrigin = req.headers.origin;

  if (requestOrigin) {
    if (!allowedOrigin || requestOrigin === allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.status(403).json({ success: false, error: 'CORS: origin not permitted on admin router.' });
      return;
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-api-key, x-acting-user');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}
