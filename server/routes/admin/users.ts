/**
 * Admin user management routes.
 *
 * GET  /api/admin/users           — list all users with their moderation status
 * GET  /api/admin/users/:id       — single user detail
 * PATCH /api/admin/users/:id/role — change role (CONSUMER / DESIGNER / MANUFACTURER)
 * PATCH /api/admin/users/:id/status — set ACTIVE / PAUSED / BLOCKED (moderation)
 * DELETE /api/admin/users/:id     — anonymise (soft-delete the user record by clearing PII)
 */
import { Router } from 'express';
import { z } from 'zod';
import { apiSuccess, apiError } from '../../../src/utils/apiResponse.js';
import { prisma } from '../../../server_pg.js';
import {
  designs,
  designBids,
  moderationRecords,
  setModerationStatus,
  getModerationStatus,
  updateDesign,
  updateDesignBid,
  createNotification,
} from '../../../server_db.js';

export const usersRouter = Router();

/** @openapi
 * /api/admin/users:
 *   get:
 *     summary: List all users with their moderation status
 *     security: [{ AdminApiKey: [] }]
 */
usersRouter.get('/', async (_req, res) => {
  try {
    const rows = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, username: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const users = rows.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      accountStatus: getModerationStatus(u.id),
      moderationRecord: moderationRecords[u.id] ?? null,
    }));

    apiSuccess(res, users);
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

/** @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get single user with moderation record
 */
usersRouter.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, email: true, name: true, role: true, username: true, createdAt: true },
    });

    if (!user) {
      apiError(res, 'User not found.', 404);
      return;
    }

    apiSuccess(res, {
      ...user,
      createdAt: user.createdAt.toISOString(),
      accountStatus: getModerationStatus(user.id),
      moderationRecord: moderationRecords[user.id] ?? null,
      designCount: designs.filter((d) => d.designerId === user.id).length,
      bidCount: designBids.filter((b) => b.manufacturerId === user.id).length,
    });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

const roleSchema = z.object({
  role: z.enum(['CONSUMER', 'DESIGNER', 'MANUFACTURER', 'ADMIN']),
});

/** @openapi
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Change a user's role
 */
usersRouter.patch('/:id/role', async (req, res) => {
  const parsed = roleSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role: parsed.data.role },
      select: { id: true, email: true, name: true, role: true },
    });

    apiSuccess(res, { user: updated, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      apiError(res, 'User not found.', 404);
    } else {
      apiError(res, err.message, 500);
    }
  }
});

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'BLOCKED']),
  role: z.enum(['DESIGNER', 'MANUFACTURER']).optional().default('DESIGNER'),
  reason: z.string().max(500).optional(),
});

/** @openapi
 * /api/admin/users/{id}/status:
 *   patch:
 *     summary: Set account status (ACTIVE / PAUSED / BLOCKED)
 */
usersRouter.patch('/:id/status', async (req, res) => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  const { status, role, reason } = parsed.data;
  const userId = req.params.id;

  try {
    const record = await setModerationStatus({
      userId,
      role,
      status,
      reason,
      updatedBy: req.actingUser ?? 'system',
    });

    // Cascade to designs owned by the designer
    await Promise.all(
      designs
        .filter((d) => d.designerId === userId || d.winningManufacturerId === userId)
        .map((d) =>
          updateDesign(d.id, {
            moderationStatus: status,
            workflowStatus:
              status === 'BLOCKED' ? 'BLOCKED'
              : status === 'PAUSED' ? 'PAUSED'
              : d.workflowStatus,
          })
        )
    );

    // Cascade bids if blocking/pausing a manufacturer
    if (status !== 'ACTIVE') {
      await Promise.all(
        designBids
          .filter((b) => b.manufacturerId === userId)
          .map((b) =>
            updateDesignBid(b.id, {
              status: status === 'BLOCKED' ? 'REJECTED' : b.status,
              heldReason: status === 'BLOCKED' ? 'Manufacturer blocked by admin' : b.heldReason,
            })
          )
      );
    }

    // Notify the user
    const statusLabel = status === 'BLOCKED' ? 'blocked' : status === 'PAUSED' ? 'paused' : 're-activated';
    await createNotification({
      userId,
      role: role as any,
      title: `Account ${statusLabel}`,
      message: `Your account has been ${statusLabel} by the admin team.${reason ? ` Reason: ${reason}` : ''}`,
      category: 'SYSTEM',
      link: '/dashboard',
    });

    apiSuccess(res, { record, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

/** @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Anonymise a user account (removes PII, keeps id for FK integrity)
 */
usersRouter.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      apiError(res, 'User not found.', 404);
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@anonymised.local`,
        name: '[Deleted User]',
        password: '',
        username: null,
      },
    });

    // Block the account so they can't log in
    await setModerationStatus({
      userId,
      role: 'CONSUMER',
      status: 'BLOCKED',
      reason: 'Account anonymised by admin',
      updatedBy: req.actingUser ?? 'system',
    });

    apiSuccess(res, { anonymised: true, userId, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});
