/**
 * Main admin router — mounted at /api/admin in server.ts.
 *
 * All sub-routes are protected by:
 *   1. adminCorsMiddleware  — rejects origins outside ADMIN_ALLOWED_ORIGIN
 *   2. adminRateLimitMiddleware — 100 req / 15 min per IP
 *   3. adminAuthMiddleware  — validates x-admin-api-key header
 *
 * The ordering matters: CORS is checked first (before any key validation)
 * so a browser-based request from an unknown origin gets a 403, not a 401
 * that leaks information about key format.
 */
import { Router } from 'express';
import { adminCorsMiddleware } from '../middleware/adminCors.js';
import { adminRateLimitMiddleware } from '../middleware/adminRateLimit.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';

import { statsRouter } from './admin/stats.js';
import { usersRouter } from './admin/users.js';
import { designsRouter } from './admin/designs.js';
import { productsRouter } from './admin/products.js';
import { ordersRouter } from './admin/orders.js';
import { bidsRouter } from './admin/bids.js';
import { samplesRouter } from './admin/samples.js';
import { notificationsRouter } from './admin/notifications.js';
import { moderationLogRouter } from './admin/moderationLog.js';

export const adminRouter = Router();

// Security middleware stack — applied to ALL /api/admin/* routes
adminRouter.use(adminCorsMiddleware);
adminRouter.use(adminRateLimitMiddleware);
adminRouter.use(adminAuthMiddleware);

// Sub-routers
adminRouter.use('/stats', statsRouter);
adminRouter.use('/users', usersRouter);
adminRouter.use('/designs', designsRouter);
adminRouter.use('/products', productsRouter);
adminRouter.use('/orders', ordersRouter);
adminRouter.use('/bids', bidsRouter);
adminRouter.use('/samples', samplesRouter);
adminRouter.use('/notifications', notificationsRouter);
adminRouter.use('/moderation-log', moderationLogRouter);
