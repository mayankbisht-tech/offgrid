/**
 * Admin product management routes.
 *
 * GET   /api/admin/products        — list all products (searchable by title)
 * GET   /api/admin/products/:id    — single product
 * PATCH /api/admin/products/:id    — edit fields (title, price, active, featured)
 * PATCH /api/admin/products/:id/activate   — set active = true
 * PATCH /api/admin/products/:id/deactivate — set active = false
 * DELETE /api/admin/products/:id   — delete product record
 */
import { Router } from 'express';
import { z } from 'zod';
import { apiSuccess, apiError } from '../../../src/utils/apiResponse.js';
import { products, designs, updateProduct } from '../../../server_db.js';
import { prisma } from '../../../server_pg.js';

export const productsRouter = Router();

/** @openapi
 * /api/admin/products:
 *   get:
 *     summary: List all products
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Full-text search on title
 */
productsRouter.get('/', (req, res) => {
  const { q, active } = req.query as Record<string, string>;

  let list = [...products];
  if (q) {
    const lower = q.toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(lower) || p.designerName.toLowerCase().includes(lower));
  }
  if (active !== undefined) {
    list = list.filter((p) => p.active === (active === 'true'));
  }

  const enriched = list.map((p) => ({
    ...p,
    design: designs.find((d) => d.id === p.designId) ?? null,
  }));

  apiSuccess(res, enriched);
});

/** @openapi
 * /api/admin/products/{id}:
 *   get:
 *     summary: Single product detail
 */
productsRouter.get('/:id', (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    apiError(res, 'Product not found.', 404);
    return;
  }
  apiSuccess(res, {
    ...product,
    design: designs.find((d) => d.id === product.designId) ?? null,
  });
});

const editSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  baseCostINR: z.number().int().positive().optional(),
  designerPriceINR: z.number().int().positive().optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
});

/** @openapi
 * /api/admin/products/{id}:
 *   patch:
 *     summary: Edit product fields
 */
productsRouter.patch('/:id', async (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    apiError(res, 'Product not found.', 404);
    return;
  }

  const parsed = editSchema.safeParse(req.body);
  if (!parsed.success) {
    apiError(res, parsed.error.errors.map((e) => e.message).join(', '), 400);
    return;
  }

  try {
    const updated = await updateProduct(product.id, parsed.data);
    apiSuccess(res, { product: updated ?? product, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

/** @openapi
 * /api/admin/products/{id}/activate:
 *   patch:
 *     summary: Activate a product (make it visible in shop)
 */
productsRouter.patch('/:id/activate', async (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    apiError(res, 'Product not found.', 404);
    return;
  }
  try {
    const updated = await updateProduct(product.id, { active: true });
    apiSuccess(res, { product: updated ?? product, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

/** @openapi
 * /api/admin/products/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a product (hide from shop)
 */
productsRouter.patch('/:id/deactivate', async (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    apiError(res, 'Product not found.', 404);
    return;
  }
  try {
    const updated = await updateProduct(product.id, { active: false });
    apiSuccess(res, { product: updated ?? product, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});

/** @openapi
 * /api/admin/products/{id}:
 *   delete:
 *     summary: Delete a product record
 */
productsRouter.delete('/:id', async (req, res) => {
  const idx = products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    apiError(res, 'Product not found.', 404);
    return;
  }
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    products.splice(idx, 1);
    apiSuccess(res, { deleted: true, id: req.params.id, actedBy: req.actingUser ?? 'system' });
  } catch (err: any) {
    apiError(res, err.message, 500);
  }
});
