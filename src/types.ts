/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_CONFIRMED'
  | 'MATCHED_TO_MANUFACTURER'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
export type AccountStatus = 'ACTIVE' | 'PAUSED' | 'BLOCKED';
export type DesignWorkflowStatus =
  | 'SUBMITTED'
  | 'ADMIN_APPROVED'
  | 'BIDDING_OPEN'
  | 'SHORTLISTED'
  | 'HELD'
  | 'SAMPLE_IN_PROGRESS'
  | 'SAMPLE_REJECTED'
  | 'SAMPLE_APPROVED'
  | 'LIVE'
  | 'PAUSED'
  | 'BLOCKED'
  | 'REJECTED';
export type BidStatus = 'ACTIVE' | 'SHORTLISTED' | 'HELD' | 'REJECTED' | 'WINNING' | 'LOST';
export type SampleStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  locale: string; // "en-IN" default for Indian, "en-US" etc for global
}

export interface Consumer {
  id: string;
  userId: string;
  phone?: string;
  pincode?: string;
  city?: string;
  state?: string;
  address?: string;
}

export interface Designer {
  id: string;
  userId: string;
  username: string;
  bio?: string;
  city?: string;
  country: string; // "IN" or other
  portfolioUrl?: string;
  gstNumber?: string;
  verified: boolean;
  bankIFSC?: string;
  bankAccount?: string;
}

export interface Manufacturer {
  id: string;
  userId: string;
  businessName: string;
  city: string;
  state: string;
  country: string;
  gstNumber?: string;
  verified: boolean;
  avgRating: number;
  totalFulfilled: number;
  maxCapacity: number; // e.g. 100 designs per week
}

export interface ManufacturerPaymentProfile {
  userId: string;
  businessName: string;
  preferredPayoutMethod: 'upi' | 'bank_transfer';
  accountHolderName?: string;
  upiId?: string;
  bankName?: string;
  bankAccount?: string;
  bankIFSC?: string;
  updatedAt: string;
}

export interface Capability {
  id: string;
  manufacturerId: string;
  printType: string; // "DTG" | "Screen" | "Embroidery" | "Sublimation"
  materials: string[]; // ["cotton", "polyester", "canvas"]
  productTypes: string[]; // ["tshirt", "hoodie", "tote", "phone_case", "poster"]
  minOrderQty: number;
  turnaroundDays: number;
  baseCostINR: number;
  active: boolean;
}

export interface Design {
  id: string;
  designerId: string;
  designerName: string;
  title: string;
  description?: string;
  fileUrl: string; // Mock or actual Cloudinary URL
  fileType: string; // "PNG" | "SVG" | "PDF"
  tags: string[];
  preferredProductType?: 'tshirt' | 'hoodie' | 'tote' | 'poster' | 'phone_case';
  workflowStatus: DesignWorkflowStatus;
  moderationStatus: AccountStatus;
  adminReviewedBy?: string;
  adminReviewedAt?: string;
  adminNotes?: string;
  winningBidId?: string;
  winningManufacturerId?: string;
  liveProductId?: string;
  currentRound: number;
  createdAt: string;
}

export interface Product {
  id: string;
  designId: string;
  designerId: string;
  designerName: string;
  manufacturerId?: string;
  slug: string;
  title: string;
  description?: string;
  productType: 'tshirt' | 'hoodie' | 'tote' | 'poster' | 'phone_case';
  image: string; // primary display mock
  baseCostINR: number;
  designerPriceINR: number;
  active: boolean;
  featured: boolean;
  totalSold: number;
  createdAt: string;
}

export interface DesignBid {
  id: string;
  designId: string;
  manufacturerId: string;
  manufacturerName: string;
  bidAmountINR: number;
  turnAroundDays: number;
  status: BidStatus;
  sampleStatus: SampleStatus | null;
  sampleImageUrl?: string;
  sampleNotes?: string;
  heldReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignSample {
  id: string;
  designId: string;
  bidId: string;
  manufacturerId: string;
  designerId: string;
  status: SampleStatus;
  sampleCostSplit?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ModerationRecord {
  userId: string;
  role: UserRole;
  status: AccountStatus;
  reason?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface Notification {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  category: 'DESIGN_REJECTED' | 'DESIGN_APPROVED' | 'SYSTEM';
  link?: string;
  readAt?: string;
  createdAt: string;
}

export interface Variant {
  id: string;
  productId: string;
  size: string; // "S" | "M" | "L" | "XL"
  color: string; // HEX color or color name
  sku: string;
  stock: number; // -1 = POD unlimited
  priceINR: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  designerName: string;
  quantity: number;
  priceINR: number;
  size?: string;
  color?: string;
  manufacturerId?: string; // matched manufacturer
}

export interface Order {
  id: string;
  consumerId: string;
  consumerName: string;
  consumerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  subtotalINR: number;
  shippingINR: number;
  totalINR: number;
  paymentMethod: 'upi' | 'bank_transfer';
  paymentId?: string;
  trackingNumber?: string;
  courierName?: string;
  createdAt: string;
}

export interface DesignerEarning {
  id: string;
  designerId: string;
  orderId: string;
  amountINR: number;
  payoutStatus: PayoutStatus;
}

export interface ManufacturerEarning {
  id: string;
  manufacturerId: string;
  orderId: string;
  amountINR: number;
  payoutStatus: PayoutStatus;
}
