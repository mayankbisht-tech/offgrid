import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon, GradientImg, GRADIENTS } from '../shared/UI';
import { Footer } from '../shared/Footer';

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
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]); // empty default to show all
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]); // empty default to show all

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
      // 1. Category Filter
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

      // 2. Price Filter (USD equivalent logic mapped to INR priceVal)
      const priceVal = p.baseCostINR + p.designerPriceINR;
      if (selectedPrices.length > 0) {
        const matchesPrice = selectedPrices.some(range => {
          if (range === '₹0 - ₹1999') return priceVal <= 1999;
          if (range === '₹2000-₹3500') return priceVal > 2000 && priceVal <= 3500;
          if (range === '₹3501-₹5000') return priceVal > 3501 && priceVal <= 5000;
          if (range === '₹5000+') return priceVal > 5000;
          return true;
        });
        if (!matchesPrice) return false;
      }

      // 3. Style Filter (tags)
      if (selectedStyles.length > 0) {
        const productTags = getProductTags(p);
        const matchesStyle = selectedStyles.some(style => productTags.includes(style));
        if (!matchesStyle) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedPrices, selectedStyles]);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFF8F5 0%, #FFD0B0 50%, #FFB59E 100%)' }}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-12 py-10">
        <div className="flex flex-col gap-5">
          {/* Header layout with title & toggle button */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#e6beb2] pb-6 mb-10 gap-4">
            <div className="flex items-baseline gap-6 pl-6" style={{ borderLeft: '4px solid #bdf200' }}>
              <h1 className="text-[32px] md:text-[48px] font-bold text-[#241910]" style={{ ...syne, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Browse All Art</h1>
              <p className="text-[14px] text-[#5c4037]" style={font}>{filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 bg-white border border-[#e6beb2] px-6 py-3 text-[14px] font-bold uppercase tracking-wider rounded-lg text-[#aa3000] hover:bg-[#ffeadb] transition-all self-start md:self-auto cursor-pointer"
              style={{ ...font, boxShadow: '4px 4px 0px 0px #aa3000' }}
            >
              <Icon name="tune" size={20} />
              Filters
            </button>
          </div>

          {/* Product grid */}
          <div className="flex-1">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-[#aa3000] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border border-[#e6beb2] rounded-lg bg-white p-12">
                <Icon name="palette" size={48} className="text-[#e6beb2]" />
                <p className="text-[18px] font-semibold text-[#241910]" style={syne}>No designs match these filters</p>
                <p className="text-[14px] text-[#5c4037]" style={font}>Try clearing some filters to explore more streetwear designs.</p>
              </div>
            )}

            {!loading && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {filteredProducts.map((p: any) => {
                  const price = `₹${(p.baseCostINR + p.designerPriceINR).toLocaleString('en-IN')}`;
                  return (
                    <div key={p.id}
                      className="group bg-white border border-[#e6beb2] rounded p-2 md:p-4 transition-all duration-300"
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0px 0px #aa3000'; (e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px,-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
                    >
                      <div className="relative overflow-hidden mb-4 bg-[#ffeadb] cursor-pointer" style={{ aspectRatio: '3/4' }} onClick={() => navigate(`/product/${p.id}`)}>
                        {p.image
                          ? <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          : <GradientImg gradient={GRADIENTS.tee} className="h-full" />
                        }
                        {p.featured && <span className="absolute top-2 right-2 bg-[#bdf200] text-[#526b00] text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={font}>Featured</span>}
                        <div className="absolute inset-x-0 bottom-0 bg-[#aa3000] py-2 text-white text-[11px] font-bold uppercase tracking-wider text-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={e => { e.stopPropagation(); onAddToCart({ name: p.title, price, gradient: GRADIENTS.tee }); }}>
                          + Quick Add
                        </div>
                      </div>
                      <p className="text-[11px] text-[#5c4037] mb-1 truncate" style={font}>by {p.designerName}</p>
                      <h4 className="text-[14px] md:text-[16px] font-semibold text-[#241910] mb-1 cursor-pointer hover:text-[#aa3000] transition-colors truncate" style={{ ...syne, lineHeight: 1.3 }} onClick={() => navigate(`/product/${p.id}`)}>{p.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-[16px] font-bold text-[#aa3000]" style={font}>{price}</span>
                        <button onClick={() => onAddToCart({ name: p.title, price, gradient: GRADIENTS.tee })} className="text-[#5c4037] hover:text-[#aa3000] transition-colors" aria-label="Add to cart">
                          <Icon name="shopping_bag" size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Slide-out Filters Drawer Overlay */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[100]" onClick={() => setFiltersOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          {/* Panel */}
          <div
            className="absolute top-0 right-0 h-full w-80 md:w-96 bg-[#fff8f5] shadow-2xl flex flex-col p-6 overflow-y-auto"
            onClick={e => e.stopPropagation()}
            style={{ animation: 'slideInRight 0.25s ease-out' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#e6beb2] pb-4 mb-6">
              <h3 className="text-[20px] font-bold text-[#aa3000]" style={syne}>Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="grid h-9 w-9 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors">
                <Icon name="close" size={22} />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037] mb-4" style={font}>Categories</h3>
              <ul className="space-y-1.5">
                {['All', 'T-Shirts', 'Hoodies', 'Accessories', 'Art Prints', 'Collectibles'].map(c => {
                  const isActive = selectedCategory === c;
                  return (
                    <li key={c}>
                      <button
                        onClick={() => setSelectedCategory(c)}
                        className={`w-full flex items-center justify-between text-[14px] font-semibold py-2.5 px-4 rounded-lg transition-all ${isActive ? 'bg-[#aa3000] text-white shadow-sm' : 'hover:bg-[#ffeadb] text-[#5c4037]'}`}
                        style={font}
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
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037] mb-4" style={font}>Filter by Price</h3>
              <div className="space-y-3">
                {['₹0 - ₹1999', '₹2000-₹3500', '₹3501-₹5000', '₹5000+'].map(l => {
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
                        className="w-4 h-4 rounded-sm border-[#e6beb2] text-[#aa3000] focus:ring-[#aa3000] accent-[#aa3000]"
                      />
                      <span className={`text-[14px] ${checked ? 'text-[#aa3000] font-bold' : 'text-[#241910] group-hover:text-[#aa3000]'} transition-colors`} style={font}>{l}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filter by Style */}
            <div className="mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037] mb-4" style={font}>Filter by Style</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Minimalist', bg: '#bdf200', fg: '#526b00' },
                  { name: 'Cyberpunk', bg: '#fff', fg: '#241910' },
                  { name: 'Retro', bg: '#fff', fg: '#241910' },
                  { name: 'Abstract', bg: '#d43f00', fg: '#fff' },
                  { name: 'Brutalist', bg: '#fff', fg: '#241910' }
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
                      className="px-4 py-1.5 rounded-full text-[12px] font-medium border transition-all hover:bg-[#aa3000] hover:text-white cursor-pointer"
                      style={{
                        background: active ? s.bg : '#fff',
                        color: active ? s.fg : '#241910',
                        borderColor: active ? '#aa3000' : '#e6beb2',
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
            <div className="mt-auto pt-6 border-t border-[#e6beb2] flex gap-3">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPrices([]);
                  setSelectedStyles([]);
                }}
                className="flex-1 py-3 border border-[#e6beb2] rounded text-[13px] font-bold uppercase hover:bg-[#fff1e8] text-[#5c4037] transition-colors cursor-pointer"
                style={font}
              >
                Clear All
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                className="flex-1 py-3 bg-[#aa3000] text-white text-[13px] font-bold uppercase rounded hover:bg-[#d43f00] transition-colors cursor-pointer"
                style={font}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
