/**
 * Admin sample review routes.
 *
 * GET   /api/admin/samples                      — list all samples (filterable)
 * GET   /api/admin/samples/:id                  — single sample detail
 * PATCH /api/admin/samples/:id/approve          — approve sample → creates live product
 * PATCH /api/admin/samples/:id/reject           — reject sample → promotes next held bid
 */
import { Router } from 'express';
import { z } from 'zod';
import { apiSuccess, apiError } from '../../../src/utils/apiResponse.js';
import {
  designSamples,
  designBids,
  designs,
  updateDesignSample,
  updateDesignBid,
  updateDesign,
  attachWinningSample,
  createLiveProductFromDesign,
  promoteNextHeldBid,
  createNotification,
} from '../../../server_db.js';

export const samplesRouter = Router();

/** @openapi
 * /api/admin/samples:
 *   get:
 *     summary: List all samples, filterable by status
 */
samplesRouter.get('/', (req, res) => {
  const { status, designId, manufacturerId } = req.query as Record<string, string>;

  let list = [...designSamples];
  if (status) list = list.filter((s) => s.status === status);
  if (designId) list = list.filter((s) => s.designId === designId);
  if (manufacturerId) list = list.filter((s) => s.manufacturerId === manufacturerId);

  const enriched = list.map((s) => ({
    ...s,
    design: designs.find((d) => d.id === s.designId) ?? null,
    bid: designBids.find((b) => b.id === s.bidId) ?? null,
  }));

  apiSuccess(res, enriched);
});

/** @openapi
 * /api/admin/samples/{id}:
 *   get:
 *     summary: Single sample detail
 */
samplesRouter.get('/:id', (req, res) => {
  const sample = designSamples.find((s) => s.id === req.params.id);
  if (!sample) {
    apiError(res, 'Sample not found.', 404);
    return;
  }
  apiSuccess(res, {
    ...sample,
    design: designs.find((d) => d.id === sample.designId) ?? null,
    bid: designBids.find((b) => b.id === sample.bidId) ?? null,
  });
});

const approveSchema = z.object({
  notes: z.string().max(500).optional(),
});

/** @openapi
 * /api/admin/samples/{id}/approve:
 *   patch:
 *     summary: Approve a sample — creates the live product and marks design LIVE
 */
samplesRouter.patch('/:id/approve', async (req, res) => {
  const sample = designSamples.find((s) => s.id === req.params.id);
  if (!sample) {
    apiError(res, 'Sample not found.', 404);
    return;
  }

  const design = designs.find((d) => d.id === sample.designId);
  if (!design) {
    apiError(res, 'Associated design not found.', 404);
    return;
  }

  const parsed = approveSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    await attachWinningSample(design.id, sample.bidId, sample.id, sample.manufacturerId);
    const product = await createLiveProductFromDesign(design.id, sample.bidId);

    if (parsed.data.notes) {
      await updateDesignSample(sample.id, { notes: parsed.data.notes });
    }

    await createNotification({
      userId: design.designerId,
      role: 'DESIGNER',
      title: 'Sample approved — your design is LIVE!',
      message: `The sample for "${design.title}" was approved. Your product is now live on the marketplace.`,
      category: 'DESIGN_APPROVED',
      link: '/dashboard',
    });

    apiSuccess(res, {
      sample,
      design,
      product,
      actedBy: req.actingUser ?? 'system',
    });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required.').max(500),
});

/** @openapi
 * /api/admin/samples/{id}/reject:
 *   patch:
 *     summary: Reject a sample — promotes the next held bid
 */
samplesRouter.patch('/:id/reject', async (req, res) => {
  const sample = designSamples.find((s) => s.id === req.params.id);
  if (!sample) {
    apiError(res, 'Sample not found.', 404);
    return;
  }

  const design = designs.find((d) => d.id === sample.designId);
  if (!design) {
    apiError(res, 'Associated design not found.', 404);
    return;
  }

  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    await updateDesignSample(sample.id, {
      status: 'REJECTED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.actingUser ?? 'admin',
    });

    await updateDesignBid(sample.bidId, {
      status: 'REJECTED',
      sampleStatus: 'REJECTED',
      heldReason: parsed.data.reason,
    });

    const promotedBid = await promoteNextHeldBid(design.id);
    if (!promotedBid) {
      await updateDesign(design.id, { workflowStatus: 'BIDDING_OPEN' });
    }

    await createNotification({
      userId: design.designerId,
      role: 'DESIGNER',
      title: 'Sample rejected',
      message: `The sample for "${design.title}" was rejected. Reason: ${parsed.data.reason}`,
      category: 'DESIGN_REJECTED',
      link: '/dashboard',
    });

    apiSuccess(res, {
      sample,
      design,
      promotedBid: promotedBid ?? null,
      actedBy: req.actingUser ?? 'system',
    });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});
