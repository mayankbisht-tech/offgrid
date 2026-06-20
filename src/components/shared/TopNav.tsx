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

  const mainLinks = [
    { label: 'Women', path: '/shop?segment=Women' },
    { label: 'Men', path: '/shop?segment=Men' },
    { label: 'Kids', path: '/shop?segment=Kids' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/shop')) return location.pathname.startsWith('/shop') || location.pathname.startsWith('/product');
    if (path.startsWith('/dashboard')) return location.pathname.startsWith('/dashboard');
    return location.pathname === path;
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-[#fff8f5]/95 backdrop-blur-md border-b border-[#e6beb2] shadow-[0_2px_18px_rgba(92,64,55,0.04)]">
      <div className="h-1 bg-[#aa3000]" />
      <div className="mx-auto max-w-[1440px] px-4 md:px-12">
        <div className="flex h-12 items-center justify-between gap-4 md:h-12">
          <div className="hidden md:flex items-center gap-6 min-w-0">
            {mainLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.label}
                  onClick={() => rNavigate(item.path)}
                  className={`text-[13px] lg:text-[14px] font-semibold tracking-tight transition-colors whitespace-nowrap ${active ? 'text-[#aa3000]' : 'text-[#5c4037] hover:text-[#aa3000]'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => rNavigate('/')}
            className="flex items-center justify-center shrink-0"
            aria-label="OffGrid home"
          >
            <img
              src="/offgrid-logo.jpeg"
              alt="OFFGRID"
              className="h-8 w-auto object-contain md:h-9 lg:h-10"
              loading="eager"
            />
          </button>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={onSearchClick} className="grid h-9 w-9 place-items-center rounded-full text-[#241910] hover:bg-[#ffeadb] transition-colors" aria-label="Search">
              <Icon name="search" size={20} />
            </button>
            <button onClick={onCartClick} className="relative grid h-9 w-9 place-items-center rounded-full text-[#241910] hover:bg-[#ffeadb] transition-colors" aria-label="Cart">
              <Icon name="shopping_cart" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#aa3000] text-white text-[10px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={onAuthClick} className="grid h-9 w-9 place-items-center rounded-full text-[#241910] hover:bg-[#ffeadb] transition-colors" aria-label="Profile">
              <Icon name="person" size={20} />
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button onClick={onCartClick} className="relative grid h-9 w-9 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Cart">
              <Icon name="shopping_cart" size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#aa3000] text-white text-[8px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="grid h-9 w-9 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Menu">
              <Icon name="menu" size={24} />
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-between gap-3 border-t border-[#e6beb2] py-3">
          <div className="flex flex-wrap items-center gap-1 lg:gap-1">
            {categoryLinks.map((item) => {
              const active = location.pathname.startsWith('/shop') && (item.path === '/shop' ? location.search === '' : location.search.includes(`category=${encodeURIComponent(item.label)}`));
              return (
                <button
  key={item.label}
  onClick={() => rNavigate(item.path)}
  /* Removed text-[4px] and lg:text-[8px] from className */
  className={`rounded-full px-2 py-1.5 font-semibold uppercase tracking-[0.14em] transition-all ${
    active 
      ? 'bg-[#241910] text-[#fff8f5]' 
      : 'text-[#5c4037] hover:bg-[#ffeadb] hover:text-[#aa3000]'
  }`}
  /* Explicitly setting font sizes in the style tag */
  style={{ 
    fontFamily: 'Inter, sans-serif',
    fontSize: window.innerWidth >= 1024 ? '13px' : '11px' 
  }}
>
  {item.label}
</button>

              );
            })}
          </div>

          <button
            type="button"
            onClick={onSearchClick}
            className="flex w-[280px] items-center gap-3 rounded-full border border-[#e6beb2] bg-white px-4 py-2 text-left text-[#5c4037] transition-all hover:border-[#aa3000] hover:shadow-[0_8px_24px_rgba(170,48,0,0.08)]"
            aria-label="Search"
          >
            <Icon name="search" size={18} className="text-[#aa3000]" />
            <span className="text-[12px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Search products, creators, drops...
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
