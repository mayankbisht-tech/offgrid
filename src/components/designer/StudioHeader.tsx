import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Icon } from '../shared/UI';

export const StudioHeader = () => {
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
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 bg-[#aa3000] text-white px-6 py-2 text-[14px] font-semibold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all" style={{ fontFamily: 'Inter, sans-serif' }} onClick={() => rNavigate('/studio/upload')}>
          <Icon name="upload" size={18} className="text-white" /> Upload Design
        </button>
        <button
          type="button"
          onClick={() => rNavigate('/dashboard#overview')}
          className="grid h-10 w-10 place-items-center rounded-full text-[#5c4037] hover:text-[#aa3000] hover:bg-[#ffeadb] transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Icon name="notifications" size={24} />
        </button>
        <button
          type="button"
          onClick={() => rNavigate('/dashboard#settings')}
          className="grid h-10 w-10 place-items-center rounded-full text-[#5c4037] hover:text-[#aa3000] hover:bg-[#ffeadb] transition-colors"
          aria-label="Profile"
          title="Profile"
        >
          <Icon name="account_circle" size={24} />
        </button>
        <button onClick={() => setMobileMenuOpen(true)} className="grid md:hidden h-9 w-9 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Menu">
          <Icon name="menu" size={24} />
        </button>
      </div>
    </header>
  );
};
