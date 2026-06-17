import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem, toPath } from '../../context/AppContext';
import { Icon } from './UI';

export const CartDrawer = ({
  items,
  onClose,
  onRemove,
  onQtyChange,
}: {
  items: CartItem[];
  onClose: () => void;
  onRemove: (idx: number) => void;
  onQtyChange: (idx: number, delta: number) => void;
}) => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => { rNavigate(toPath(p)); onClose(); };
  const subtotal = items.reduce((acc, i) => acc + parseFloat(i.price.replace('$', '').replace('₹', '')) * i.qty, 0);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90] bg-[#241910]/40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md z-[95] bg-[#fff8f5] border-l border-[#e6beb2] flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-[#e6beb2]">
          <span className="text-[20px] font-bold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>Your Cart {items.length > 0 && <span className="text-[#aa3000]">({items.length})</span>}</span>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center text-[#5c4037] hover:text-[#aa3000] transition-colors" aria-label="Close cart">
            <Icon name="close" size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <Icon name="shopping_bag" size={48} className="text-[#e6beb2]" />
              <p className="text-[16px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Your cart is empty</p>
              <button
                onClick={() => { navigate('/shop'); }}
                className="bg-[#aa3000] text-white px-8 py-3 text-[14px] font-semibold uppercase tracking-wider hover:bg-[#d43f00] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Browse Shop
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex gap-4 bg-white border border-[#e6beb2] p-4 rounded">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded overflow-hidden shrink-0" style={{ background: item.gradient }} />
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#241910] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{item.name}</p>
                  <p className="text-[14px] font-bold text-[#aa3000] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{item.price}</p>
                  {/* Qty */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onQtyChange(idx, -1)}
                      className="w-7 h-7 border border-[#e6beb2] flex items-center justify-center hover:border-[#aa3000] hover:text-[#aa3000] transition-colors text-[18px] leading-none"
                    >−</button>
                    <span className="text-[14px] font-semibold w-6 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>{item.qty}</span>
                    <button
                      onClick={() => onQtyChange(idx, 1)}
                      className="w-7 h-7 border border-[#e6beb2] flex items-center justify-center hover:border-[#aa3000] hover:text-[#aa3000] transition-colors text-[18px] leading-none"
                    >+</button>
                  </div>
                </div>
                {/* Remove */}
                <button onClick={() => onRemove(idx)} className="shrink-0 text-[#5c4037] hover:text-[#ba1a1a] transition-colors mt-1" aria-label="Remove">
                  <Icon name="delete" size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[#e6beb2] px-6 py-6 space-y-4 bg-[#fff1e8]">
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Subtotal</span>
              <span className="text-[18px] font-bold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[12px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Shipping & taxes calculated at checkout.</p>
            <button
              className="w-full bg-[#aa3000] text-white py-4 text-[14px] font-semibold uppercase tracking-widest hover:bg-[#d43f00] transition-colors"
              style={{ boxShadow: '4px 4px 0px 0px #3a0b00', fontFamily: 'Inter, sans-serif' }}
            >
              Checkout
            </button>
            <button
              onClick={() => { navigate('/shop'); }}
              className="w-full py-3 border border-[#e6beb2] text-[#5c4037] text-[14px] font-semibold uppercase hover:bg-[#f4dfcf] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};
