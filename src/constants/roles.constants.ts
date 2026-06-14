export const USER_ROLES = {
  CONSUMER: 'CONSUMER',
  DESIGNER: 'DESIGNER',
  MANUFACTURER: 'MANUFACTURER',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  CONSUMER: 'Shopper',
  DESIGNER: 'Designer',
  MANUFACTURER: 'Manufacturer',
  ADMIN: 'Admin',
};
