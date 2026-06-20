import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

type NavItem = {
  label: string;
  path: string;
  active: (pathname: string) => boolean;
};

export const SignedInNav = ({ topNavVisible = true }: { topNavVisible?: boolean }) => {
  const { user } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const items: NavItem[] = [
    {
      label: 'Home',
      path: '/',
      active: (pathname) => pathname === '/',
    },
    {
      label: 'Marketplace',
      path: '/shop',
      active: (pathname) => pathname.startsWith('/shop') || pathname.startsWith('/product') || pathname.startsWith('/creator'),
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      active: (pathname) => pathname.startsWith('/dashboard'),
    },
  ];

  if (user.role === 'ADMIN') {
    items.push({
      label: 'Admin',
      path: '/admin',
      active: (pathname) => pathname.startsWith('/admin'),
    });
  }

  return (
    <div className={`fixed ${topNavVisible ? 'bottom-4 md:bottom-6' : 'bottom-4 md:bottom-6'} left-1/2 z-50 w-[calc(100vw-1rem)] max-w-[500px] -translate-x-1/2 pointer-events-none`}>
      <div className="rounded-[1.75rem] border border-[#e6beb2] bg-[#fff8f5] p-1.5 shadow-[0_14px_32px_rgba(92,64,55,0.14)]">
        <div className="pointer-events-auto flex items-center justify-center">
          <div className="inline-flex w-full items-center justify-center gap-1 rounded-[1.4rem] bg-[#fff1e8] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            {items.map((item) => {
              const isActive = item.active(location.pathname);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`min-w-0 flex-1 rounded-full px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-all md:px-4 md:py-2.5 md:text-[11px] ${
                    isActive
                      ? 'bg-[#aa3000] text-white shadow-[0_6px_14px_rgba(170,48,0,0.24)]'
                      : 'text-[#5c4037] hover:bg-[#ffeadb] hover:text-[#aa3000]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
