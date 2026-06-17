import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const isShopActive = window.location.pathname.startsWith('/shop') || window.location.pathname.startsWith('/product');
  const { setMobileMenuOpen } = useContext(AppContext);
  return (
    <nav className="w-full sticky top-0 z-50 bg-[#fff8f5]/90 backdrop-blur-md border-b border-[#e6beb2]">
      <div className="flex items-center justify-between px-4 md:px-12 h-16 md:h-20 max-w-[1200px] mx-auto">
        {/* Logo */}
        <button
          onClick={() => rNavigate('/')}
          className="flex items-center shrink-0"
          aria-label="OffGrid home"
        >
          <img
            src="/offgrid-logo.jpeg"
            alt="OFFGRID"
            className="h-10 w-auto object-contain md:h-12 lg:h-14"
            loading="eager"
          />
        </button>

        {/* Desktop Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => rNavigate('/shop')}
            className={`text-[18px] font-normal transition-colors ${isShopActive ? 'text-[#aa3000] border-b-2 border-[#aa3000] pb-1' : 'text-[#5c4037] hover:text-[#aa3000]'}`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Shop
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={onSearchClick} className="grid h-10 w-10 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Search">
            <Icon name="search" size={24} />
          </button>
          <button onClick={onCartClick} className="relative grid h-10 w-10 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Cart">
            <Icon name="shopping_cart" size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#aa3000] text-white text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={onAuthClick} className="grid h-10 w-10 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Account">
            <Icon name="person" size={24} />
          </button>
        </div>

        {/* Mobile Actions: Cart + Hamburger */}
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
    </nav>
  );
};
