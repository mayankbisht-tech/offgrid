/**
 * Admin order management routes.
 *
 * GET   /api/admin/orders          — list all orders (filterable by status)
 * GET   /api/admin/orders/:id      — single order detail
 * PATCH /api/admin/orders/:id/status — update order status + tracking
 * PATCH /api/admin/orders/:id/cancel  — cancel an order
 * PATCH /api/admin/orders/:id/refund  — mark order as refunded / cancelled
 */
import { Router } from 'express';
import { z } from 'zod';
import { apiSuccess, apiError } from '../../../src/utils/apiResponse.js';
import { orders, createNotification, updateOrderStatus } from '../../../server_db.js';
import type { OrderStatus } from '../../../src/types.js';

export const ordersRouter = Router();

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PAYMENT_CONFIRMED',
  'MATCHED_TO_MANUFACTURER',
  'IN_PRODUCTION',
  'QUALITY_CHECK',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

/** @openapi
 * /api/admin/orders:
 *   get:
 *     summary: List all orders
 *     parameters:
 *       - name: status
 *         in: query
 *       - name: consumerId
 *         in: query
 */
ordersRouter.get('/', (req, res) => {
  const { status, consumerId, q } = req.query as Record<string, string>;

  let list = [...orders];
  if (status) list = list.filter((o) => o.status === status);
  if (consumerId) list = list.filter((o) => o.consumerId === consumerId);
  if (q) {
    const lower = q.toLowerCase();
    list = list.filter(
      (o) =>
        o.id.toLowerCase().includes(lower) ||
        o.consumerName.toLowerCase().includes(lower) ||
        o.consumerEmail.toLowerCase().includes(lower)
    );
  }

  // Sort newest first
  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  apiSuccess(res, list);
});

/** @openapi
 * /api/admin/orders/{id}:
 *   get:
 *     summary: Single order detail
 */
ordersRouter.get('/:id', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    apiError(res, 'Order not found.', 404);
    return;
  }
  apiSuccess(res, order);
});

const statusSchema = z.object({
  status: z.enum(ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]),
  trackingNumber: z.string().max(100).optional(),
  courierName: z.string().max(100).optional(),
});

/** @openapi
 * /api/admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status (and optionally tracking details)
 */
ordersRouter.patch('/:id/status', async (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    apiError(res, 'Order not found.', 404);
    return;
  }

  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    const updated = await updateOrderStatus(
      order.id,
      parsed.data.status,
      parsed.data.trackingNumber,
      parsed.data.courierName
    );

    if (parsed.data.status === 'SHIPPED' && order.consumerId) {
      await createNotification({
        userId: order.consumerId,
        role: 'CONSUMER',
        title: 'Your order has shipped!',
        message: `Order #${order.id} is on its way.${parsed.data.trackingNumber ? ` Tracking: ${parsed.data.trackingNumber}` : ''}`,
        category: 'SYSTEM',
        link: '/dashboard',
      });
    }

    apiSuccess(res, { order: updated ?? order, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

/** @openapi
 * /api/admin/orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 */
ordersRouter.patch('/:id/cancel', async (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    apiError(res, 'Order not found.', 404);
    return;
  }

  if (order.status === 'DELIVERED') {
    apiError(res, 'Cannot cancel a delivered order.', 400);
    return;
  }

  try {
    const updated = await updateOrderStatus(order.id, 'CANCELLED');

    await createNotification({
      userId: order.consumerId,
      role: 'CONSUMER',
      title: 'Order cancelled',
      message: `Your order #${order.id} has been cancelled by the admin team.`,
      category: 'SYSTEM',
      link: '/dashboard',
    });

    apiSuccess(res, { order: updated ?? order, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

/** @openapi
 * /api/admin/orders/{id}/refund:
 *   patch:
 *     summary: Mark an order as refunded (sets status to CANCELLED, notifies consumer)
 */
ordersRouter.patch('/:id/refund', async (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    apiError(res, 'Order not found.', 404);
    return;
  }

  const { reason } = req.body as { reason?: string };

  try {
    const updated = await updateOrderStatus(order.id, 'CANCELLED');

    await createNotification({
      userId: order.consumerId,
      role: 'CONSUMER',
      title: 'Refund initiated',
      message: `A refund has been initiated for order #${order.id}.${reason ? ` Reason: ${reason}` : ''} Please allow 5–7 business days.`,
      category: 'SYSTEM',
      link: '/dashboard',
    });

    apiSuccess(res, { order: updated ?? order, refunded: true, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});
