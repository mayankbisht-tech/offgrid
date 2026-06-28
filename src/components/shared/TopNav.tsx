import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Icon } from './UI';

export const TopNav = ({
  cartCount,
  onCartClick,
  onAuthClick,
  onSearchClick,
}: {
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onSearchClick: () => void;
}) => {
  const rNavigate = useNavigate();
  const location = useLocation();
  const { setMobileMenuOpen } = useContext(AppContext);

  const categoryLinks = [
    { label: 'All', path: '/shop' },
    { label: 'T-Shirts', path: '/shop?category=T-Shirts' },
    { label: 'Hoodies', path: '/shop?category=Hoodies' },
    { label: 'Accessories', path: '/shop?category=Accessories' },
    { label: 'Art Prints', path: '/shop?category=Art%20Prints' },
    { label: 'Collectibles', path: '/shop?category=Collectibles' },
  ];


  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/shop')) return location.pathname.startsWith('/shop') || location.pathname.startsWith('/product');
    if (path.startsWith('/dashboard')) return location.pathname.startsWith('/dashboard');
    return location.pathname === path;
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-[#F7F3EF]/95 backdrop-blur-md border-b border-[rgba(149,6,6,0.15)] shadow-[0_2px_18px_rgba(92,64,55,0.04)]">
      <div className="h-1 bg-[#950606]" />
      <div className="mx-auto max-w-[1440px] px-4 md:px-12 flex items-stretch gap-6 md:gap-8">

        {/* Left Column: ReOG Brand Logo spanning the full height (both rows) on desktop */}
        <button
          onClick={() => rNavigate('/')}
          className="flex flex-col justify-center items-start select-none leading-none tracking-tight shrink-0 py-3 md:py-4"
          aria-label="ReOG home"
        >
          <div className="text-[28px] md:text-[48px] flex items-baseline leading-none" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 }}>
            <span className="text-[#1A1A1A]">Re</span>
            <span className="text-[#950606] relative">
              OG<span className="absolute text-[8px] top-1 right-[-9px] font-sans font-normal uppercase">TM</span>
            </span>
          </div>
          <span className="text-[7.5px] md:text-[9.5px] font-sans tracking-[0.18em] text-[#5C5C5C] uppercase mt-1 whitespace-nowrap">
            REBIRTH OF THE ORIGINAL GENERATION
          </span>
        </button>

        {/* Right Column: Two stacked rows on desktop */}
        <div className="flex-1 flex flex-col justify-between py-1 md:py-2">

          {/* Top Row: Right side icons on desktop */}
          <div className="hidden md:flex justify-end items-center h-10 gap-2">
            <button onClick={onSearchClick} className="grid h-9 w-9 place-items-center rounded-full text-[#1A1A1A] hover:bg-[#F1E7DE] transition-colors" aria-label="Search">
              <Icon name="search" size={20} />
            </button>
            <button onClick={onCartClick} className="relative grid h-9 w-9 place-items-center rounded-full text-[#1A1A1A] hover:bg-[#F1E7DE] transition-colors" aria-label="Cart">
              <Icon name="shopping_cart" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#950606] text-white text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={onAuthClick} className="grid h-9 w-9 place-items-center rounded-full text-[#1A1A1A] hover:bg-[#F1E7DE] transition-colors" aria-label="Profile">
              <Icon name="person" size={20} />
            </button>
          </div>

          {/* Mobile Right Icons (Unchanged) */}
          <div className="flex md:hidden h-full items-center justify-end gap-2">
            <button onClick={onCartClick} className="relative grid h-9 w-9 place-items-center rounded-full text-[#950606] hover:bg-[#F1E7DE] transition-colors" aria-label="Cart">
              <Icon name="shopping_cart" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#950606] text-white text-[8px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="grid h-9 w-9 place-items-center rounded-full text-[#950606] hover:bg-[#F1E7DE] transition-colors" aria-label="Menu">
              <Icon name="menu" size={24} />
            </button>
          </div>

          {/* Bottom Row: Category Links in the middle, Search Bar on the right */}
          <div className="hidden md:flex items-center justify-between gap-2 border-t border-[rgba(149,6,6,0.08)] pt-2 mt-1">
            <div className="pl-5 flex flex-wrap items-center gap-1">
              {categoryLinks.map((item) => {
                const active = location.pathname.startsWith('/shop') && (item.path === '/shop' ? location.search === '' : location.search.includes(`category=${encodeURIComponent(item.label)}`));
                return (
                  <button
                    key={item.label}
                    onClick={() => rNavigate(item.path)}
                    className={`rounded-full px-2 py-0.5 font-semibold uppercase tracking-[0.10em] transition-all ${active
                      ? 'bg-[#950606] text-white'
                      : 'text-[#5C5C5C] hover:bg-[#F1E7DE] hover:text-[#950606]'
                      }`}
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onSearchClick}
              className="flex w-[260px] items-center gap-3 rounded-full border border-[rgba(149,6,6,0.15)] bg-white px-4 py-1.5 text-left text-[#5C5C5C] transition-all hover:border-[#950606] hover:shadow-[0_8px_24px_rgba(149,6,6,0.08)]"
              aria-label="Search"
            >
              <Icon name="search" size={16} className="text-[#950606]" />
              <span className="text-[11px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Search products, creators, drops...
              </span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};
