import React from 'react';

export const Footer = () => (
  <footer className="w-full mt-16 bg-[#F1E7DE] border-t border-[rgba(109,15,49,0.15)]">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 px-4 md:px-12 py-10 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-[24px]" style={{ fontFamily: 'Syne, sans-serif' }}>
          <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span>
        </h2>
        <p className="text-[14px] text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif' }}>Defining the visual language of the digital underground. Independent, community-driven, and forward-focused.</p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-[#1A1A1A] mb-2 uppercase text-[14px] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Shop</h4>
        {['New Arrivals', 'All Products', 'Collaborations', 'Digital Wearables'].map(l => (
          <a key={l} href="#" className="text-[14px] text-[#5C5C5C] hover:text-[#950606] underline underline-offset-4 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</a>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-[#1A1A1A] mb-2 uppercase text-[14px] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Company</h4>
        {['About Us', 'Creators Program', 'Sitemap', 'Newsletter'].map(l => (
          <a key={l} href="#" className="text-[14px] text-[#5C5C5C] hover:text-[#950606] underline underline-offset-4 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</a>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-[#1A1A1A] mb-2 uppercase text-[14px] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Connect</h4>
        {['Instagram', 'TikTok', 'Twitter', 'Discord'].map(l => (
          <a key={l} href="#" className="text-[14px] text-[#5C5C5C] hover:text-[#950606] underline underline-offset-4 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</a>
        ))}
      </div>
    </div>
    <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-4 border-t border-[rgba(109,15,49,0.15)] flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-[14px] text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif' }}>
        © 2024 <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span> Marketplace. All rights reserved.
      </p>
      <div className="flex gap-6">
        <a href="#" className="text-[10px] text-[#5C5C5C] hover:text-[#950606] transition-all uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Privacy Policy</a>
        <a href="#" className="text-[10px] text-[#5C5C5C] hover:text-[#950606] transition-all uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Terms of Service</a>
      </div>
    </div>
  </footer>
);
