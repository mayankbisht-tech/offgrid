import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Outlet } from 'react-router-dom';
import { AuthUser } from '../hooks/useAuth';
import {
  AppContext,
  AppCtx,
  CartItem,
  readAuthUser,
  writeAuthStorage,
  clearAuthStorage,
} from '../context/AppContext';

import { TopNav } from './shared/TopNav';
import { CartDrawer } from './shared/CartDrawer';
import { AuthModal } from './shared/AuthModal';
import { SearchOverlay } from './shared/SearchOverlay';
import { Icon } from './shared/UI';

import { HomePage } from './user/HomePage';
import { ShopPage } from './user/ShopPage';
import { ProductPage } from './user/ProductPage';
import { CheckoutPage } from './user/CheckoutPage';
import { PaymentPlaceholderPage } from './user/PaymentPlaceholderPage';
import { PaymentPage } from './user/PaymentPage';

import { DashboardPage } from './designer/DashboardPage';
import { StudioPublishWizard } from './designer/StudioPublishWizard';
import { CreatorPage } from './designer/CreatorPage';
import { AdminDashboard } from './admin/AdminDashboard';

export function LogoutPage() {
  useEffect(() => {
    clearAuthStorage();
  }, []);
  return <Navigate to="/" replace />;
}

export default function RootLayout() {
  const rNavigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => readAuthUser());

  const handleLogin = (u: AuthUser) => {
    setUser(u);
    writeAuthStorage(u);
  };

  const handleLogout = () => {
    setUser(null);
    clearAuthStorage();
    setAuthOpen(false);
    setCartOpen(false);
    setSearchOpen(false);
    setMobileMenuOpen(false);
    window.location.assign('/');
  };

  const addToCart = (item: Omit<CartItem, 'qty'>) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i.name === item.name);
      if (existing >= 0) {
        return prev.map((i, idx) => idx === existing ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const removeCartItem = (idx: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const changeCartQty = (idx: number, delta: number) => {
    setCartItems(prev =>
      prev
        .map((item, i) => i === idx ? { ...item, qty: item.qty + delta } : item)
        .filter(item => item.qty > 0)
    );
  };

  useEffect(() => {
    const syncUser = () => setUser(readAuthUser());
    window.addEventListener('storage', syncUser);
    window.addEventListener('offgrid-auth-change', syncUser as EventListener);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('offgrid-auth-change', syncUser as EventListener);
    };
  }, []);

  const isConsumerPage = !window.location.pathname.startsWith('/studio') && !window.location.pathname.startsWith('/dashboard');

  const ctx: AppCtx = {
    user, cartItems, cartOpen, authOpen, searchOpen, mobileMenuOpen, setMobileMenuOpen,
    setCartOpen, setAuthOpen, setSearchOpen,
    handleLogin, handleLogout,
    addToCart, clearCart, removeCartItem, changeCartQty,
  };

  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .animate-\\[ticker_30s_linear_infinite\\] {
            animation: ticker 30s linear infinite;
          }
          input[type='range'] {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
          }
          /* Webkit browsers */
          input[type='range']::-webkit-slider-runnable-track {
            height: 6px;
            background: #f4dfcf;
            border-radius: 3px;
          }
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: #aa3000;
            border: 3px solid #ffffff;
            box-shadow: 0px 4px 10px rgba(170, 48, 0, 0.4);
            border-radius: 50%;
            margin-top: -6px; /* centers the thumb on track */
            cursor: pointer;
            transition: transform 0.1s ease;
          }
          input[type='range']::-webkit-slider-thumb:hover {
            transform: scale(1.15);
          }
          /* Mozilla browsers */
          input[type='range']::-moz-range-track {
            height: 6px;
            background: #f4dfcf;
            border-radius: 3px;
          }
          input[type='range']::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #aa3000;
            border: 3px solid #ffffff;
            box-shadow: 0px 4px 10px rgba(170, 48, 0, 0.4);
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.1s ease;
          }
          input[type='range']::-moz-range-thumb:hover {
            transform: scale(1.15);
          }
        `}</style>

        {isConsumerPage && (
          <TopNav
            cartCount={cartItems.reduce((s, i) => s + i.qty, 0)}
            onCartClick={() => setCartOpen(true)}
            onAuthClick={() => user ? rNavigate('/dashboard') : setAuthOpen(true)}
            onSearchClick={() => setSearchOpen(true)}
          />
        )}

        {/* All page components are rendered here by react-router */}
        <Outlet context={ctx} />

        {/* Overlays */}
        {cartOpen && (
          <CartDrawer
            items={cartItems}
            onClose={() => setCartOpen(false)}
            onRemove={removeCartItem}
            onQtyChange={changeCartQty}
          />
        )}
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={handleLogin} />}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden" onClick={() => setMobileMenuOpen(false)}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            {/* Sidebar Panel */}
            <div
              className="absolute top-0 right-0 h-full w-72 bg-[#fff8f5] shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
              style={{ animation: 'slideInRight 0.25s ease-out' }}
            >
              {/* Close Button */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-[#e6beb2]">
                <img src="/offgrid-logo.jpeg" alt="OFFGRID" className="h-9 w-auto object-contain" />
                <button onClick={() => setMobileMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors">
                  <Icon name="close" size={22} />
                </button>
              </div>
              {/* Nav Links */}
              <nav className="flex-1 flex flex-col gap-1 px-4 py-6">
                {[
                  { icon: 'home', label: 'Home', path: '/' },
                  { icon: 'storefront', label: 'Shop', path: '/shop' },
                  { icon: 'dashboard', label: 'Creator Dashboard', path: '/dashboard' },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { rNavigate(item.path); setMobileMenuOpen(false); }}
                    className="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold text-[#241910] rounded-lg hover:bg-[#ffeadb] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Icon name={item.icon} size={20} className="text-[#aa3000]" /> {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
                  className="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold text-[#241910] rounded-lg hover:bg-[#ffeadb] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Icon name="search" size={20} className="text-[#aa3000]" /> Search
                </button>
              </nav>
              {/* Bottom Actions */}
              <div className="border-t border-[#e6beb2] px-4 py-4 flex flex-col gap-1">
                {user ? (
                  <button
                    onClick={() => { setMobileMenuOpen(false); rNavigate('/logout'); }}
                    className="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold text-[#5c4037] rounded-lg hover:text-[#ba1a1a] hover:bg-[#ffeadb] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Icon name="logout" size={20} /> Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}
                    className="flex items-center gap-4 px-4 py-3 text-[15px] font-semibold text-[#5c4037] rounded-lg hover:text-[#aa3000] hover:bg-[#ffeadb] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Icon name="login" size={20} /> Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}

export {
  AppContext,
  HomePage,
  ShopPage,
  ProductPage,
  DashboardPage,
  StudioPublishWizard,
  CreatorPage,
  AdminDashboard,
  CheckoutPage,
  PaymentPlaceholderPage,
  PaymentPage,
};
