/**
 * In-memory store for products, designs, orders, capabilities and workflow records.
 * Products are created only after sample approval.
 * Orders are created by consumers at checkout.
 */
import {
  User,
  Designer,
  Manufacturer,
  Capability,
  Design,
  Product,
  Order,
  OrderStatus,
  ManufacturerPaymentProfile,
  DesignBid,
  DesignSample,
  ModerationRecord,
  AccountStatus,
  BidStatus,
  SampleStatus,
} from './src/types.js';

export let designs: Design[] = [];
export let products: Product[] = [];
export let orders: Order[] = [];
export let capabilities: Capability[] = [];
export let manufacturers: Manufacturer[] = [];
export let manufacturerPaymentProfiles: Record<string, ManufacturerPaymentProfile> = {};
export let designBids: DesignBid[] = [];
export let designSamples: DesignSample[] = [];
export let moderationRecords: Record<string, ModerationRecord> = {};

export function getModerationStatus(userId: string): AccountStatus {
  return moderationRecords[userId]?.status ?? 'ACTIVE';
}

export function setModerationStatus(record: Omit<ModerationRecord, 'updatedAt'>): ModerationRecord {
  const next: ModerationRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  };
  moderationRecords[record.userId] = next;
  return next;
}

export function matchManufacturerForProduct(productType: string): string {
  const match = capabilities.find((cap) => cap.active && cap.productTypes.includes(productType));
  return match?.manufacturerId ?? 'mfr-unassigned';
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function createProduct(
  data: Omit<Product, 'id' | 'totalSold' | 'createdAt'>
): Product {
  const product: Product = {
    ...data,
    id: `prd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
    workflowStatus: data.workflowStatus ?? 'SUBMITTED',
    moderationStatus: data.moderationStatus ?? 'ACTIVE',
    currentRound: data.currentRound ?? 0,
    id: `dsn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  designs.unshift(design);
  return design;
}

export function createDesignBid(
  data: Omit<DesignBid, 'id' | 'status' | 'sampleStatus' | 'createdAt' | 'updatedAt'> & {
    status?: BidStatus;
    sampleStatus?: SampleStatus | null;
  }
): DesignBid {
  const bid: DesignBid = {
    ...data,
    id: `bid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: data.status ?? 'ACTIVE',
    sampleStatus: data.sampleStatus ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  designBids.unshift(bid);
  return bid;
}

export function createDesignSample(data: Omit<DesignSample, 'id' | 'createdAt' | 'updatedAt'>): DesignSample {
  const sample: DesignSample = {
    ...data,
    id: `smp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  designSamples.unshift(sample);
  return sample;
}

export function recalculateBidStatuses(designId: string): DesignBid[] {
  const bids = designBids
    .filter((bid) => bid.designId === designId)
    .sort((a, b) => a.bidAmountINR - b.bidAmountINR || a.createdAt.localeCompare(b.createdAt));

  bids.forEach((bid, index) => {
    bid.status = index < 3 ? 'SHORTLISTED' : 'HELD';
    bid.heldReason = index < 3 ? undefined : 'Waiting on shortlist promotion';
    bid.updatedAt = new Date().toISOString();
  });

  const design = designs.find((item) => item.id === designId);
  if (design) {
    design.workflowStatus = bids.length > 0 ? 'SHORTLISTED' : 'BIDDING_OPEN';
    design.currentRound = Math.max(design.currentRound ?? 0, 1);
  }

  return designBids.filter((bid) => bid.designId === designId);
}

export function promoteNextHeldBid(designId: string): DesignBid | undefined {
  const ordered = designBids
    .filter((bid) => bid.designId === designId)
    .sort((a, b) => a.bidAmountINR - b.bidAmountINR || a.createdAt.localeCompare(b.createdAt));

  const currentShortlisted = ordered.filter((bid) => bid.status === 'SHORTLISTED');
  const nextHeld = ordered.find((bid) => bid.status === 'HELD');
  if (!nextHeld) return undefined;

  if (currentShortlisted.length >= 3) {
    const toDemote = currentShortlisted[currentShortlisted.length - 1];
    if (toDemote) {
      toDemote.status = 'HELD';
      toDemote.heldReason = 'Replaced by next held bidder after sample rejection';
      toDemote.updatedAt = new Date().toISOString();
    }
  }

  nextHeld.status = 'SHORTLISTED';
  nextHeld.heldReason = undefined;
  nextHeld.updatedAt = new Date().toISOString();

  const design = designs.find((item) => item.id === designId);
  if (design) {
    design.workflowStatus = 'SHORTLISTED';
  }
  return nextHeld;
}

export function attachWinningSample(designId: string, bidId: string, sampleId: string, manufacturerId: string) {
  const design = designs.find((item) => item.id === designId);
  const bid = designBids.find((item) => item.id === bidId);
  if (design) {
    design.winningBidId = bidId;
    design.winningManufacturerId = manufacturerId;
    design.liveProductId = undefined;
    design.workflowStatus = 'SAMPLE_APPROVED';
    design.currentRound = Math.max(design.currentRound ?? 0, 1);
  }
  if (bid) {
    bid.status = 'WINNING';
    bid.sampleStatus = 'APPROVED';
    bid.updatedAt = new Date().toISOString();
  }
  const sample = designSamples.find((item) => item.id === sampleId);
  if (sample) {
    sample.status = 'APPROVED';
    sample.reviewedAt = new Date().toISOString();
    sample.updatedAt = sample.reviewedAt;
  }
}

export function createLiveProductFromDesign(designId: string, bidId: string): Product | undefined {
  const design = designs.find((item) => item.id === designId);
  const bid = designBids.find((item) => item.id === bidId);
  if (!design || !bid) return undefined;

  const title = design.title;
  const slug = slugify(title);
  const product = createProduct({
    designId: design.id,
    designerId: design.designerId,
    designerName: design.designerName,
    manufacturerId: bid.manufacturerId,
    slug,
    title,
    description: design.description,
    productType: design.preferredProductType || 'hoodie',
    image: design.fileUrl,
    baseCostINR: bid.bidAmountINR,
    designerPriceINR: Math.max(Math.round(bid.bidAmountINR * 0.25), 1),
    active: true,
    featured: false,
  });
  design.liveProductId = product.id;
  design.workflowStatus = 'LIVE';
  return product;
}

export function updateCapabilityCost(id: string, newCost: number): void {
  const cap = capabilities.find((c) => c.id === id);
  if (cap) cap.baseCostINR = newCost;
}

export function createOrder(
  data: Omit<Order, 'id' | 'createdAt'>
): Order {
  const order: Order = {
    ...data,
    id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    status: 'PAYMENT_CONFIRMED',
    items: data.items.map((item) => ({
      ...item,
      manufacturerId: matchManufacturerForProduct(
        products.find((p) => p.id === item.productId)?.productType ?? 'tshirt'
      ),
    })),
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  order.items.forEach((item) => {
    const p = products.find((prod) => prod.id === item.productId);
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
  const order = orders.find((o) => o.id === id);
  if (!order) return undefined;
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courierName) order.courierName = courierName;
  return order;
}

export function upsertManufacturerPaymentProfile(profile: ManufacturerPaymentProfile): ManufacturerPaymentProfile {
  manufacturerPaymentProfiles[profile.userId] = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  return manufacturerPaymentProfiles[profile.userId];
}
