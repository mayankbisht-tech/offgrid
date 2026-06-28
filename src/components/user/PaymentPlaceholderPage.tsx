import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toPath } from '../../context/AppContext';
import { TopNav } from '../shared/TopNav';
import { Footer } from '../shared/Footer';

export const PaymentPlaceholderPage = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));

  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  return (
    <div className="flex flex-col min-h-screen text-[#1A1A1A]" style={{ backgroundColor: '#F7F3EF' }}>
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-20 flex flex-col items-center justify-center text-center">
        {/* Placeholder SVG */}
        <div className="mb-10 w-full max-w-[300px] text-[#950606]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-auto">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
            <path d="M12 12l8.5-5" strokeDasharray="2 2" />
            <circle cx="12" cy="12" r="2" fill="#950606" />
          </svg>
        </div>

        <h1 className="text-[32px] md:text-[48px] font-bold text-[#1A1A1A] mb-4 leading-tight" style={syne}>UPI & Bank Transfer Integration<br /><span className="text-[#950606]">Coming Soon</span></h1>
        <p className="text-[18px] text-[#5C5C5C] mb-10 max-w-md" style={font}>We are currently building our secure payment infrastructure for UPI and Indian bank transfers. Please check back later.</p>

        <div className="flex gap-4">
          <button onClick={() => navigate('/shop')} className="px-8 py-3 bg-[#950606] text-white text-[14px] font-semibold uppercase tracking-wider rounded hover:bg-[#950606] transition-colors shadow-sm" style={font}>Return to Shop</button>
          <button onClick={() => navigate('/dashboard')} className="px-8 py-3 border border-[rgba(109,15,49,0.15)] text-[#5C5C5C] bg-white text-[14px] font-semibold uppercase tracking-wider rounded hover:bg-[#E8DFD6] transition-colors" style={font}>Go to Dashboard</button>
        </div>
      </main>
      <Footer />
    </div>
  );
};
