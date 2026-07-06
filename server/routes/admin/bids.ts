/**
 * Admin bid management routes.
 *
 * GET   /api/admin/bids                       — list all bids (filterable)
 * GET   /api/admin/bids/design/:designId       — all bids for a specific design
 * GET   /api/admin/bids/:id                    — single bid detail
 * PATCH /api/admin/bids/:id/accept             — shortlist / promote a bid
 * PATCH /api/admin/bids/:id/reject             — reject a bid
 */
import { Router } from 'express';
import { z } from 'zod';
import { apiSuccess, apiError } from '../../../src/utils/apiResponse.js';
import {
  designBids,
  designs,
  updateDesignBid,
  recalculateBidStatuses,
} from '../../../server_db.js';

export const bidsRouter = Router();

/** @openapi
 * /api/admin/bids:
 *   get:
 *     summary: List all bids, filterable by status or manufacturerId
 */
bidsRouter.get('/', (req, res) => {
  const { status, manufacturerId, designId } = req.query as Record<string, string>;

  let list = [...designBids];
  if (status) list = list.filter((b) => b.status === status);
  if (manufacturerId) list = list.filter((b) => b.manufacturerId === manufacturerId);
  if (designId) list = list.filter((b) => b.designId === designId);

  const enriched = list.map((b) => ({
    ...b,
    design: designs.find((d) => d.id === b.designId) ?? null,
  }));

  apiSuccess(res, enriched);
});

/** @openapi
 * /api/admin/bids/design/{designId}:
 *   get:
 *     summary: All bids for a specific design, sorted by bidAmountINR ASC
 */
bidsRouter.get('/design/:designId', (req, res) => {
  const { designId } = req.params;
  const design = designs.find((d) => d.id === designId);
  if (!design) {
    apiError(res, 'Design not found.', 404);
    return;
  }

  const bids = designBids
    .filter((b) => b.designId === designId)
    .sort((a, b) => a.bidAmountINR - b.bidAmountINR || a.createdAt.localeCompare(b.createdAt));

  apiSuccess(res, { design, bids });
});

/** @openapi
 * /api/admin/bids/{id}:
 *   get:
 *     summary: Single bid detail
 */
bidsRouter.get('/:id', (req, res) => {
  const bid = designBids.find((b) => b.id === req.params.id);
  if (!bid) {
    apiError(res, 'Bid not found.', 404);
    return;
  }
  apiSuccess(res, {
    ...bid,
    design: designs.find((d) => d.id === bid.designId) ?? null,
  });
});

const acceptSchema = z.object({
  notes: z.string().max(500).optional(),
});

/** @openapi
 * /api/admin/bids/{id}/accept:
 *   patch:
 *     summary: Shortlist a bid
 */
bidsRouter.patch('/:id/accept', async (req, res) => {
  const bid = designBids.find((b) => b.id === req.params.id);
  if (!bid) {
    apiError(res, 'Bid not found.', 404);
    return;
  }

  const parsed = acceptSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    const updated = await updateDesignBid(bid.id, { status: 'SHORTLISTED', heldReason: undefined });
    // Recalculate all bid statuses for this design to maintain rank ordering
    await recalculateBidStatuses(bid.designId);
    apiSuccess(res, { bid: updated ?? bid, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

const rejectSchema = z.object({
  reason: z.string().max(500).optional(),
});

/** @openapi
 * /api/admin/bids/{id}/reject:
 *   patch:
 *     summary: Reject a bid
 */
bidsRouter.patch('/:id/reject', async (req, res) => {
  const bid = designBids.find((b) => b.id === req.params.id);
  if (!bid) {
    apiError(res, 'Bid not found.', 404);
    return;
  }

  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    const updated = await updateDesignBid(bid.id, {
      status: 'REJECTED',
      heldReason: parsed.data.reason,
    });
    apiSuccess(res, { bid: updated ?? bid, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});
