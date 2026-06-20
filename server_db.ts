/**
 * Prisma-backed store for products, designs, orders, bids, samples and workflow records.
 * Capabilities and manufacturers remain in-memory for now.
 */
import { prisma } from './src/lib/prisma.js';
import type {
  Capability,
  Design,
  DesignBid,
  DesignSample,
  Manufacturer,
  ManufacturerPaymentProfile,
  ModerationRecord,
  Notification,
  Order,
  OrderStatus,
  Product,
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
export let notifications: Notification[] = [];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function designFromRow(row: any): Design {
  return {
    ...row,
    tags: Array.isArray(row.tags) ? row.tags : [],
    fileType: row.fileType,
    createdAt: toIso(row.createdAt),
    adminReviewedAt: row.adminReviewedAt ? toIso(row.adminReviewedAt) : undefined,
  };
}

function productFromRow(row: any): Product {
  return {
    ...row,
    createdAt: toIso(row.createdAt),
  };
}

function orderFromRow(row: any): Order {
  return {
    ...row,
    items: Array.isArray(row.items) ? row.items : [],
    shippingAddress: row.shippingAddress ?? { line1: '', city: '', state: '', pincode: '', phone: '' },
    createdAt: toIso(row.createdAt),
  };
}

function bidFromRow(row: any): DesignBid {
  return {
    ...row,
    sampleStatus: row.sampleStatus ?? null,
    sampleImageUrl: row.sampleImageUrl ?? undefined,
    sampleNotes: row.sampleNotes ?? undefined,
    heldReason: row.heldReason ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function sampleFromRow(row: any): DesignSample {
  return {
    ...row,
    sampleCostSplit: row.sampleCostSplit ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    reviewedAt: row.reviewedAt ? toIso(row.reviewedAt) : undefined,
    reviewedBy: row.reviewedBy ?? undefined,
  };
}

function moderationFromRow(row: any): ModerationRecord {
  return {
    ...row,
    updatedAt: toIso(row.updatedAt),
    reason: row.reason ?? undefined,
    updatedBy: row.updatedBy ?? undefined,
  };
}

function notificationFromRow(row: any): Notification {
  return {
    ...row,
    readAt: row.readAt ? toIso(row.readAt) : undefined,
    createdAt: toIso(row.createdAt),
  };
}

export async function reloadStore() {
  const [
    designRows,
    productRows,
    orderRows,
    bidRows,
    sampleRows,
    moderationRows,
    notificationRows,
  ] = await Promise.all([
    prisma.design.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.designBid.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.designSample.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.moderationRecord.findMany({ orderBy: { updatedAt: 'desc' } }),
    prisma.notification.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  designs = designRows.map(designFromRow);
  products = productRows.map(productFromRow);
  orders = orderRows.map(orderFromRow);
  designBids = bidRows.map(bidFromRow);
  designSamples = sampleRows.map(sampleFromRow);
  moderationRecords = Object.fromEntries(moderationRows.map((record) => [record.userId, moderationFromRow(record)]));
  notifications = notificationRows.map(notificationFromRow);
}

export function getModerationStatus(userId: string): AccountStatus {
  return moderationRecords[userId]?.status ?? 'ACTIVE';
}

export async function setModerationStatus(record: Omit<ModerationRecord, 'updatedAt'>): Promise<ModerationRecord> {
  const next = await prisma.moderationRecord.upsert({
    where: { userId: record.userId },
    update: {
      role: record.role,
      status: record.status,
      reason: record.reason,
      updatedBy: record.updatedBy,
      updatedAt: new Date(),
    },
    create: {
      userId: record.userId,
      role: record.role,
      status: record.status,
      reason: record.reason,
      updatedBy: record.updatedBy,
      updatedAt: new Date(),
    },
  });
  moderationRecords[next.userId] = moderationFromRow(next);
  return moderationRecords[next.userId];
}

export async function createNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'readAt'> & { readAt?: string | null }
): Promise<Notification> {
  const notification = await prisma.notification.create({
    data: {
      id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: data.userId,
      role: data.role,
      title: data.title,
      message: data.message,
      category: data.category,
      link: data.link ?? null,
      readAt: data.readAt ? new Date(data.readAt) : null,
    },
  });
  const next = notificationFromRow(notification);
  notifications.unshift(next);
  return next;
}

export function listNotificationsForUser(userId: string): Notification[] {
  return notifications.filter((notification) => notification.userId === userId);
}

export function matchManufacturerForProduct(productType: string): string {
  const match = capabilities.find((cap) => cap.active && cap.productTypes.includes(productType));
  return match?.manufacturerId ?? 'mfr-unassigned';
}

export async function createProduct(
  data: Omit<Product, 'id' | 'totalSold' | 'createdAt'>
): Promise<Product> {
  const product = await prisma.product.create({
    data: {
      id: `prd-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      designId: data.designId,
      designerId: data.designerId,
      designerName: data.designerName,
      manufacturerId: data.manufacturerId ?? null,
      slug: data.slug,
      title: data.title,
      description: data.description ?? null,
      productType: data.productType,
      image: data.image,
      baseCostINR: data.baseCostINR,
      designerPriceINR: data.designerPriceINR,
      active: data.active,
      featured: data.featured,
      totalSold: 0,
      createdAt: new Date(),
    },
  });
  const next = productFromRow(product);
  products.unshift(next);
  return next;
}

export async function updateProduct(
  id: string,
  patch: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<Product | undefined> {
  const existing = products.find((item) => item.id === id);
  if (!existing) return undefined;
  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(patch.designId !== undefined ? { designId: patch.designId } : {}),
      ...(patch.designerId !== undefined ? { designerId: patch.designerId } : {}),
      ...(patch.designerName !== undefined ? { designerName: patch.designerName } : {}),
      ...(patch.manufacturerId !== undefined ? { manufacturerId: patch.manufacturerId } : {}),
      ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.productType !== undefined ? { productType: patch.productType } : {}),
      ...(patch.image !== undefined ? { image: patch.image } : {}),
      ...(patch.baseCostINR !== undefined ? { baseCostINR: patch.baseCostINR } : {}),
      ...(patch.designerPriceINR !== undefined ? { designerPriceINR: patch.designerPriceINR } : {}),
      ...(patch.active !== undefined ? { active: patch.active } : {}),
      ...(patch.featured !== undefined ? { featured: patch.featured } : {}),
      ...(patch.totalSold !== undefined ? { totalSold: patch.totalSold } : {}),
    },
  });
  const next = productFromRow(updated);
  Object.assign(existing, next);
  return existing;
}

export async function createDesign(
  data: Omit<Design, 'id' | 'createdAt'>
): Promise<Design> {
  const design = await prisma.design.create({
    data: {
      id: `dsn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      designerId: data.designerId,
      designerName: data.designerName,
      title: data.title,
      description: data.description ?? null,
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      tags: data.tags,
      preferredProductType: data.preferredProductType ?? null,
      workflowStatus: data.workflowStatus,
      moderationStatus: data.moderationStatus,
      adminReviewedBy: data.adminReviewedBy ?? null,
      adminReviewedAt: data.adminReviewedAt ? new Date(data.adminReviewedAt) : null,
      adminNotes: data.adminNotes ?? null,
      winningBidId: data.winningBidId ?? null,
      winningManufacturerId: data.winningManufacturerId ?? null,
      liveProductId: data.liveProductId ?? null,
      currentRound: data.currentRound ?? 0,
    },
  });
  const next = designFromRow(design);
  designs.unshift(next);
  return next;
}

export async function updateDesign(
  id: string,
  patch: Partial<Omit<Design, 'id' | 'createdAt'>>
): Promise<Design | undefined> {
  const existing = designs.find((item) => item.id === id);
  if (!existing) return undefined;
  const updated = await prisma.design.update({
    where: { id },
    data: {
      ...(patch.description !== undefined ? { description: patch.description } : {}),
      ...(patch.preferredProductType !== undefined ? { preferredProductType: patch.preferredProductType } : {}),
      ...(patch.adminReviewedBy !== undefined ? { adminReviewedBy: patch.adminReviewedBy } : {}),
      ...(patch.adminReviewedAt !== undefined ? { adminReviewedAt: patch.adminReviewedAt ? new Date(patch.adminReviewedAt) : null } : {}),
      ...(patch.adminNotes !== undefined ? { adminNotes: patch.adminNotes } : {}),
      ...(patch.winningBidId !== undefined ? { winningBidId: patch.winningBidId } : {}),
      ...(patch.winningManufacturerId !== undefined ? { winningManufacturerId: patch.winningManufacturerId } : {}),
      ...(patch.liveProductId !== undefined ? { liveProductId: patch.liveProductId } : {}),
      ...(patch.workflowStatus !== undefined ? { workflowStatus: patch.workflowStatus } : {}),
      ...(patch.moderationStatus !== undefined ? { moderationStatus: patch.moderationStatus } : {}),
      ...(patch.currentRound !== undefined ? { currentRound: patch.currentRound } : {}),
    },
  });
  Object.assign(existing, designFromRow(updated));
  return existing;
}

export async function createDesignBid(
  data: Omit<DesignBid, 'id' | 'status' | 'sampleStatus' | 'createdAt' | 'updatedAt'> & {
    status?: BidStatus;
    sampleStatus?: SampleStatus | null;
  }
): Promise<DesignBid> {
  const bid = await prisma.designBid.create({
    data: {
      id: `bid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      designId: data.designId,
      manufacturerId: data.manufacturerId,
      manufacturerName: data.manufacturerName,
      bidAmountINR: data.bidAmountINR,
      turnAroundDays: data.turnAroundDays,
      status: data.status ?? 'ACTIVE',
      sampleStatus: data.sampleStatus ?? null,
      sampleImageUrl: null,
      sampleNotes: null,
      heldReason: null,
    },
  });
  const next = bidFromRow(bid);
  designBids.unshift(next);
  return next;
}

export async function updateDesignBid(
  id: string,
  patch: Partial<Omit<DesignBid, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<DesignBid | undefined> {
  const existing = designBids.find((item) => item.id === id);
  if (!existing) return undefined;
  const updated = await prisma.designBid.update({
    where: { id },
    data: {
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.sampleStatus !== undefined ? { sampleStatus: patch.sampleStatus } : {}),
      ...(patch.sampleImageUrl !== undefined ? { sampleImageUrl: patch.sampleImageUrl } : {}),
      ...(patch.sampleNotes !== undefined ? { sampleNotes: patch.sampleNotes } : {}),
      ...(patch.heldReason !== undefined ? { heldReason: patch.heldReason } : {}),
    },
  });
  Object.assign(existing, bidFromRow(updated));
  return existing;
}

export async function createDesignSample(
  data: Omit<DesignSample, 'id' | 'createdAt' | 'updatedAt'>
): Promise<DesignSample> {
  const sample = await prisma.designSample.create({
    data: {
      id: `smp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      designId: data.designId,
      bidId: data.bidId,
      manufacturerId: data.manufacturerId,
      designerId: data.designerId,
      status: data.status,
      sampleCostSplit: data.sampleCostSplit ?? null,
      imageUrl: data.imageUrl ?? null,
      notes: data.notes ?? null,
    },
  });
  const next = sampleFromRow(sample);
  designSamples.unshift(next);
  return next;
}

export async function updateDesignSample(
  id: string,
  patch: Partial<Omit<DesignSample, 'id' | 'createdAt' | 'updatedAt'>> & {
    reviewedAt?: string | null;
    reviewedBy?: string | null;
  }
): Promise<DesignSample | undefined> {
  const existing = designSamples.find((item) => item.id === id);
  if (!existing) return undefined;
  const updated = await prisma.designSample.update({
    where: { id },
    data: {
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.sampleCostSplit !== undefined ? { sampleCostSplit: patch.sampleCostSplit } : {}),
      ...(patch.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.reviewedAt !== undefined ? { reviewedAt: patch.reviewedAt ? new Date(patch.reviewedAt) : null } : {}),
      ...(patch.reviewedBy !== undefined ? { reviewedBy: patch.reviewedBy } : {}),
    },
  });
  Object.assign(existing, sampleFromRow(updated));
  return existing;
}

export async function recalculateBidStatuses(designId: string): Promise<DesignBid[]> {
  const bids = designBids
    .filter((bid) => bid.designId === designId)
    .sort((a, b) => a.bidAmountINR - b.bidAmountINR || a.createdAt.localeCompare(b.createdAt));

  const updated = await Promise.all(
    bids.map((bid, index) =>
      updateDesignBid(bid.id, {
        status: index < 3 ? 'SHORTLISTED' : 'HELD',
        heldReason: index < 3 ? undefined : 'Waiting on shortlist promotion',
      })
    )
  );

  const design = await updateDesign(designId, {
    workflowStatus: bids.length > 0 ? 'SHORTLISTED' : 'BIDDING_OPEN',
    currentRound: Math.max((designs.find((item) => item.id === designId)?.currentRound ?? 0), 1),
  });
  if (!design) return designBids.filter((bid) => bid.designId === designId);

  return updated.filter(Boolean) as DesignBid[];
}

export async function promoteNextHeldBid(designId: string): Promise<DesignBid | undefined> {
  const ordered = designBids
    .filter((bid) => bid.designId === designId)
    .sort((a, b) => a.bidAmountINR - b.bidAmountINR || a.createdAt.localeCompare(b.createdAt));

  const currentShortlisted = ordered.filter((bid) => bid.status === 'SHORTLISTED');
  const nextHeld = ordered.find((bid) => bid.status === 'HELD');
  if (!nextHeld) return undefined;

  if (currentShortlisted.length >= 3) {
    const toDemote = currentShortlisted[currentShortlisted.length - 1];
    if (toDemote) {
      await updateDesignBid(toDemote.id, {
        status: 'HELD',
        heldReason: 'Replaced by next held bidder after sample rejection',
      });
    }
  }

  await updateDesignBid(nextHeld.id, {
    status: 'SHORTLISTED',
    heldReason: undefined,
  });

  await updateDesign(designId, {
    workflowStatus: 'SHORTLISTED',
  });

  return designBids.find((bid) => bid.id === nextHeld.id);
}

export async function attachWinningSample(designId: string, bidId: string, sampleId: string, manufacturerId: string) {
  const design = designs.find((item) => item.id === designId);
  const bid = designBids.find((item) => item.id === bidId);
  if (design) {
    await updateDesign(designId, {
      winningBidId: bidId,
      winningManufacturerId: manufacturerId,
      liveProductId: undefined,
      workflowStatus: 'SAMPLE_APPROVED',
      currentRound: Math.max(design.currentRound ?? 0, 1),
    });
  }
  if (bid) {
    await updateDesignBid(bidId, {
      status: 'WINNING',
      sampleStatus: 'APPROVED',
    });
  }
  const sample = designSamples.find((item) => item.id === sampleId);
  if (sample) {
    await updateDesignSample(sampleId, {
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin',
    });
  }
}

export async function createLiveProductFromDesign(designId: string, bidId: string): Promise<Product | undefined> {
  const design = designs.find((item) => item.id === designId);
  const bid = designBids.find((item) => item.id === bidId);
  if (!design || !bid) return undefined;

  const product = await createProduct({
    designId: design.id,
    designerId: design.designerId,
    designerName: design.designerName,
    manufacturerId: bid.manufacturerId,
    slug: slugify(design.title),
    title: design.title,
    description: design.description,
    productType: design.preferredProductType || 'hoodie',
    image: design.fileUrl,
    baseCostINR: bid.bidAmountINR,
    designerPriceINR: Math.max(Math.round(bid.bidAmountINR * 0.25), 1),
    active: true,
    featured: false,
  });
  await updateDesign(designId, {
    liveProductId: product.id,
    workflowStatus: 'LIVE',
  });
  return product;
}

export function updateCapabilityCost(id: string, newCost: number): void {
  const cap = capabilities.find((c) => c.id === id);
  if (cap) cap.baseCostINR = newCost;
}

export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt'>
): Promise<Order> {
  const order = await prisma.order.create({
    data: {
      id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      consumerId: data.consumerId,
      consumerName: data.consumerName,
      consumerEmail: data.consumerEmail,
      status: 'PAYMENT_CONFIRMED',
      items: data.items as any,
      shippingAddress: data.shippingAddress as any,
      subtotalINR: data.subtotalINR,
      shippingINR: data.shippingINR,
      totalINR: data.totalINR,
      paymentMethod: data.paymentMethod,
      paymentId: data.paymentId ?? null,
      trackingNumber: data.trackingNumber ?? null,
      courierName: data.courierName ?? null,
    },
  });
  const next = orderFromRow(order);
  orders.unshift(next);
  await Promise.all(
    next.items.map(async (item) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (!p) return;
      p.totalSold += item.quantity;
      await updateProduct(p.id, {
        totalSold: p.totalSold,
      });
    })
  );
  return next;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string,
  courierName?: string
): Promise<Order | undefined> {
  const order = orders.find((o) => o.id === id);
  if (!order) return undefined;
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(trackingNumber !== undefined ? { trackingNumber } : {}),
      ...(courierName !== undefined ? { courierName } : {}),
    },
  });
  Object.assign(order, orderFromRow(updated));
  return order;
}

export async function upsertManufacturerPaymentProfile(profile: ManufacturerPaymentProfile): Promise<ManufacturerPaymentProfile> {
  manufacturerPaymentProfiles[profile.userId] = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  return manufacturerPaymentProfiles[profile.userId];
}
