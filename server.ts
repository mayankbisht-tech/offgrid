/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Load .env FIRST — must be before any other local imports that read process.env
import 'dotenv/config';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  products, 
  designs, 
  orders, 
  capabilities, 
  manufacturers, 
  manufacturerPaymentProfiles,
  designBids,
  designSamples,
  moderationRecords,
  createProduct, 
  createDesign,
  createDesignBid,
  createDesignSample,
  createNotification,
  createLiveProductFromDesign,
  promoteNextHeldBid,
  reloadStore,
  createOrder, 
  updateOrderStatus, 
  updateCapabilityCost,
  updateDesign,
  updateDesignBid,
  updateDesignSample,
  updateProduct,
  upsertManufacturerPaymentProfile,
  setModerationStatus,
  getModerationStatus,
  listNotificationsForUser,
  recalculateBidStatuses,
  attachWinningSample,
} from './server_db.js';
import { initDb, prisma } from './server_pg.js';
import { validateUploadFile, uploadToCloudinary, ALLOWED_MIME_TYPES, MAX_FILE_BYTES } from './src/lib/cloudinary.js';
import { validateEnv } from './src/config/env.js';

// dotenv is loaded above via `import 'dotenv/config'` so env vars are available to imports
validateEnv();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = process.env.APP_URL;

  if (origin && (!allowedOrigin || origin === allowedOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

// -------------------------------------------------------------
// POSTGRES AUTH & CREDENTIALS ENDPOINTS
// -------------------------------------------------------------
app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, password: true, name: true, role: true, username: true },
    });

    if (!dbUser) {
      res.status(401).json({ error: 'User does not exist in Neon PostgreSQL.' });
      return;
    }

    const accountStatus = getModerationStatus(dbUser.id);
    if (accountStatus === 'BLOCKED') {
      res.status(403).json({ error: 'This account is blocked by an administrator.' });
      return;
    }
    if (dbUser.password !== password) {
      res.status(401).json({ error: 'Incorrect password entered.' });
      return;
    }

    res.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        username: dbUser.username || undefined,
        accountStatus,
      }
    });
  } catch (error: any) {
    console.error('Login database error:', error);
    res.status(500).json({ error: 'Database authentication error: ' + error.message });
  }
});

app.post('/api/auth/register', async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, name, role, username } = req.body;
    if (!email || !password || !name || !role) {
      res.status(400).json({ error: 'Required signup credentials are missing.' });
      return;
    }

    const id = `usr-${Date.now()}`;
    await prisma.user.create({
      data: {
        id,
        email: email.toLowerCase().trim(),
        password,
        name,
        role,
        username: username || null,
      },
    });

    res.status(201).json({
      user: {
        id,
        email,
        name,
        role,
        username
      }
    });
  } catch (error: any) {
    console.error('Registration database error:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'An account with this email already exists in Neon PostgreSQL.' });
    } else {
      res.status(500).json({ error: 'Database signup error: ' + error.message });
    }
  }
});


