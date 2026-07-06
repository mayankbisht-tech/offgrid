/**
 * Admin design management routes.
 *
 * GET   /api/admin/designs               — list with optional status filter
 * GET   /api/admin/designs/:id           — single design detail (with bids + samples)
 * PATCH /api/admin/designs/:id/approve   — approve (→ ADMIN_APPROVED)
 * PATCH /api/admin/designs/:id/reject    — reject  (→ REJECTED)
 * PATCH /api/admin/designs/:id/request-changes — add admin notes without final decision
 */
import { Router } from 'express';
import { z } from 'zod';
import { apiSuccess, apiError } from '../../../src/utils/apiResponse.js';
import {
  designs,
  designBids,
  designSamples,
  updateDesign,
  createNotification,
} from '../../../server_db.js';

export const designsRouter = Router();

/** @openapi
 * /api/admin/designs:
 *   get:
 *     summary: List all designs, optionally filtered by workflowStatus
 *     parameters:
 *       - name: status
 *         in: query
 *         schema: { type: string }
 */
designsRouter.get('/', (req, res) => {
  const { status, designerId } = req.query as Record<string, string>;

  let list = [...designs];
  if (status) list = list.filter((d) => d.workflowStatus === status);
  if (designerId) list = list.filter((d) => d.designerId === designerId);

  const enriched = list.map((d) => ({
    ...d,
    bidCount: designBids.filter((b) => b.designId === d.id).length,
    sampleCount: designSamples.filter((s) => s.designId === d.id).length,
  }));

  apiSuccess(res, enriched);
});

/** @openapi
 * /api/admin/designs/{id}:
 *   get:
 *     summary: Single design detail with bids and samples
 */
designsRouter.get('/:id', (req, res) => {
  const design = designs.find((d) => d.id === req.params.id);
  if (!design) {
    apiError(res, 'Design not found.', 404);
    return;
  }

  const bids = designBids.filter((b) => b.designId === design.id);
  const samples = designSamples.filter((s) => s.designId === design.id);

  apiSuccess(res, { design, bids, samples });
});

const approveSchema = z.object({
  notes: z.string().max(1000).optional(),
});

/** @openapi
 * /api/admin/designs/{id}/approve:
 *   patch:
 *     summary: Approve a submitted design
 */
designsRouter.patch('/:id/approve', async (req, res) => {
  const design = designs.find((d) => d.id === req.params.id);
  if (!design) {
    apiError(res, 'Design not found.', 404);
    return;
  }

  const parsed = approveSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    const updated = await updateDesign(design.id, {
      workflowStatus: 'ADMIN_APPROVED',
      adminReviewedAt: new Date().toISOString(),
      adminReviewedBy: req.actingUser ?? 'admin',
      adminNotes: parsed.data.notes ?? design.adminNotes,
    });

    await createNotification({
      userId: design.designerId,
      role: 'DESIGNER',
      title: 'Design approved',
      message: `Your design "${design.title}" was approved and is now visible to manufacturers.`,
      category: 'DESIGN_APPROVED',
      link: '/dashboard',
    });

    apiSuccess(res, { design: updated ?? design, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required.').max(1000),
});

/** @openapi
 * /api/admin/designs/{id}/reject:
 *   patch:
 *     summary: Reject a submitted design
 */
designsRouter.patch('/:id/reject', async (req, res) => {
  const design = designs.find((d) => d.id === req.params.id);
  if (!design) {
    apiError(res, 'Design not found.', 404);
    return;
  }

  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    const updated = await updateDesign(design.id, {
      workflowStatus: 'REJECTED',
      adminReviewedAt: new Date().toISOString(),
      adminReviewedBy: req.actingUser ?? 'admin',
      adminNotes: parsed.data.reason,
    });

    await createNotification({
      userId: design.designerId,
      role: 'DESIGNER',
      title: 'Design rejected',
      message: `Your design "${design.title}" was not approved. Reason: ${parsed.data.reason}`,
      category: 'DESIGN_REJECTED',
      link: '/dashboard',
    });

    apiSuccess(res, { design: updated ?? design, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

const requestChangesSchema = z.object({
  notes: z.string().min(1, 'Notes are required when requesting changes.').max(1000),
});

/** @openapi
 * /api/admin/designs/{id}/request-changes:
 *   patch:
 *     summary: Add admin notes without finalising a decision
 */
designsRouter.patch('/:id/request-changes', async (req, res) => {
  const design = designs.find((d) => d.id === req.params.id);
  if (!design) {
    apiError(res, 'Design not found.', 404);
    return;
  }

  const parsed = requestChangesSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    const updated = await updateDesign(design.id, {
      adminNotes: parsed.data.notes,
      adminReviewedBy: req.actingUser ?? 'admin',
      adminReviewedAt: new Date().toISOString(),
    });

    await createNotification({
      userId: design.designerId,
      role: 'DESIGNER',
      title: 'Changes requested for your design',
      message: `The admin team left feedback on "${design.title}": ${parsed.data.notes}`,
      category: 'DESIGN_REJECTED',
      link: '/dashboard',
    });

    apiSuccess(res, { design: updated ?? design, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});
