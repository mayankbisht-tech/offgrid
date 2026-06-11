/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Designer, Manufacturer, Capability, Design, Product, Order, OrderStatus } from './src/types.js';

// Pre-seeded Users
export let users: User[] = [
  { id: 'usr-1', email: 'karan_singh@gmail.com', name: 'Karan Singh', role: 'DESIGNER', locale: 'en-IN' },
  { id: 'usr-2', email: 'anusha_rao@gmail.com', name: 'Anusha Rao', role: 'DESIGNER', locale: 'en-IN' },
  { id: 'usr-3', email: 'siddharth@gmail.com', name: 'Siddharth Roy', role: 'DESIGNER', locale: 'en-US' },
  { id: 'usr-4', email: 'mumbai_prints@gmail.com', name: 'Om Shanti Printworks', role: 'MANUFACTURER', locale: 'en-IN' },
  { id: 'usr-5', email: 'deccan_weavers@gmail.com', name: 'Deccan Weaver Labs', role: 'MANUFACTURER', locale: 'en-IN' },
  { id: 'usr-6', email: 'mayankbisht1107@gmail.com', name: 'Mayank Bisht', role: 'CONSUMER', locale: 'en-IN' }
];

// Pre-seeded Designers
export let designers: Designer[] = [
  {
    id: 'dsg-1',
    userId: 'usr-1',
    username: 'karan_singh',
    bio: 'Visual artist specializing in heavy psychedelic illustrations, blocks, and neo-traditional Indian palettes.',
    city: 'New Delhi',
    country: 'IN',
    portfolioUrl: 'https://karansingh.art',
    gstNumber: '07AAAAA1111A1Z1',
    verified: true,
    bankIFSC: 'SBIN0001234',
    bankAccount: '123456789012'
  },
  {
    id: 'dsg-2',
    userId: 'usr-2',
    username: 'anusha_rao',
    bio: 'Graphic designer capturing the vintage hand-painted street signboards, matchbox covers, and old-school Indian advertisement typography.',
    city: 'Mumbai',
    country: 'IN',
    portfolioUrl: 'https://anusharao.design',
    gstNumber: '27BBBBB2222B2Z2',
    verified: true,
    bankIFSC: 'HDFC0004567',
    bankAccount: '987654321098'
  },
  {
    id: 'dsg-3',
    userId: 'usr-3',
    username: 'siddharth_roy',
    bio: 'Editorial and modular printmaker exploring neo-brutalist layouts, high-contrast monochrome patterns, and heavy grids.',
    city: 'New York',
    country: 'US',
    portfolioUrl: 'https://siddharthroy.io',
    verified: true,
    bankIFSC: 'CHASE00011',
    bankAccount: '883391102919'
  }
];

// Pre-seeded Manufacturers
export let manufacturers: Manufacturer[] = [
  {
    id: 'mfr-1',
    userId: 'usr-4',
    businessName: 'Om Shanti Printworks',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'IN',
    gstNumber: '27CCCCC3333C3Z3',
    verified: true,
    avgRating: 4.8,
    totalFulfilled: 342,
    maxCapacity: 500
  },
  {
    id: 'mfr-2',
    userId: 'usr-5',
    businessName: 'Deccan Weaver Labs',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'IN',
    gstNumber: '29DDDDD4444D4Z4',
    verified: true,
    avgRating: 4.7,
    totalFulfilled: 198,
    maxCapacity: 300
  }
];

// Pre-seeded Capabilities
export let capabilities: Capability[] = [
  {
    id: 'cap-1',
    manufacturerId: 'mfr-1',
    printType: 'DTG',
    materials: ['cotton', 'canvas'],
    productTypes: ['tshirt', 'hoodie', 'tote'],
    minOrderQty: 1,
    turnaroundDays: 3,
    baseCostINR: 190,
    active: true
  },
  {
    id: 'cap-2',
    manufacturerId: 'mfr-1',
    printType: 'Embroidery',
    materials: ['cotton', 'polyester'],
    productTypes: ['hoodie', 'tshirt'],
    minOrderQty: 1,
    turnaroundDays: 5,
    baseCostINR: 230,
    active: true
  },
  {
    id: 'cap-3',
    manufacturerId: 'mfr-2',
    printType: 'Screen',
    materials: ['cotton'],
    productTypes: ['tshirt', 'tote', 'poster'],
    minOrderQty: 5,
    turnaroundDays: 4,
    baseCostINR: 120,
    active: true
  },
  {
    id: 'cap-4',
    manufacturerId: 'mfr-2',
    printType: 'Sublimation',
    materials: ['polyester', 'ceramic', 'plastic'],
    productTypes: ['phone_case', 'poster'],
    minOrderQty: 1,
    turnaroundDays: 2,
    baseCostINR: 140,
    active: true
  }
];

