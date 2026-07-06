/**
 * Admin notification management routes.
 *
 * GET  /api/admin/notifications              — list all notifications (filterable)
 * POST /api/admin/notifications              — send a targeted or broadcast notification
 * POST /api/admin/notifications/broadcast    — broadcast to all users of a role
 * GET  /api/admin/notifications/:id          — single notification
 */
import { Router } from 'express';
import { z } from 'zod';
import { apiSuccess, apiError } from '../../../src/utils/apiResponse.js';
import { notifications, createNotification } from '../../../server_db.js';
import { prisma } from '../../../server_pg.js';

export const notificationsRouter = Router();

/** @openapi
 * /api/admin/notifications:
 *   get:
 *     summary: List all notifications, filterable by userId, role, or category
 */
notificationsRouter.get('/', (req, res) => {
  const { userId, role, category } = req.query as Record<string, string>;

  let list = [...notifications];
  if (userId) list = list.filter((n) => n.userId === userId);
  if (role) list = list.filter((n) => n.role === role);
  if (category) list = list.filter((n) => n.category === category);

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  apiSuccess(res, list);
});

const sendSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['CONSUMER', 'DESIGNER', 'MANUFACTURER', 'ADMIN']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  category: z.enum(['DESIGN_REJECTED', 'DESIGN_APPROVED', 'SYSTEM']).default('SYSTEM'),
  link: z.string().url().optional(),
});

/** @openapi
 * /api/admin/notifications:
 *   post:
 *     summary: Send a notification to a specific user
 */
notificationsRouter.post('/', async (req, res) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    const notification = await createNotification(parsed.data);
    apiSuccess(res, { notification, actedBy: req.actingUser ?? 'system' }, 201);
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

const broadcastSchema = z.object({
  role: z.enum(['CONSUMER', 'DESIGNER', 'MANUFACTURER', 'ADMIN']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  link: z.string().url().optional(),
});

/** @openapi
 * /api/admin/notifications/broadcast:
 *   post:
 *     summary: Broadcast a notification to all users of a given role
 */
notificationsRouter.post('/broadcast', async (req, res) => {
  const parsed = broadcastSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  const { role, title, message, link } = parsed.data;

  try {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    });

    const created = await Promise.all(
      users.map((u) =>
        createNotification({
          userId: u.id,
          role: role as any,
          title,
          message,
          category: 'SYSTEM',
          link,
        })
      )
    );

    apiSuccess(res, { sent: created.length, notifications: created, actedBy: req.actingUser ?? 'system' }, 201);
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

/** @openapi
 * /api/admin/notifications/{id}:
 *   get:
 *     summary: Single notification detail
 */
notificationsRouter.get('/:id', (req, res) => {
  const notification = notifications.find((n) => n.id === req.params.id);
  if (!notification) {
    apiError(res, 'Notification not found.', 404);
    return;
  }
  apiSuccess(res, notification);
});
