import type { OrderStatus } from '../constants/orderStatuses.constants.js';

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
  manufacturerId?: string;
}

export interface ShippingAddress {
  line1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Order {
  id: string;
  consumerId: string;
  consumerName: string;
  consumerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotalINR: number;
  shippingINR: number;
  totalINR: number;
  paymentMethod: 'razorpay' | 'stripe';
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
  payoutStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
}