// Pre-seeded Designs
export let designs: Design[] = [
  {
    id: 'dsn-1',
    designerId: 'dsg-1',
    designerName: 'Karan Singh',
    title: 'Psychedelic Soundscape',
    description: 'A heavy concentric wavy pattern exploring bright saffron, cobalt, and hot-pink intersections.',
    fileUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop',
    fileType: 'PNG',
    tags: ['psychedelic', 'retro', 'colorful'],
    createdAt: '2026-05-10T12:00:00Z'
  },
  {
    id: 'dsn-2',
    designerId: 'dsg-2',
    designerName: 'Anusha Rao',
    title: 'Nataraj Super Matches',
    description: 'A woodblock print inspired by 1970s South Indian matchbox artwork, featuring heavy typography.',
    fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    fileType: 'SVG',
    tags: ['vintage', 'indian-core', 'typography'],
    createdAt: '2026-05-12T14:30:00Z'
  },
  {
    id: 'dsn-3',
    designerId: 'dsg-3',
    designerName: 'Siddharth Roy',
    title: 'Typographic Brutalism',
    description: 'High-contrast monochrome heavy font layout overlaid on architectural grid blueprints.',
    fileUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=600&auto=format&fit=crop',
    fileType: 'PDF',
    tags: ['mono', 'grid', 'brutalist'],
    createdAt: '2026-05-15T09:15:00Z'
  },
  {
    id: 'dsn-4',
    designerId: 'dsg-1',
    designerName: 'Karan Singh',
    title: 'Sacred Mandala Burst',
    description: 'Neon saffron and cobalt circular fractal symmetries designed for optimal screen alignment.',
    fileUrl: 'https://images.unsplash.com/photo-1502691876148-a84978e59fa8?q=80&w=600&auto=format&fit=crop',
    fileType: 'PNG',
    tags: ['neon', 'fractal', 'mandala'],
    createdAt: '2026-05-20T10:00:00Z'
  }
];

// Pre-seeded Retail Products listed by Designers mapped onto categories
export let products: Product[] = [
  {
    id: 'prd-1',
    designId: 'dsn-1',
    designerId: 'dsg-1',
    designerName: 'Karan Singh',
    slug: 'psychedelic-sound-sweatshirt',
    title: 'Psychedelic Sound Oversized Sweatshirt',
    description: 'An premium heavy-cotton blend relaxed fit streetwear sweatshirt featuring the high-contrast Soundscape print.',
    productType: 'hoodie',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop', // Hoodie placeholder
    baseCostINR: 750,
    designerPriceINR: 1149, // Designer profit = ₹1,149. Retails for ₹1,899 (base + profit)
    active: true,
    featured: true,
    totalSold: 42,
    createdAt: '2026-05-11T10:00:00Z'
  },
  {
    id: 'prd-2',
    designId: 'dsn-2',
    designerId: 'dsg-2',
    designerName: 'Anusha Rao',
    slug: 'matches-boxy-tee',
    title: 'Nataraj Vintage Matchbox Boxy T-Shirt',
    description: 'Drop-shoulder heavy-rib unisex boxy tee carrying Anushas signature block matchbox pattern printed securely in Mumbai.',
    productType: 'tshirt',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop', // Tshirt placeholder
    baseCostINR: 350,
    designerPriceINR: 649, // Retails for ₹999
    active: true,
    featured: true,
    totalSold: 89,
    createdAt: '2026-05-13T10:00:00Z'
  },
  {
    id: 'prd-3',
    designId: 'dsn-3',
    designerId: 'dsg-3',
    slug: 'brutalist-blueprint-tote',
    designerName: 'Siddharth Roy',
    title: 'Brutalist Grid Heavy Canvas Tote',
    description: 'Thick canvas bag with double-stitched durability, raw metal ring attachments, carrying Siddharths monochrome architectural grid.',
    productType: 'tote',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop', // Tote placeholder
    baseCostINR: 190,
    designerPriceINR: 309, // Retails for ₹499
    active: true,
    featured: true,
    totalSold: 124,
    createdAt: '2026-05-16T10:00:00Z'
  },
  {
    id: 'prd-4',
    designId: 'dsn-4',
    designerId: 'dsg-1',
    designerName: 'Karan Singh',
    slug: 'neon-mandala-hoodie',
    title: 'Sacred Mandala Heavy Winter Hoodie',
    description: 'Fleece-lined winter hoodie featuring the neon-saffron mandala graphic centered cleanly using eco-friendly DTG printheads.',
    productType: 'hoodie',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop', // Dark Hoodie placeholder
    baseCostINR: 850,
    designerPriceINR: 1349, // Retails for ₹2,199
    active: true,
    featured: false,
    totalSold: 19,
    createdAt: '2026-05-21T10:00:00Z'
  },
  {
    id: 'prd-5',
    designId: 'dsn-2',
    designerId: 'dsg-2',
    designerName: 'Anusha Rao',
    slug: 'vintage-patra-poster',
    title: 'Vintage Indian Chai Patra Heavy Poster',
    description: '300GSM matte retro paper stock poster. Ideal for adding a warm traditional block-print visual style into modern workspaces.',
    productType: 'poster',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop', // Frame poster placeholder
    baseCostINR: 120,
    designerPriceINR: 279, // Retails for ₹399
    active: true,
    featured: false,
    totalSold: 67,
    createdAt: '2026-05-14T10:00:00Z'
  }
];

