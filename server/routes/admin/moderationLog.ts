/**
 * Admin moderation log (read-only audit trail).
 *
 * GET /api/admin/moderation-log          — list all records, filterable
 * GET /api/admin/moderation-log/:userId  — record for a specific user
 *
 * This is intentionally read-only from the CRM side.
 * Records are written by the users/:id/status endpoint.
 */
import { Router } from 'express';
import { apiSuccess, apiError } from '../../../src/utils/apiResponse.js';
import { moderationRecords } from '../../../server_db.js';

export const moderationLogRouter = Router();

/** @openapi
 * /api/admin/moderation-log:
 *   get:
 *     summary: List all moderation records, filterable by role/status
 */
moderationLogRouter.get('/', (req, res) => {
  const { role, status } = req.query as Record<string, string>;

  let list = Object.values(moderationRecords);
  if (role) list = list.filter((r) => r.role === role);
  if (status) list = list.filter((r) => r.status === status);

  list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  apiSuccess(res, list);
});

/** @openapi
 * /api/admin/moderation-log/{userId}:
 *   get:
 *     summary: Moderation record for a specific user
 */
moderationLogRouter.get('/:userId', (req, res) => {
  const record = moderationRecords[req.params.userId];
  if (!record) {
    apiError(res, 'No moderation record found for this user.', 404);
    return;
  }
  apiSuccess(res, record);
});
