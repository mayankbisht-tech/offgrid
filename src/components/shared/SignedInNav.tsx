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
      <div className="rounded-[1.75rem] border border-[rgba(109,15,49,0.15)] bg-[#F7F3EF] p-1.5 shadow-[0_14px_32px_rgba(92,64,55,0.14)]">
        <div className="pointer-events-auto flex items-center justify-center">
          <div className="inline-flex w-full items-center justify-center gap-1 rounded-[1.4rem] bg-[#F1E7DE] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            {items.map((item) => {
              const isActive = item.active(location.pathname);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`min-w-0 flex-auto rounded-full px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all md:px-5 md:py-2.5 md:text-[11px] ${isActive
                      ? 'bg-[#950606] text-white shadow-[0_6px_14px_rgba(170,48,0,0.24)]'
                      : 'text-[#5C5C5C] hover:bg-[#F1E7DE] hover:text-[#950606]'
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