// -------------------------------------------------------------
// SECURE GEMINI AI PROXY
// -------------------------------------------------------------
app.post('/api/generate', async (req: express.Request, res: express.Response) => {
  try {
    const { model, prompt, systemInstruction, temperature, searchGrounding } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not defined in the environment. Please add it in the Secrets panel (Settings > Secrets) in AI Studio.'
      });
      return;
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const config: any = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    if (typeof temperature === 'number') config.temperature = temperature;
    if (searchGrounding) config.tools = [{ googleSearch: {} }];

    const response = await ai.models.generateContent({
      model: model || 'gemini-3.5-flash',
      contents: prompt,
      config,
    });

    res.json({
      text: response.text || '',
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || null,
      webSearchQueries: response.candidates?.[0]?.groundingMetadata?.webSearchQueries || null,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// -------------------------------------------------------------
// OFFGRID FULL-STACK APIS
// -------------------------------------------------------------

// Active product list
app.get('/api/products', (req: express.Request, res: express.Response) => {
  res.json(products);
});

// Single product details
app.get('/api/products/:id', (req: express.Request, res: express.Response) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

// Dynamic design submission
app.post('/api/designs', async (req: express.Request, res: express.Response) => {
  try {
    const { designerId, designerName, title, description, fileUrl, fileType, tags } = req.body;
    if (!title || !fileUrl) {
      res.status(400).json({ error: 'Title and artwork file are required elements.' });
      return;
    }
    const newDesign = await createDesign({
      designerId: designerId || 'dsg-1',
      designerName: designerName || 'Karan Singh',
      title,
      description,
      fileUrl,
      fileType: fileType || 'PNG',
      tags: tags || [],
      workflowStatus: 'SUBMITTED',
      moderationStatus: getModerationStatus(designerId || 'dsg-1'),
      currentRound: 0,
    });
    res.status(201).json(newDesign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public design feed: only live designs with products
app.get('/api/designs', (req: express.Request, res: express.Response) => {
  const publicDesigns = designs
    .filter((d) => d.workflowStatus === 'LIVE' && d.liveProductId)
    .map((d) => {
      const product = products.find((p) => p.id === d.liveProductId) || products.find((p) => p.designId === d.id);
      return {
        ...d,
        productId: product?.id,
        image: d.fileUrl,
        price: product ? `?${(product.baseCostINR + product.designerPriceINR).toLocaleString('en-IN')}` : null,
        baseCostINR: product ? product.baseCostINR : 0,
        designerPriceINR: product ? product.designerPriceINR : 0,
        productType: product ? product.productType : 'hoodie',
        totalSold: product ? product.totalSold : 0,
        active: product?.active ?? false,
      };
  });
  res.json(publicDesigns);
});

// Approved design feed for manufacturers
app.get('/api/designs/approved', (_req: express.Request, res: express.Response) => {
  const approvedStatuses = new Set([
    'ADMIN_APPROVED',
    'BIDDING_OPEN',
    'SHORTLISTED',
    'HELD',
    'SAMPLE_IN_PROGRESS',
    'SAMPLE_REJECTED',
    'SAMPLE_APPROVED',
    'LIVE',
  ]);

  const approvedDesigns = designs
    .filter((design) => approvedStatuses.has(design.workflowStatus))
    .map((design) => {
      const product = products.find((item) => item.id === design.liveProductId) || products.find((item) => item.designId === design.id);
      const relatedBids = designBids.filter((bid) => bid.designId === design.id);
      const shortlistedBids = relatedBids.filter((bid) => bid.status === 'SHORTLISTED');
      const winningBid = relatedBids.find((bid) => bid.status === 'WINNING');
      const lowestBid = relatedBids.reduce<number | null>((lowest, bid) => {
        if (typeof lowest !== 'number') return bid.bidAmountINR;
        return Math.min(lowest, bid.bidAmountINR);
      }, null);
      return {
        ...design,
        productId: product?.id ?? null,
        productActive: product?.active ?? false,
        productType: product?.productType ?? design.preferredProductType ?? 'hoodie',
        image: design.fileUrl,
        bidSummary: {
          total: relatedBids.length,
          shortlisted: shortlistedBids.length,
          lowestBidINR: lowestBid,
          winningManufacturerId: winningBid?.manufacturerId ?? null,
          winningBidAmountINR: winningBid?.bidAmountINR ?? null,
        },
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  res.json(approvedDesigns);
});

// Public catalog for sellable assets from the media library
app.get('/api/catalog', async (_req: express.Request, res: express.Response) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      res.json([]);
      return;
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const resources: Array<Record<string, any>> = [];
    let nextCursor: string | undefined;

    do {
      const params = new URLSearchParams({
        max_results: '100',
      });
      if (nextCursor) params.set('next_cursor', nextCursor);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?${params.toString()}`;
      const cloudinaryRes = await fetch(cloudinaryUrl, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      if (!cloudinaryRes.ok) {
        throw new Error(`Cloudinary catalog fetch failed: ${cloudinaryRes.status} ${cloudinaryRes.statusText}`);
      }

      const payload = await cloudinaryRes.json() as { resources?: Array<Record<string, any>>; next_cursor?: string };
      resources.push(...(Array.isArray(payload.resources) ? payload.resources : []));
      nextCursor = payload.next_cursor;
    } while (nextCursor);

    const catalog = resources.map((resource) => {
      const matchedProduct = products.find(p =>
        p.image === resource.secure_url || p.image?.includes(resource.public_id)
      );
      const matchedDesign = designs.find(d =>
        d.fileUrl === resource.secure_url || d.fileUrl?.includes(resource.public_id)
      );

      if (!matchedProduct && (!matchedDesign || matchedDesign.workflowStatus !== 'LIVE')) {
        return null;
      }

      return {
        id: matchedProduct?.id ?? matchedDesign?.id ?? resource.public_id,
        designId: matchedProduct?.designId ?? matchedDesign?.id ?? resource.public_id,
        designerId: matchedProduct?.designerId ?? matchedDesign?.designerId ?? 'dsg-guest',
        designerName: matchedProduct?.designerName ?? matchedDesign?.designerName ?? 'OFFGRID Creator',
        title: matchedProduct?.title ?? matchedDesign?.title ?? resource.public_id.split('/').pop()?.replace(/[-_]+/g, ' ') ?? 'Untitled Design',
        description: matchedProduct?.description ?? matchedDesign?.description ?? '',
        image: resource.secure_url,
        fileUrl: resource.secure_url,
        productType: matchedProduct?.productType ?? 'hoodie',
        baseCostINR: matchedProduct?.baseCostINR ?? 0,
        designerPriceINR: matchedProduct?.designerPriceINR ?? 0,
        price: matchedProduct ? `₹${(matchedProduct.baseCostINR + matchedProduct.designerPriceINR).toLocaleString('en-IN')}` : null,
        active: matchedProduct?.active ?? true,
        featured: matchedProduct?.featured ?? false,
        totalSold: matchedProduct?.totalSold ?? 0,
        public_id: resource.public_id,
        width: resource.width,
        height: resource.height,
        format: resource.format,
      };
    });

    res.json(catalog.filter(Boolean));
  } catch (error: any) {
    console.error('[/api/catalog] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Dynamic listed product launch
app.post('/api/products', async (req: express.Request, res: express.Response) => {
  try {
    const { designId, designerId, designerName, title, description, productType, image, baseCostINR, designerPriceINR, manufacturerId } = req.body;
    if (!designId || !title || !productType) {
      res.status(400).json({ error: 'Required config elements (designId, title, productType) are missing.' });
      return;
    }
    const design = designs.find((item) => item.id === designId);
    if (!design || (design.workflowStatus !== 'SAMPLE_APPROVED' && req.body?.allowDirectPublish !== true)) {
      res.status(403).json({ error: 'Design must complete approval before product publishing.' });
      return;
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct = await createProduct({
      designId,
      designerId: designerId || 'dsg-1',
      designerName: designerName || 'Karan Singh',
      manufacturerId,
      slug,
      title,
      description,
      productType,
      image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
      baseCostINR: baseCostINR || 300,
      designerPriceINR: designerPriceINR || 400,
      active: true,
      featured: false
    });
    await updateDesign(design.id, {
      liveProductId: newProduct.id,
      workflowStatus: 'LIVE',
    });
    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Orders active feed
app.get('/api/orders', (req: express.Request, res: express.Response) => {
  res.json(orders);
});

// Submit a new order
app.post('/api/orders', async (req: express.Request, res: express.Response) => {
  try {
    const { consumerId, consumerName, consumerEmail, items, shippingAddress, subtotalINR, shippingINR, totalINR, paymentMethod } = req.body;
    if (!items || items.length === 0 || !shippingAddress) {
      res.status(400).json({ error: 'Orders require selected items and shipping coordinates.' });
      return;
    }
    const orderObj = await createOrder({
      consumerId: consumerId || 'usr-6',
      consumerName: consumerName || 'Mayank Bisht',
      consumerEmail: consumerEmail || 'mayankbisht1107@gmail.com',
      status: 'PAYMENT_CONFIRMED',
      items,
      shippingAddress,
      subtotalINR,
      shippingINR,
      totalINR,
      paymentMethod: paymentMethod || 'upi'
    });
    res.status(201).json(orderObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Fulfillment actions)
app.patch('/api/orders/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { status, trackingNumber, courierName } = req.body;
    const updated = await updateOrderStatus(req.params.id, status, trackingNumber, courierName);
    if (!updated) {
      res.status(404).json({ error: 'Active Order not spotted.' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// PAYMENT PROCESSING (UPI and Bank Transfer)
// -------------------------------------------------------------

// Payment processing (placeholder for UPI and bank transfer)
app.post('/api/payments/process', (req: express.Request, res: express.Response) => {
  try {
    const { paymentMethod, amount, orderId } = req.body;
    
    if (!paymentMethod || !amount || !orderId) {
      res.status(400).json({ error: 'Payment method, amount, and order ID are required.' });
      return;
    }
    
    // Mock payment processing
    const paymentId = `${paymentMethod}_${Date.now()}`;
    
    res.json({
      success: true,
      paymentId,
      message: `Payment initiated with ${paymentMethod}. Please complete the payment.`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment details for UPI or bank transfer
app.get('/api/payments/details', (req: express.Request, res: express.Response) => {
  try {
    const paymentMethod = req.query.method as 'upi' | 'bank_transfer';
    
    if (!paymentMethod || (paymentMethod !== 'upi' && paymentMethod !== 'bank_transfer')) {
      res.status(400).json({ error: 'Invalid payment method. Use "upi" or "bank_transfer".' });
      return;
    }
    
    if (paymentMethod === 'upi') {
      res.json({
        method: 'UPI',
        upiId: process.env.UPI_ID || 'yourupiid@bank',
        instructions: 'Scan the QR code or send payment to the UPI ID above.'
      });
    } else {
      res.json({
        method: 'Bank Transfer',
        bankName: process.env.BANK_NAME || 'Your Bank Name',
        accountNumber: process.env.BANK_ACCOUNT || '1234567890',
        ifscCode: process.env.BANK_IFSC || 'BANK0001234',
        instructions: 'Transfer the amount to the account details above and use the order ID as reference.'
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Workflow APIs for design approval, bidding, samples, and moderation
app.get('/api/admin/designs', (_req: express.Request, res: express.Response) => {
  res.json(designs);
});

app.patch('/api/admin/designs/:designId/approve', async (req: express.Request, res: express.Response) => {
  const design = designs.find((item) => item.id === req.params.designId);
  if (!design) {
    res.status(404).json({ error: 'Design not found.' });
    return;
  }
  const updated = await updateDesign(design.id, {
    workflowStatus: 'ADMIN_APPROVED',
    adminReviewedAt: new Date().toISOString(),
    adminReviewedBy: req.body?.adminId || 'admin',
    adminNotes: req.body?.notes || design.adminNotes,
  });
  await createNotification({
    userId: design.designerId,
    role: 'DESIGNER',
    title: 'Design approved',
    message: `Your design "${design.title}" was approved by the admin review team.`,
    category: 'DESIGN_APPROVED',
    link: '/dashboard',
  });
  res.json({ design: updated ?? design });
});

app.patch('/api/admin/designs/:designId/reject', async (req: express.Request, res: express.Response) => {
  const design = designs.find((item) => item.id === req.params.designId);
  if (!design) {
    res.status(404).json({ error: 'Design not found.' });
    return;
  }
  const updated = await updateDesign(design.id, {
    workflowStatus: 'REJECTED',
    adminReviewedAt: new Date().toISOString(),
    adminReviewedBy: req.body?.adminId || 'admin',
    adminNotes: req.body?.notes || design.adminNotes,
  });
  await createNotification({
    userId: design.designerId,
    role: 'DESIGNER',
    title: 'Design rejected',
    message: `Your design "${design.title}" was rejected by the admin review team.`,
    category: 'DESIGN_REJECTED',
    link: '/dashboard',
  });
  res.json({ design: updated ?? design });
});

app.get('/api/users/:userId/notifications', (req: express.Request, res: express.Response) => {
  res.json(listNotificationsForUser(req.params.userId));
});

app.get('/api/designs/:designId/bids', (req: express.Request, res: express.Response) => {
  const bids = designBids
    .filter((bid) => bid.designId === req.params.designId)
    .sort((a, b) => a.bidAmountINR - b.bidAmountINR || a.createdAt.localeCompare(b.createdAt));
  res.json(bids);
});

app.post('/api/designs/:designId/bids', async (req: express.Request, res: express.Response) => {
  const design = designs.find((item) => item.id === req.params.designId);
  if (!design) {
    res.status(404).json({ error: 'Design not found.' });
    return;
  }
  if (design.moderationStatus === 'BLOCKED') {
    res.status(403).json({ error: 'This design is blocked.' });
    return;
  }

  const { manufacturerId, manufacturerName, bidAmountINR, turnAroundDays } = req.body ?? {};
  if (!manufacturerId || typeof bidAmountINR !== 'number') {
    res.status(400).json({ error: 'manufacturerId and bidAmountINR are required.' });
    return;
  }

  if (getModerationStatus(manufacturerId) === 'BLOCKED') {
    res.status(403).json({ error: 'This manufacturer is blocked.' });
    return;
  }

  const bid = await createDesignBid({
    designId: design.id,
    manufacturerId,
    manufacturerName: manufacturerName || 'Manufacturer',
    bidAmountINR,
    turnAroundDays: typeof turnAroundDays === 'number' ? turnAroundDays : 7,
  });

  await updateDesign(design.id, {
    workflowStatus: 'BIDDING_OPEN',
  });
  const ranked = await recalculateBidStatuses(design.id);
  res.status(201).json({ bid, bids: ranked });
});

app.post('/api/designs/:designId/samples', async (req: express.Request, res: express.Response) => {
  const design = designs.find((item) => item.id === req.params.designId);
  if (!design) {
    res.status(404).json({ error: 'Design not found.' });
    return;
  }

  const { bidId, manufacturerId, designerId, imageUrl, notes } = req.body ?? {};
  const bid = designBids.find((item) => item.id === bidId && item.designId === design.id);
  if (!bid) {
    res.status(404).json({ error: 'Bid not found for this design.' });
    return;
  }

  const sample = await createDesignSample({
    designId: design.id,
    bidId,
    manufacturerId: manufacturerId || bid.manufacturerId,
    designerId: designerId || design.designerId,
    status: 'IN_PROGRESS',
    sampleCostSplit: '50/50 designer/manufacturer',
    imageUrl,
    notes,
  });

  await updateDesignBid(bid.id, {
    sampleStatus: 'IN_PROGRESS',
  });
  await updateDesign(design.id, {
    workflowStatus: 'SAMPLE_IN_PROGRESS',
  });

  res.status(201).json({ sample, design });
});

app.patch('/api/designs/:designId/samples/:sampleId/decision', async (req: express.Request, res: express.Response) => {
  const design = designs.find((item) => item.id === req.params.designId);
  const sample = designSamples.find((item) => item.id === req.params.sampleId && item.designId === req.params.designId);
  if (!design || !sample) {
    res.status(404).json({ error: 'Design or sample not found.' });
    return;
  }

  const { status } = req.body ?? {};
  if (status === 'APPROVED') {
    await attachWinningSample(design.id, sample.bidId, sample.id, sample.manufacturerId);
    const product = await createLiveProductFromDesign(design.id, sample.bidId);
    res.json({ design, product, sample });
    return;
  }

  await updateDesignSample(sample.id, {
    status: 'REJECTED',
    reviewedAt: new Date().toISOString(),
    reviewedBy: 'admin',
  } as any);
  await updateDesignBid(sample.bidId, {
    status: 'REJECTED',
    sampleStatus: 'REJECTED',
  });

  const promotedBid = await promoteNextHeldBid(design.id);
  if (promotedBid) {
    res.json({ design, sample, promotedBid });
    return;
  }

  await updateDesign(design.id, {
    workflowStatus: 'BIDDING_OPEN',
  });
  res.json({ design, sample, promotedBid: null });
});

app.patch('/api/admin/users/:userId/status', async (req: express.Request, res: express.Response) => {
  const { status, reason, role, adminId } = req.body ?? {};
  if (!status || !['ACTIVE', 'PAUSED', 'BLOCKED'].includes(status)) {
    res.status(400).json({ error: 'Valid status is required.' });
    return;
  }

  const record = await setModerationStatus({
    userId: req.params.userId,
    role: role || 'MANUFACTURER',
    status,
    reason,
    updatedBy: adminId || 'admin',
  });

  await Promise.all(designs
    .filter((design) => design.designerId === req.params.userId || design.winningManufacturerId === req.params.userId)
    .map((design) => updateDesign(design.id, {
      moderationStatus: status,
      workflowStatus: status === 'BLOCKED' ? 'BLOCKED' : status === 'PAUSED' ? 'PAUSED' : design.workflowStatus,
    })));

  await Promise.all(designBids
    .filter((bid) => bid.manufacturerId === req.params.userId && status !== 'ACTIVE')
    .map((bid) => updateDesignBid(bid.id, {
      status: status === 'BLOCKED' ? 'REJECTED' : bid.status,
      heldReason: status === 'BLOCKED' ? 'Manufacturer blocked by admin' : bid.heldReason,
    })));

  res.json({ record });
});

app.get('/api/admin/analytics', (_req: express.Request, res: express.Response) => {
  const designerAnalytics = designs.reduce<Record<string, { designerId: string; designs: number; liveProducts: number; bids: number; }>>((acc, design) => {
    acc[design.designerId] ||= { designerId: design.designerId, designs: 0, liveProducts: 0, bids: 0 };
    acc[design.designerId].designs += 1;
    if (design.liveProductId) acc[design.designerId].liveProducts += 1;
    acc[design.designerId].bids += designBids.filter((bid) => bid.designId === design.id).length;
    return acc;
  }, {});

  const manufacturerAnalytics = designBids.reduce<Record<string, { manufacturerId: string; bids: number; shortlisted: number; winning: number; samples: number; }>>((acc, bid) => {
    acc[bid.manufacturerId] ||= { manufacturerId: bid.manufacturerId, bids: 0, shortlisted: 0, winning: 0, samples: 0 };
    acc[bid.manufacturerId].bids += 1;
    if (bid.status === 'SHORTLISTED') acc[bid.manufacturerId].shortlisted += 1;
    if (bid.status === 'WINNING') acc[bid.manufacturerId].winning += 1;
    acc[bid.manufacturerId].samples += designSamples.filter((sample) => sample.bidId === bid.id).length;
    return acc;
  }, {});

  res.json({
    designs: designs.length,
    products: products.length,
    bids: designBids.length,
    samples: designSamples.length,
    designerAnalytics: Object.values(designerAnalytics),
    manufacturerAnalytics: Object.values(manufacturerAnalytics),
    moderationRecords: Object.values(moderationRecords),
  });
});

app.get('/api/designs/:designId/workflow', (req: express.Request, res: express.Response) => {
  const design = designs.find((item) => item.id === req.params.designId);
  if (!design) {
    res.status(404).json({ error: 'Design not found.' });
    return;
  }
  const bids = designBids.filter((bid) => bid.designId === design.id).sort((a, b) => a.bidAmountINR - b.bidAmountINR || a.createdAt.localeCompare(b.createdAt));
  const samples = designSamples.filter((sample) => sample.designId === design.id);
  res.json({ design, bids, samples });
});

app.patch('/api/products/:id/publish-from-design', async (req: express.Request, res: express.Response) => {
  const design = designs.find((item) => item.id === req.body?.designId);
  const product = products.find((item) => item.id === req.params.id);
  if (!design || !product) {
    res.status(404).json({ error: 'Design or product not found.' });
    return;
  }
  await updateDesign(design.id, {
    liveProductId: product.id,
    workflowStatus: 'LIVE',
  });
  await updateProduct(product.id, {
    active: true,
  });
  res.json({ design, product });
});

app.get('/api/manufacturers/:manufacturerId/bids', (req: express.Request, res: express.Response) => {
  const manufacturerId = req.params.manufacturerId;
  const bids = designBids
    .filter((bid) => bid.manufacturerId === manufacturerId)
    .map((bid) => ({
      ...bid,
      design: designs.find((design) => design.id === bid.designId) ?? null,
      sample: designSamples.find((sample) => sample.bidId === bid.id) ?? null,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  res.json(bids);
});

// Capabilities configurations APIs
app.get('/api/capabilities', (req: express.Request, res: express.Response) => {
  res.json(capabilities);
});

app.get('/api/manufacturers/:userId/payment-info', (req: express.Request, res: express.Response) => {
  const profile = manufacturerPaymentProfiles[req.params.userId];
  res.json(profile ?? null);
});

app.patch('/api/manufacturers/:userId/payment-info', (req: express.Request, res: express.Response) => {
  try {
    const { businessName, preferredPayoutMethod, accountHolderName, upiId, bankName, bankAccount, bankIFSC } = req.body ?? {};
    const userId = req.params.userId;

    if (typeof businessName !== 'string' || !businessName.trim()) {
      res.status(400).json({ error: 'Business name is required.' });
      return;
    }

    if (preferredPayoutMethod !== 'upi' && preferredPayoutMethod !== 'bank_transfer') {
      res.status(400).json({ error: 'Preferred payout method must be "upi" or "bank_transfer".' });
      return;
    }

    if (preferredPayoutMethod === 'upi' && (typeof upiId !== 'string' || !upiId.trim())) {
      res.status(400).json({ error: 'UPI ID is required for UPI payouts.' });
      return;
    }

    if (preferredPayoutMethod === 'bank_transfer') {
      if (typeof bankName !== 'string' || !bankName.trim()) {
        res.status(400).json({ error: 'Bank name is required for bank transfer payouts.' });
        return;
      }
      if (typeof bankAccount !== 'string' || !bankAccount.trim()) {
        res.status(400).json({ error: 'Bank account number is required for bank transfer payouts.' });
        return;
      }
      if (typeof bankIFSC !== 'string' || !bankIFSC.trim()) {
        res.status(400).json({ error: 'IFSC code is required for bank transfer payouts.' });
        return;
      }
    }

    const profile = upsertManufacturerPaymentProfile({
      userId,
      businessName: businessName.trim(),
      preferredPayoutMethod,
      accountHolderName: typeof accountHolderName === 'string' ? accountHolderName.trim() || undefined : undefined,
      upiId: typeof upiId === 'string' ? upiId.trim() || undefined : undefined,
      bankName: typeof bankName === 'string' ? bankName.trim() || undefined : undefined,
      bankAccount: typeof bankAccount === 'string' ? bankAccount.trim() || undefined : undefined,
      bankIFSC: typeof bankIFSC === 'string' ? bankIFSC.trim() || undefined : undefined,
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/capabilities/:id', (req: express.Request, res: express.Response) => {
  try {
    const { baseCostINR } = req.body;
    if (typeof baseCostINR !== 'number') {
      res.status(400).json({ error: 'Base cost must be configured as a valid numeric amount.' });
      return;
    }
    updateCapabilityCost(req.params.id, baseCostINR);
    res.json({ success: true, capabilities });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// CLOUDINARY DESIGN UPLOAD (Designer role)
// -------------------------------------------------------------
app.post('/api/designs/upload', async (req: express.Request, res: express.Response) => {
  try {
    const { fileBase64, fileName, fileType, fileSize, designerId, designerName } = req.body;

    if (!fileBase64 || !fileType) {
      res.status(400).json({ error: 'fileBase64 and fileType are required.' });
      return;
    }

    // Validate before uploading artwork
    try {
      validateUploadFile({ size: fileSize ?? 0, type: fileType });
    } catch (validationError: any) {
      res.status(400).json({ error: validationError.message });
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // Artwork storage not configured — return a placeholder URL so the app stays functional
      res.json({
        secure_url: `https://placehold.co/800x800/aa3000/fff?text=${encodeURIComponent(fileName || 'design')}`,
        public_id: `offgrid/designs/placeholder-${Date.now()}`,
        configured: false,
        message: 'Artwork upload is not configured. Set the artwork storage environment variables to enable real uploads.',
      });
      return;
    }

    const result = await uploadToCloudinary(fileBase64, {
      folder: 'offgrid/designs',
      resourceType: 'auto',
    });

    res.json({ ...result, configured: true });
  } catch (error: any) {
    console.error('[/api/designs/upload] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Artwork storage config info (safe to expose — no secrets)
app.get('/api/cloudinary/config', (_req: express.Request, res: express.Response) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'offgrid_designs',
    configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    allowedTypes: ALLOWED_MIME_TYPES,
    maxFileMB: MAX_FILE_BYTES / 1024 / 1024,
  });
});

// -------------------------------------------------------------
// DESIGN PUBLISH - create Design submission for admin review
// -------------------------------------------------------------
app.post('/api/designs/publish', async (req: express.Request, res: express.Response) => {
  try {
    const {
      cloudinaryUrl, publicId, title, description, designerId, designerName,
      tags, productType,
    } = req.body;

    if (!cloudinaryUrl || !title || !designerId) {
      res.status(400).json({ error: 'cloudinaryUrl, title, and designerId are required.' });
      return;
    }

    const design = await createDesign({
      designerId,
      designerName: designerName || 'Unknown Designer',
      title: title.trim(),
      description: description || '',
      fileUrl: cloudinaryUrl,
      fileType: (publicId?.split('.').pop() ?? 'PNG').toUpperCase(),
      tags: Array.isArray(tags) ? tags : [],
      preferredProductType: productType || 'hoodie',
      workflowStatus: 'SUBMITTED',
      moderationStatus: getModerationStatus(designerId),
      currentRound: 0,
      adminNotes: productType ? `Preferred product type: ${productType}` : undefined,
    });

    res.status(201).json({ design, status: 'SUBMITTED' });
  } catch (error: any) {
    console.error('[/api/designs/publish] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all designs for a specific designer (by designerId)
app.get('/api/designers/:designerId/designs', (req: express.Request, res: express.Response) => {
  const { designerId } = req.params;
  const designerDesigns = designs.filter(d => d.designerId === designerId);
  // Attach corresponding product info (image, price) for the dashboard view
  const enriched = designerDesigns.map(d => {
    const product = products.find(p => p.designId === d.id);
    return {
      ...d,
      productId: product?.id,
      image: d.fileUrl,  // Cloudinary URL
      price: product ? `₹${(product.baseCostINR + product.designerPriceINR).toLocaleString('en-IN')}` : null,
      baseCostINR: product ? product.baseCostINR : 0,
      designerPriceINR: product ? product.designerPriceINR : 0,
      productType: product ? product.productType : 'hoodie',
      totalSold: product ? product.totalSold : 0,
      active: product?.active ?? false,
    };
  });
  res.json(enriched);
});

// Get products for a specific designer (for public creator profile)
app.get('/api/designers/:designerId/products', (req: express.Request, res: express.Response) => {
  const { designerId } = req.params;
  res.json(products.filter(p => p.designerId === designerId));
});

// Get a designer's public details
app.get('/api/designers/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const userRow = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, role: true, username: true },
    });

    if (!userRow) {
      // If user isn't in PostgreSQL (e.g. legacy/seed users without DB or custom designer id like 'dsg-1')
      // we can return a fallback dummy designer
      res.json({
        id,
        name: id === 'dsg-1' ? 'Karan Singh' : 'Unknown Designer',
        username: id === 'dsg-1' ? 'karan_singh' : 'unknown_designer',
        role: 'DESIGNER',
      });
      return;
    }

    res.json(userRow);
  } catch (error: any) {
    console.error('Error fetching designer:', error);
    res.status(500).json({ error: 'Database error: ' + error.message });
  }
});


// -------------------------------------------------------------
// CLIENT ASSETS WEB HOSTING
// -------------------------------------------------------------

async function startServer() {
  // Initialize Neon PostgreSQL database
  await initDb();
  await reloadStore();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-Stack server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error starting full-stack server:', err);
});
