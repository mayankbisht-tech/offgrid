import { createContext } from 'react';
import { AuthUser } from '../hooks/useAuth';

// ─────────────────────────────────────────────
// Routing helpers — wrap useNavigate into a simple navigate(path) helper
// ─────────────────────────────────────────────
// Page strings map to URL paths
const PAGE_PATHS: Record<string, string> = {
  'home': '/',
  'shop': '/shop',
  'product': '/shop', // default; individual product: /product/:id
  'creator': '/creator',
  'dashboard': '/dashboard',
  'studio-upload': '/studio/upload',
  'studio-pricing': '/studio/pricing',
  'studio-review': '/studio/review',
  'checkout': '/checkout',
  'payment': '/payment',
};

/** Convert a legacy page key OR a direct path string to a router path */
export function toPath(p: string): string {
  return PAGE_PATHS[p] ?? (p.startsWith('/') ? p : `/${p}`);
}

const AUTH_STORAGE_KEYS = ['offgrid_user', 'offgrid_user_role', 'user_role', 'role'] as const;

export function writeAuthStorage(user: AuthUser) {
  try {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.setItem('offgrid_user', JSON.stringify(user));
  } catch {
    // Ignore storage failures and fall back to in-memory state.
  }
  window.dispatchEvent(new Event('offgrid-auth-change'));
}

export function clearAuthStorage() {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // Ignore storage failures and fall back to in-memory state.
  }
  window.dispatchEvent(new Event('offgrid-auth-change'));
}

export function readAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('offgrid_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// App-level Context (cart, auth, overlays)
// ─────────────────────────────────────────────
export interface CartItem { name: string; price: string; gradient: string; qty: number; image?: string; }

export interface AppCtx {
  user: AuthUser | null;
  cartItems: CartItem[];
  cartOpen: boolean;
  authOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  setCartOpen: (v: boolean) => void;
  setAuthOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  handleLogin: (u: AuthUser) => void;
  handleLogout: () => void;
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  clearCart: () => void;
  removeCartItem: (idx: number) => void;
  changeCartQty: (idx: number, delta: number) => void;
}

export const AppContext = createContext<AppCtx>(null as any);

export type AuthMode = 'signin' | 'signup';
export type UserRole = 'consumer' | 'designer' | 'manufacturer' | 'admin';
export type Page = string;