// Pre-seeded Active and Fulfilled Orders
export let orders: Order[] = [
  {
    id: 'ord-101',
    consumerId: 'usr-6',
    consumerName: 'Mayank Bisht',
    consumerEmail: 'mayankbisht1107@gmail.com',
    status: 'DELIVERED',
    items: [
      {
        id: 'itm-1',
        productId: 'prd-2',
        productTitle: 'Nataraj Vintage Matchbox Boxy T-Shirt',
        productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
        designerName: 'Anusha Rao',
        quantity: 1,
        priceINR: 999,
        size: 'L',
        color: '#F5F0E8',
        manufacturerId: 'mfr-2'
      }
    ],
    shippingAddress: {
      line1: 'Flat 402, Shiv Shanti Kunj, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      phone: '+91 98765 43210'
    },
    subtotalINR: 999,
    shippingINR: 80,
    totalINR: 1079,
    paymentMethod: 'razorpay',
    paymentId: 'pay_RZP100918',
    trackingNumber: 'DEL-INV-990812',
    courierName: 'Delhivery',
    createdAt: '2026-05-25T11:20:00Z'
  },
  {
    id: 'ord-102',
    consumerId: 'usr-6',
    consumerName: 'Mayank Bisht',
    consumerEmail: 'mayankbisht1107@gmail.com',
    status: 'MATCHED_TO_MANUFACTURER',
    items: [
      {
        id: 'itm-2',
        productId: 'prd-1',
        productTitle: 'Psychedelic Sound Oversized Sweatshirt',
        productImage: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
        designerName: 'Karan Singh',
        quantity: 1,
        priceINR: 1899,
        size: 'M',
        color: '#0D0D0D',
        manufacturerId: 'mfr-1'
      }
    ],
    shippingAddress: {
      line1: 'B-12, Sector 58',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
      phone: '+91 99999 88888'
    },
    subtotalINR: 1899,
    shippingINR: 120,
    totalINR: 2019,
    paymentMethod: 'razorpay',
    paymentId: 'pay_RZP900223',
    createdAt: '2026-06-02T16:45:00Z'
  }
];

// matching algorithm corresponding to Section 5I
export function matchManufacturerForProduct(productType: string): string {
  // Find capabilities matching product type
  const sortedMatches = capabilities
    .filter(cap => cap.active && cap.productTypes.includes(productType))
    .sort((a, b) => {
      // Find respective manufacturers
      const mfrA = manufacturers.find(m => m.id === a.manufacturerId);
      const mfrB = manufacturers.find(m => m.id === b.manufacturerId);
      
      const ratingA = mfrA?.avgRating || 0;
      const ratingB = mfrB?.avgRating || 0;

      // Choose based on lowest turnaround days, then highest rating
      if (a.turnaroundDays !== b.turnaroundDays) {
        return a.turnaroundDays - b.turnaroundDays;
      }
      return ratingB - ratingA;
    });

  if (sortedMatches.length > 0) {
    return sortedMatches[0].manufacturerId;
  }

  // Fallback
  return 'mfr-1';
}

// Add a new product dynamically
export function createProduct(productData: Omit<Product, 'id' | 'totalSold' | 'createdAt'>): Product {
  const newProduct: Product = {
    ...productData,
    id: `prd-${products.length + 1}`,
    totalSold: 0,
    createdAt: new Date().toISOString()
  };
  products.unshift(newProduct);
  return newProduct;
}

// Add a new design dynamically
export function createDesign(designData: Omit<Design, 'id' | 'createdAt'>): Design {
  const newDesign: Design = {
    ...designData,
    id: `dsn-${designs.length + 1}`,
    createdAt: new Date().toISOString()
  };
  designs.unshift(newDesign);
  return newDesign;
}

// Update capability
export function updateCapabilityCost(id: string, newCost: number) {
  const cap = capabilities.find(c => c.id === id);
  if (cap) {
    cap.baseCostINR = newCost;
  }
}

// Place a new customer order
export function createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Order {
  const idValue = `ord-${100 + orders.length + 1}`;
  
  // Assign best manufacturer to each item in order
  const updatedItems = orderData.items.map(item => {
    // Find the original product to extract productType
    const matchedProduct = products.find(p => p.id === item.productId);
    const assignedMfr = matchManufacturerForProduct(matchedProduct?.productType || 'tshirt');
    return {
      ...item,
      manufacturerId: assignedMfr
    };
  });

  const newOrder: Order = {
    ...orderData,
    id: idValue,
    items: updatedItems,
    status: 'PAYMENT_CONFIRMED', // Immediately verified since it's a sandbox
    createdAt: new Date().toISOString()
  };

  // Auto-allocate status transition "MATCHED_TO_MANUFACTURER" after 3 seconds for showcase
  orders.unshift(newOrder);

  // Add stats to products sold
  newOrder.items.forEach(itm => {
    const prod = products.find(p => p.id === itm.productId);
    if (prod) {
      prod.totalSold += itm.quantity;
    }
  });

  return newOrder;
}

// Update order status (for manufacturer flow)
export function updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string, courierName?: string): Order | undefined {
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (courierName) order.courierName = courierName;
    return order;
  }
  return undefined;
}
