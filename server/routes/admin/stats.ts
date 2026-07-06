/**
 * GET /api/admin/stats
 *
 * Single endpoint that returns all aggregate numbers the CRM dashboard
 * overview card needs.  Kept as a dedicated endpoint so the CRM can
 * render its stats row with a single fetch.
 */
import { Router } from 'express';
import { apiSuccess } from '../../../src/utils/apiResponse.js';
import {
  designs,
  products,
  orders,
  designBids,
  designSamples,
  moderationRecords,
} from '../../../server_db.js';

export const statsRouter = Router();

/** @openapi
 * /api/admin/stats:
 *   get:
 *     summary: Aggregate platform statistics
 *     security:
 *       - AdminApiKey: []
 *     responses:
 *       200:
 *         description: Stats object
 */
statsRouter.get('/', (_req, res) => {
  const pendingModeration = designs.filter((d) => d.workflowStatus === 'SUBMITTED').length;
  const pendingSamples = designSamples.filter((s) => s.status === 'SUBMITTED').length;

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalINR, 0);

  const designerMap = new Map<string, { designs: number; liveProducts: number; bids: number }>();
  for (const d of designs) {
    if (!designerMap.has(d.designerId)) {
      designerMap.set(d.designerId, { designs: 0, liveProducts: 0, bids: 0 });
    }
    const entry = designerMap.get(d.designerId)!;
    entry.designs += 1;
    if (d.liveProductId) entry.liveProducts += 1;
    entry.bids += designBids.filter((b) => b.designId === d.id).length;
  }

  const manufacturerMap = new Map<string, { bids: number; shortlisted: number; winning: number; samples: number }>();
  for (const b of designBids) {
    if (!manufacturerMap.has(b.manufacturerId)) {
      manufacturerMap.set(b.manufacturerId, { bids: 0, shortlisted: 0, winning: 0, samples: 0 });
    }
    const entry = manufacturerMap.get(b.manufacturerId)!;
    entry.bids += 1;
    if (b.status === 'SHORTLISTED') entry.shortlisted += 1;
    if (b.status === 'WINNING') entry.winning += 1;
    entry.samples += designSamples.filter((s) => s.bidId === b.id).length;
  }

  apiSuccess(res, {
    totals: {
      designs: designs.length,
      products: products.length,
      orders: orders.length,
      bids: designBids.length,
      samples: designSamples.length,
      moderationRecords: Object.keys(moderationRecords).length,
    },
    queues: {
      pendingModerationDesigns: pendingModeration,
      pendingSampleReviews: pendingSamples,
    },
    revenue: {
      totalINR: totalRevenue,
    },
    designerAnalytics: Array.from(designerMap.entries()).map(([designerId, v]) => ({ designerId, ...v })),
    manufacturerAnalytics: Array.from(manufacturerMap.entries()).map(([manufacturerId, v]) => ({ manufacturerId, ...v })),
    moderationRecordList: Object.values(moderationRecords),
  });
});
