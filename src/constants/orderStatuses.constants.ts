/** All possible order lifecycle states. */
export const ORDER_STATUSES = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  MATCHED_TO_MANUFACTURER: 'MATCHED_TO_MANUFACTURER',
  IN_PRODUCTION: 'IN_PRODUCTION',
  QUALITY_CHECK: 'QUALITY_CHECK',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

/** Human-readable labels for order statuses */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  PAYMENT_CONFIRMED: 'Payment Confirmed',
  MATCHED_TO_MANUFACTURER: 'Matched to Manufacturer',
  IN_PRODUCTION: 'In Production',
  QUALITY_CHECK: 'Quality Check',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

/** Terminal statuses — no further transitions allowed */
export const TERMINAL_STATUSES: OrderStatus[] = ['DELIVERED', 'CANCELLED'];

/** Valid next states map */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAYMENT_CONFIRMED', 'CANCELLED'],
  PAYMENT_CONFIRMED: ['MATCHED_TO_MANUFACTURER', 'CANCELLED'],
  MATCHED_TO_MANUFACTURER: ['IN_PRODUCTION', 'CANCELLED'],
  IN_PRODUCTION: ['QUALITY_CHECK'],
  QUALITY_CHECK: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};
