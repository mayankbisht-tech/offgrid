import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiJson } from '../../lib/api';
import { toPath } from '../../context/AppContext';
import { Icon } from './UI';

export const SearchOverlay = ({ onClose }: { onClose: () => void }) => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => { rNavigate(toPath(p)); onClose(); };
  const [query, setQuery] = useState('');
  const [allProducts, setAll] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    apiJson<any[]>('/api/products').then(d => setAll(Array.isArray(d) ? d : [])).catch(() => { });
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const suggestions = allProducts
    .filter(p => query.length > 1 && (p.title?.toLowerCase().includes(query.toLowerCase()) || p.designerName?.toLowerCase().includes(query.toLowerCase())))
    .slice(0, 6);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-[#1A1A1A]/50 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-2xl bg-[#F7F3EF] border border-[rgba(109,15,49,0.15)] shadow-[8px_8px_0px_0px_#950606]">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[rgba(109,15,49,0.15)]">
          <Icon name="search" size={22} className="text-[#5C5C5C]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, creators, dropsâ€¦"
            className="flex-1 bg-transparent text-[16px] text-[#1A1A1A] placeholder-[#8A7A72] focus:outline-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
            onKeyDown={e => { if (e.key === 'Enter') { navigate('shop'); onClose(); } }}
          />
          <button onClick={onClose} className="text-[#5C5C5C] hover:text-[#950606] transition-colors" aria-label="Close search">
            <Icon name="close" size={20} />
          </button>
        </div>
        {suggestions.length > 0 ? (
          <ul className="py-2">
            {suggestions.map((p: any) => (
              <li key={p.id}>
                <button
                  onClick={() => { navigate('shop'); onClose(); }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-[14px] text-[#1A1A1A] hover:bg-[#F1E7DE] transition-colors text-left"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Icon name="arrow_forward" size={16} className="text-[#950606]" />
                  <span className="flex-1 truncate">{p.title}</span>
                  <span className="text-[12px] text-[#5C5C5C] shrink-0">â‚¹{(p.baseCostINR + p.designerPriceINR).toLocaleString('en-IN')}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : query.length > 1 ? (
          <div className="px-5 py-6 text-[14px] text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif' }}>No results for "{query}"</div>
        ) : (
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase text-[#5C5C5C] tracking-widest mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {['Hoodie', 'Art Print', 'Streetwear', 'Limited Drop', 'Cyberpunk'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); }}
                  className="px-3 py-1 bg-[#F1E7DE] text-[#950606] text-[12px] font-semibold rounded-full hover:bg-[#950606] hover:text-white transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
