import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon, GradientImg, GRADIENTS } from '../shared/UI';
import { Footer } from '../shared/Footer';
import { FadeUp, HoverLift, MagneticButton } from '../../animations/text animations/Animations';
import { SkeletonCard } from '../shared/Skeleton';

const getProductTags = (p: any): string[] => {
  if (p.tags && Array.isArray(p.tags)) return p.tags;
  const tags: string[] = [];
  const title = (p.title || '').toLowerCase();
  if (title.includes('minimal') || title.includes('essential')) tags.push('Minimalist');
  if (title.includes('cyber') || title.includes('samurai') || title.includes('neon')) tags.push('Cyberpunk');
  if (title.includes('retro') || title.includes('sunset') || title.includes('vintage')) tags.push('Retro');
  if (title.includes('abstract') || title.includes('decay') || title.includes('distort')) tags.push('Abstract');
  if (title.includes('brutal') || title.includes('tectonic') || title.includes('struct')) tags.push('Brutalist');

  if (tags.length === 0) {
    const hash = (p.id || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const styles = ['Minimalist', 'Cyberpunk', 'Retro', 'Abstract', 'Brutalist'];
    tags.push(styles[hash % styles.length]);
    tags.push(styles[(hash + 2) % styles.length]);
  }
  return tags;
};

/* â”€â”€ Command Palette (Ctrl+K) â”€â”€ */
const CommandPalette = ({ products, open, onClose, onNavigate }: { products: any[]; open: boolean; onClose: () => void; onNavigate: (path: string) => void }) => {
  const [query, setQuery] = useState('');
  const results = React.useMemo(() => {
    if (!query.trim()) return products.slice(0, 6);
    const q = query.toLowerCase();
    return products.filter((p: any) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.designerName || '').toLowerCase().includes(q) ||
      (p.productType || '').toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, products]);

  useEffect(() => {
    if (open) { setQuery(''); }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            className="relative w-full max-w-lg mx-4 bg-[#F7F3EF] rounded-xl shadow-2xl overflow-hidden border"
            style={{ borderColor: 'rgba(109,15,49,0.15)' }}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(109,15,49,0.15)' }}>
              <Icon name="search" size={22} className="text-[#950606]" />
              <input
                autoFocus
                className="flex-1 bg-transparent text-[16px] text-[#1A1A1A] placeholder-[#5C5C5C] outline-none"
                placeholder="Search designs, creators, collections..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
              <kbd className="px-2 py-1 text-[10px] font-bold uppercase bg-[#F1E7DE] text-[#5C5C5C] rounded border" style={{ borderColor: 'rgba(109,15,49,0.15)' }}>ESC</kbd>
            </div>
            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[14px] text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif' }}>No results found for "{query}"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((p: any) => (
                    <button
                      key={p.id}
                      className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[#F1E7DE] transition-colors text-left cursor-pointer"
                      onClick={() => { onNavigate(`/product/${p.id}`); onClose(); }}
                    >
                      <div className="w-12 h-12 rounded bg-[#F1E7DE] overflow-hidden shrink-0">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <GradientImg gradient={GRADIENTS.tee} className="h-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1A1A1A] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{p.title}</p>
                        <p className="text-[11px] text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif' }}>by {p.designerName} Â· {p.productType}</p>
                      </div>
                      <span className="text-[14px] font-bold text-[#950606]" style={{ fontFamily: 'Inter, sans-serif' }}>â‚¹{(p.baseCostINR + p.designerPriceINR).toLocaleString('en-IN')}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Footer hint */}
            <div className="p-3 border-t flex items-center justify-between" style={{ borderColor: 'rgba(109,15,49,0.15)' }}>
              <span className="text-[10px] text-[#5C5C5C] font-bold uppercase flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                Powered by <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span> Search
              </span>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-[9px] bg-[#F1E7DE] rounded text-[#5C5C5C] border" style={{ borderColor: 'rgba(109,15,49,0.15)' }}>â†‘â†“</kbd>
                <span className="text-[9px] text-[#5C5C5C]">Navigate</span>
                <kbd className="px-1.5 py-0.5 text-[9px] bg-[#F1E7DE] rounded text-[#5C5C5C] border" style={{ borderColor: 'rgba(109,15,49,0.15)' }}>â†µ</kbd>
                <span className="text-[9px] text-[#5C5C5C]">Open</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ShopPage = () => {
  const rNavigate = useNavigate();
  const location = useLocation();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { addToCart } = useContext(AppContext);
  const onAddToCart = addToCart;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);

  // Command palette
  const [cmdOpen, setCmdOpen] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (!category) {
      setSelectedCategory('All');
      return;
    }

    const validCategories = ['All', 'T-Shirts', 'Hoodies', 'Accessories', 'Art Prints', 'Collectibles'];
    if (validCategories.includes(category)) {
      setSelectedCategory(category);
    }
  }, [location.search]);

  useEffect(() => {
    apiJson<any[]>('/api/catalog')
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => {
        apiJson<any[]>('/api/products')
          .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  // Reactive filtering logic
  const filteredProducts = React.useMemo(() => {
    return products.filter((p: any) => {
      if (selectedCategory !== 'All') {
        const type = (p.productType || '').toLowerCase();
        if (selectedCategory === 'T-Shirts') {
          if (type !== 'tshirt' && type !== 'tee') return false;
        } else if (selectedCategory === 'Hoodies') {
          if (type !== 'hoodie') return false;
        } else if (selectedCategory === 'Accessories') {
          if (type !== 'accessory' && type !== 'tote' && type !== 'phone_case') return false;
        } else if (selectedCategory === 'Art Prints') {
          if (type !== 'print' && type !== 'poster') return false;
        } else if (selectedCategory === 'Collectibles') {
          if (type !== 'collectible') return false;
        }
      }

      const priceVal = p.baseCostINR + p.designerPriceINR;
      if (selectedPrices.length > 0) {
        const matchesPrice = selectedPrices.some(range => {
          if (range === 'â‚¹0 - â‚¹1999') return priceVal <= 1999;
          if (range === 'â‚¹2000-â‚¹3500') return priceVal > 2000 && priceVal <= 3500;
          if (range === 'â‚¹3501-â‚¹5000') return priceVal > 3501 && priceVal <= 5000;
          if (range === 'â‚¹5000+') return priceVal > 5000;
          return true;
        });
        if (!matchesPrice) return false;
      }

      if (selectedStyles.length > 0) {
        const productTags = getProductTags(p);
        const matchesStyle = selectedStyles.some(style => productTags.includes(style));
        if (!matchesStyle) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedPrices, selectedStyles]);

  return (
    <div className="min-h-screen bg-[#F7F3EF]">
      <main className="max-w-[1200px] mx-auto px-4 md:px-12 py-10">
        <div className="flex flex-col gap-5">
          {/* Header */}
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-10 gap-4" style={{ borderColor: 'rgba(109,15,49,0.15)' }}>
              <div className="flex items-baseline gap-6 pl-6" style={{ borderLeft: '4px solid #C6FF00' }}>
                <h1 className="text-[32px] md:text-[48px] font-bold text-[#1A1A1A]" style={{ ...syne, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Browse All Art</h1>
                <p className="text-[14px] text-[#5C5C5C]" style={font}>{filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-3 self-start md:self-auto">
                {/* Filter Button */}
                <MagneticButton
                  onClick={() => setFiltersOpen(true)}
                  className="flex items-center gap-2 bg-white border px-6 py-3 text-[14px] font-bold uppercase tracking-wider rounded-lg text-[#950606] hover:bg-[#F1E7DE] transition-all cursor-pointer"
                  style={{ ...font, borderColor: 'rgba(109,15,49,0.15)', boxShadow: '4px 4px 0px 0px #950606' }}
                >
                  <Icon name="tune" size={20} />
                  Filters
                </MagneticButton>
              </div>
            </div>
          </FadeUp>

          {/* Product Masonry Grid */}
          <div className="flex-1">
            {loading && (
              <div className="columns-2 md:columns-4 gap-4 md:gap-5 space-y-4 md:space-y-5">
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} className="break-inside-avoid" />)}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <FadeUp>
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border rounded-lg bg-white p-12" style={{ borderColor: 'rgba(109,15,49,0.15)' }}>
                  <Icon name="palette" size={48} className="text-[#950606]/20" />
                  <p className="text-[18px] font-semibold text-[#1A1A1A]" style={syne}>No designs match these filters</p>
                  <p className="text-[14px] text-[#5C5C5C]" style={font}>Try clearing some filters to explore more streetwear designs.</p>
                </div>
              </FadeUp>
            )}

            {!loading && filteredProducts.length > 0 && (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-5 space-y-4 md:space-y-5">
                {filteredProducts.map((p: any, idx: number) => {
                  const price = `â‚¹${(p.baseCostINR + p.designerPriceINR).toLocaleString('en-IN')}`;
                  // Vary card heights for masonry effect
                  const aspects = ['aspect-[3/4]', 'aspect-[2/3]', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-square'];
                  const aspect = aspects[idx % aspects.length];
                  return (
                    <HoverLift key={p.id} className="break-inside-avoid" glowColor="rgba(109,15,49,0.12)">
                      <div
                        className="group bg-white border rounded-lg overflow-hidden transition-all duration-300"
                        style={{ borderColor: 'rgba(109,15,49,0.12)' }}
                      >
                        <div className={`relative overflow-hidden bg-[#F1E7DE] cursor-pointer ${aspect}`} onClick={() => navigate(`/product/${p.id}`)}>
                          {p.image
                            ? <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            : <GradientImg gradient={GRADIENTS.tee} className="h-full" />
                          }
                          {p.featured && <span className="absolute top-2 right-2 bg-[#C6FF00] text-[#3D5A00] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" style={font}>Featured</span>}
                          {/* Quick Add overlay */}
                          <div
                            className="absolute inset-x-0 bottom-0 py-2.5 text-white text-[11px] font-bold uppercase tracking-wider text-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            style={{ background: 'linear-gradient(135deg, #950606, #950606)' }}
                            onClick={e => { e.stopPropagation(); onAddToCart({ name: p.title, price, gradient: GRADIENTS.tee }); }}
                          >
                            + Quick Add
                          </div>
                        </div>
                        <div className="p-3 md:p-4">
                          <p className="text-[11px] text-[#5C5C5C] mb-1 truncate" style={font}>by {p.designerName}</p>
                          <h4 className="text-[14px] md:text-[15px] font-semibold text-[#1A1A1A] mb-1 cursor-pointer hover:text-[#950606] transition-colors truncate" style={{ ...syne, lineHeight: 1.3 }} onClick={() => navigate(`/product/${p.id}`)}>{p.title}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-[15px] font-bold text-[#950606]" style={font}>{price}</span>
                            <button onClick={() => onAddToCart({ name: p.title, price, gradient: GRADIENTS.tee })} className="text-[#5C5C5C] hover:text-[#950606] transition-colors" aria-label="Add to cart">
                              <Icon name="shopping_bag" size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </HoverLift>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* â”€â”€ Animated Filter Drawer â”€â”€ */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFiltersOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              className="absolute top-0 right-0 h-full w-80 md:w-96 bg-[#F7F3EF] shadow-2xl flex flex-col p-6 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: 'rgba(109,15,49,0.15)' }}>
                <h3 className="text-[20px] font-bold text-[#950606]" style={syne}>Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="grid h-9 w-9 place-items-center rounded-full text-[#950606] hover:bg-[#F1E7DE] transition-colors">
                  <Icon name="close" size={22} />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#5C5C5C] mb-4" style={font}>Categories</h3>
                <ul className="space-y-1.5">
                  {['All', 'T-Shirts', 'Hoodies', 'Accessories', 'Art Prints', 'Collectibles'].map(c => {
                    const isActive = selectedCategory === c;
                    return (
                      <li key={c}>
                        <button
                          onClick={() => setSelectedCategory(c)}
                          className={`w-full flex items-center justify-between text-[14px] font-semibold py-2.5 px-4 rounded-lg transition-all ${isActive ? 'text-white shadow-sm' : 'hover:bg-[#F1E7DE] text-[#5C5C5C]'}`}
                          style={{ ...font, ...(isActive ? { background: 'linear-gradient(135deg, #950606, #950606)' } : {}) }}
                        >
                          {c}
                          <Icon name={isActive ? 'check' : 'chevron_right'} size={16} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Filter by Price */}
              <div className="mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#5C5C5C] mb-4" style={font}>Filter by Price</h3>
                <div className="space-y-3">
                  {['â‚¹0 - â‚¹1999', 'â‚¹2000-â‚¹3500', 'â‚¹3501-â‚¹5000', 'â‚¹5000+'].map(l => {
                    const checked = selectedPrices.includes(l);
                    return (
                      <label key={l} className="flex items-center gap-4 group cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedPrices(prev =>
                              prev.includes(l) ? prev.filter(p => p !== l) : [...prev, l]
                            );
                          }}
                          className="w-4 h-4 rounded-sm text-[#950606] focus:ring-[#950606] accent-[#950606]"
                          style={{ borderColor: 'rgba(109,15,49,0.15)' }}
                        />
                        <span className={`text-[14px] ${checked ? 'text-[#950606] font-bold' : 'text-[#1A1A1A] group-hover:text-[#950606]'} transition-colors`} style={font}>{l}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filter by Style */}
              <div className="mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#5C5C5C] mb-4" style={font}>Filter by Style</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Minimalist', bg: '#C6FF00', fg: '#3D5A00' },
                    { name: 'Cyberpunk', bg: '#fff', fg: '#1A1A1A' },
                    { name: 'Retro', bg: '#fff', fg: '#1A1A1A' },
                    { name: 'Abstract', bg: '#950606', fg: '#fff' },
                    { name: 'Brutalist', bg: '#fff', fg: '#1A1A1A' }
                  ].map(s => {
                    const active = selectedStyles.includes(s.name);
                    return (
                      <button
                        key={s.name}
                        onClick={() => {
                          setSelectedStyles(prev =>
                            prev.includes(s.name) ? prev.filter(st => st !== s.name) : [...prev, s.name]
                          );
                        }}
                        className="px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all hover:bg-[#950606] hover:text-white cursor-pointer"
                        style={{
                          background: active ? s.bg : '#fff',
                          color: active ? s.fg : '#1A1A1A',
                          borderColor: active ? '#950606' : 'rgba(109,15,49,0.15)',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="mt-auto pt-6 border-t flex gap-3" style={{ borderColor: 'rgba(109,15,49,0.15)' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedPrices([]);
                    setSelectedStyles([]);
                  }}
                  className="flex-1 py-3 border rounded-lg text-[13px] font-bold uppercase hover:bg-[#F1E7DE] text-[#5C5C5C] transition-colors cursor-pointer"
                  style={{ ...font, borderColor: 'rgba(109,15,49,0.15)' }}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 py-3 text-white text-[13px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  style={{ ...font, background: 'linear-gradient(135deg, #950606, #950606)' }}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <CommandPalette products={products} open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={navigate} />
    </div>
  );
};
