/**
 * In-memory store for products, designs, orders, capabilities.
 * Products and designs are created by designers via the upload flow.
 * Orders are created by consumers at checkout.
 */
import { User, Designer, Manufacturer, Capability, Design, Product, Order, OrderStatus } from './src/types.js';

// ── In-memory stores (start empty — populated at runtime) ──────────────────
export let designs: Design[]       = [];
export let products: Product[]     = [];
export let orders: Order[]         = [];
export let capabilities: Capability[] = [];
export let manufacturers: Manufacturer[] = [];

// ── Manufacturer matching ───────────────────────────────────────────────────
export function matchManufacturerForProduct(productType: string): string {
  const match = capabilities.find(
    cap => cap.active && cap.productTypes.includes(productType)
  );
  return match?.manufacturerId ?? 'mfr-unassigned';
}

// ── Create helpers ──────────────────────────────────────────────────────────
export function createProduct(
  data: Omit<Product, 'id' | 'totalSold' | 'createdAt'>
): Product {
  const product: Product = {
    ...data,
    id: `prd-${Date.now()}`,
    totalSold: 0,
    createdAt: new Date().toISOString(),
  };
  products.unshift(product);
  return product;
}

export function createDesign(
  data: Omit<Design, 'id' | 'createdAt'>
): Design {
  const design: Design = {
    ...data,
    id: `dsn-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  designs.unshift(design);
  return design;
}

export function updateCapabilityCost(id: string, newCost: number): void {
  const cap = capabilities.find(c => c.id === id);
  if (cap) cap.baseCostINR = newCost;
}

export function createOrder(
  data: Omit<Order, 'id' | 'createdAt'>
): Order {
  const order: Order = {
    ...data,
    id: `ord-${Date.now()}`,
    status: 'PAYMENT_CONFIRMED',
    items: data.items.map(item => ({
      ...item,
      manufacturerId: matchManufacturerForProduct(
        products.find(p => p.id === item.productId)?.productType ?? 'tshirt'
      ),
    })),
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  // Increment totalSold
  order.items.forEach(item => {
    const p = products.find(p => p.id === item.productId);
    if (p) p.totalSold += item.quantity;
  });
  return order;
}

export function updateOrderStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string,
  courierName?: string
): Order | undefined {
  const order = orders.find(o => o.id === id);
  if (!order) return undefined;
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courierName) order.courierName = courierName;
  return order;
}
