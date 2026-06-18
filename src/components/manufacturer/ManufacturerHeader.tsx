import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Icon } from '../shared/UI';

export const ManufacturerHeader = () => {
  const rNavigate = useNavigate();
  const { setMobileMenuOpen } = useContext(AppContext);
  return (
    <header className="flex justify-between items-center w-full px-4 md:px-12 h-20 border-b border-[#e6beb2] bg-transparent">
      <div className="flex items-center gap-10">
        <button
          onClick={() => rNavigate('/')}
          className="font-bold tracking-tighter text-[#aa3000] text-[28px] leading-none md:hidden"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          OFFGRID
        </button>
        <div className="hidden lg:flex items-center gap-6">
          {[['Dashboard', '/dashboard'], ['Marketplace', '/shop']].map(([l, pg]) => (
            <button key={l} onClick={() => rNavigate(pg)} className="text-[14px] font-semibold text-[#5c4037] hover:text-[#aa3000] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 bg-white border border-[#e6beb2] text-[#5c4037] px-6 py-2 text-[14px] font-semibold rounded-lg shadow-sm hover:bg-[#fff8f5] active:scale-95 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Icon name="support_agent" size={18} className="text-[#5c4037]" /> Contact Support
        </button>
        <Icon name="notifications" size={24} className="text-[#5c4037] cursor-pointer hover:text-[#aa3000]" />
        <Icon name="account_circle" size={24} className="text-[#5c4037] cursor-pointer hover:text-[#aa3000]" />
        <button onClick={() => setMobileMenuOpen(true)} className="grid md:hidden h-9 w-9 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Menu">
          <Icon name="menu" size={24} />
        </button>
      </div>
    </header>
  );
};
