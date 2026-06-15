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
  createProduct, 
  createDesign, 
  createOrder, 
  updateOrderStatus, 
  updateCapabilityCost 
} from './server_db.js';
import { initDb, pool } from './server_pg.js';
import { validateUploadFile, uploadToCloudinary, ALLOWED_MIME_TYPES, MAX_FILE_BYTES } from './src/lib/cloudinary.js';
import { validateEnv } from './src/config/env.js';

// dotenv is loaded above via `import 'dotenv/config'` so env vars are available to imports
validateEnv();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

    const { rows } = await pool.query(
      'SELECT id, email, password, name, role, username FROM offgrid_users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'User does not exist in Neon PostgreSQL.' });
      return;
    }

    const dbUser = rows[0];
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
        username: dbUser.username || undefined
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
    await pool.query(
      `INSERT INTO offgrid_users (id, email, password, name, role, username)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, email.toLowerCase().trim(), password, name, role, username || null]
    );

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
app.post('/api/designs', (req: express.Request, res: express.Response) => {
  try {
    const { designerId, designerName, title, description, fileUrl, fileType, tags } = req.body;
    if (!title || !fileUrl) {
      res.status(400).json({ error: 'Title and artwork file are required elements.' });
      return;
    }
    const newDesign = createDesign({
      designerId: designerId || 'dsg-1',
      designerName: designerName || 'Karan Singh',
      title,
      description,
      fileUrl,
      fileType: fileType || 'PNG',
      tags: tags || []
    });
    res.status(201).json(newDesign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Dynamic listed product launch
app.post('/api/products', (req: express.Request, res: express.Response) => {
  try {
    const { designId, designerId, designerName, title, description, productType, image, baseCostINR, designerPriceINR } = req.body;
    if (!designId || !title || !productType) {
      res.status(400).json({ error: 'Required config elements (designId, title, productType) are missing.' });
      return;
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct = createProduct({
      designId,
      designerId: designerId || 'dsg-1',
      designerName: designerName || 'Karan Singh',
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
app.post('/api/orders', (req: express.Request, res: express.Response) => {
  try {
    const { consumerId, consumerName, consumerEmail, items, shippingAddress, subtotalINR, shippingINR, totalINR, paymentMethod } = req.body;
    if (!items || items.length === 0 || !shippingAddress) {
      res.status(400).json({ error: 'Orders require selected items and shipping coordinates.' });
      return;
    }
    const orderObj = createOrder({
      consumerId: consumerId || 'usr-6',
      consumerName: consumerName || 'Mayank Bisht',
      consumerEmail: consumerEmail || 'mayankbisht1107@gmail.com',
      status: 'PAYMENT_CONFIRMED',
      items,
      shippingAddress,
      subtotalINR,
      shippingINR,
      totalINR,
      paymentMethod: paymentMethod || 'razorpay'
    });
    res.status(201).json(orderObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Fulfillment actions)
app.patch('/api/orders/:id', (req: express.Request, res: express.Response) => {
  try {
    const { status, trackingNumber, courierName } = req.body;
    const updated = updateOrderStatus(req.params.id, status, trackingNumber, courierName);
    if (!updated) {
      res.status(404).json({ error: 'Active Order not spotted.' });
      return;
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Capabilities configurations APIs
app.get('/api/capabilities', (req: express.Request, res: express.Response) => {
  res.json(capabilities);
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

    // Validate before hitting Cloudinary
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
      // Cloudinary not configured — return a placeholder URL so the app stays functional
      res.json({
        secure_url: `https://placehold.co/800x800/aa3000/fff?text=${encodeURIComponent(fileName || 'design')}`,
        public_id: `offgrid/designs/placeholder-${Date.now()}`,
        configured: false,
        message: 'Cloudinary env vars not set. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env to enable real uploads.',
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

// Cloudinary config info (safe to expose — no secrets)
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
// DESIGN PUBLISH — one-shot: create Design + Product with Cloudinary URL
// -------------------------------------------------------------
app.post('/api/designs/publish', async (req: express.Request, res: express.Response) => {
  try {
    const {
      cloudinaryUrl, publicId, title, description, designerId, designerName,
      tags, productType, baseCostINR, designerPriceINR,
    } = req.body;

    if (!cloudinaryUrl || !title || !designerId) {
      res.status(400).json({ error: 'cloudinaryUrl, title, and designerId are required.' });
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // 1. Create Design record
    const design = createDesign({
      designerId,
      designerName: designerName || 'Unknown Designer',
      title: title.trim(),
      description: description || '',
      fileUrl: cloudinaryUrl,
      fileType: (publicId?.split('.').pop() ?? 'PNG').toUpperCase(),
      tags: Array.isArray(tags) ? tags : [],
    });

    // 2. Auto-create a Product listing so it's visible in the shop
    const product = createProduct({
      designId: design.id,
      designerId,
      designerName: designerName || 'Unknown Designer',
      slug,
      title: title.trim(),
      description: description || '',
      productType: productType || 'hoodie',
      image: cloudinaryUrl,           // ← real Cloudinary URL
      baseCostINR: baseCostINR ?? 300,
      designerPriceINR: designerPriceINR ?? 150,
      active: true,
      featured: false,
    });

    res.status(201).json({ design, product });
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
    const { rows } = await pool.query(
      'SELECT id, name, role, username FROM offgrid_users WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
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

    res.json(rows[0]);
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
