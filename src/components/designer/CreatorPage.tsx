import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { Icon, GradientImg, GRADIENTS } from '../shared/UI';
import { Footer } from '../shared/Footer';

export const CreatorPage = () => {
  const { id } = useParams<{ id: string }>();
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { addToCart } = useContext(AppContext);
  const onAddToCart = addToCart;

  const [designer, setDesigner] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`/api/designers/${id}`).then(r => r.json()).catch(() => null),
      fetch(`/api/designers/${id}/products`).then(r => r.json()).catch(() => []),
    ])
      .then(([d, p]) => {
        setDesigner(d);
        setProducts(Array.isArray(p) ? p : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F3EF]">
        <div className="w-10 h-10 border-4 border-[#950606] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const designerName = designer?.name || 'Unknown Designer';
  const usernameDisplay = designer?.username ? `@${designer.username}` : 'verified_creator';

  return (
    <div className="text-[#1A1A1A]" style={{ background: 'linear-gradient(180deg, #F7F3EF 0%, #EDE4DB 50%, #ebd6c7 100%)', minHeight: '100vh' }}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-12 py-10">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mb-16">
          <div className="md:col-span-5 relative">
            <div className="aspect-square bg-white p-1 border border-[rgba(109,15,49,0.15)] overflow-hidden" style={{ boxShadow: '4px 4px 0px 0px #950606' }}>
              <div className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden">
                <GradientImg gradient={GRADIENTS.portrait} className="h-full" />
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-[#C6FF00] px-6 py-2 border border-[#3D5A00]">
              <span className="text-[14px] font-semibold text-[#3D5A00] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Verified Creator</span>
            </div>
          </div>
          <div className="md:col-span-7 flex flex-col items-start gap-6 mt-10 md:mt-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#950606] uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{usernameDisplay}</span>
              <h1 className="text-[#1A1A1A] leading-none mb-2 text-[32px] md:text-[48px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{designerName}</h1>
            </div>
            <div className="pl-6 max-w-xl" style={{ borderLeft: '4px solid #C6FF00' }}>
              <p className="text-[18px] text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                Exploring the intersection of digital decay and high-performance streetwear. Building tactile artifacts for the modern nomad.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              <button
                className="bg-[#950606] text-white px-8 py-3 md:px-16 md:py-4 text-[14px] font-semibold uppercase border border-[#950606] hover:bg-[#950606] transition-all"
                style={{ boxShadow: '4px 4px 0px 0px #950606', fontFamily: 'Inter, sans-serif' }}
              >
                Follow Creator
              </button>
              <button className="bg-transparent text-[#1A1A1A] px-6 py-3 md:px-10 md:py-4 text-[14px] font-semibold uppercase border border-[#1A1A1A] hover:bg-[#F1E7DE] transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                Message
              </button>
            </div>
            <div className="flex gap-6 md:gap-10 mt-4">
              {[
                ['1.2K', 'Followers'],
                [products.length.toString(), 'Works'],
                ['1.8k+', 'Views']
              ].map(([v, l]) => (
                <div key={l} className="flex flex-col">
                  <span className="text-[24px] font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Syne, sans-serif' }}>{v}</span>
                  <span className="text-[12px] uppercase text-[#5C5C5C] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Works filter */}
        <div className="flex items-center justify-between border-b border-[rgba(109,15,49,0.15)] pb-4 mb-10">
          <h2 className="text-[32px] font-bold text-[#1A1A1A] uppercase tracking-tight" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>Collected Works</h2>
          <div className="flex gap-4">
            {['Latest', 'Popular'].map((t, i) => (
              <button key={t} className={`text-[14px] font-semibold transition-colors ${i === 0 ? 'text-[#950606] border-b-2 border-[#950606] pb-1' : 'text-[#5C5C5C] hover:text-[#950606]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{t}</button>
            ))}
          </div>
        </div>
        {/* Products grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-[rgba(109,15,49,0.15)] bg-white rounded-lg gap-4 text-center p-8">
            <Icon name="palette" size={40} className="text-[rgba(109,15,49,0.15)]" />
            <p className="text-[18px] font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Syne, sans-serif' }}>No works published yet</p>
            <p className="text-[14px] text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif' }}>This creator hasn't published any designs to the shop yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {products.map((p: any) => {
              const price = `â‚¹${(p.baseCostINR + p.designerPriceINR).toLocaleString('en-IN')}`;
              return (
                <div key={p.id}
                  className="group bg-white border border-[rgba(109,15,49,0.15)] rounded p-2 md:p-4 transition-all duration-300"
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0px 0px #950606'; (e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px,-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
                >
                  <div className="relative overflow-hidden mb-4 bg-[#F1E7DE] cursor-pointer" style={{ aspectRatio: '3/4' }} onClick={() => navigate(`/product/${p.id}`)}>
                    {p.image
                      ? <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      : <GradientImg gradient={GRADIENTS.tee} className="h-full" />
                    }
                    <div className="absolute inset-x-0 bottom-0 bg-[#950606] py-2 text-white text-[11px] font-bold uppercase tracking-wider text-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => { e.stopPropagation(); onAddToCart({ name: p.title, price, gradient: GRADIENTS.tee }); }}>
                      + Quick Add
                    </div>
                  </div>
                  <h4 className="text-[16px] font-semibold text-[#1A1A1A] mb-1 cursor-pointer hover:text-[#950606] transition-colors truncate" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }} onClick={() => navigate(`/product/${p.id}`)}>{p.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-bold text-[#950606]" style={{ fontFamily: 'Inter, sans-serif' }}>{price}</span>
                    <button onClick={() => onAddToCart({ name: p.title, price, gradient: GRADIENTS.tee })} className="text-[#5C5C5C] hover:text-[#950606] transition-colors" aria-label="Add to cart">
                      <Icon name="shopping_bag" size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Featured callout */}
        <section className="mt-16 bg-[#EDE4DB] p-8 md:p-16 flex flex-col md:flex-row items-center gap-6 md:gap-10 border border-[rgba(109,15,49,0.15)] relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#950606] rounded-full blur-[100px] opacity-20" />
          <div className="relative z-10 md:w-1/2">
            <span className="text-[10px] font-bold text-[#950606] uppercase tracking-[0.2em] mb-4 block" style={{ fontFamily: 'Inter, sans-serif' }}>Behind the process</span>
            <h2 className="text-[#1A1A1A] mb-6 text-[32px] md:text-[48px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>REDEFINING TEXTILE TOPOLOGY.</h2>
            <p className="text-[18px] text-[#5C5C5C] mb-10" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
              Every piece in the 001 Drop was crafted using procedural generation algorithms mapped onto traditional Japanese weaving patterns.
            </p>
            <a href="#" className="text-[#1A1A1A] text-[14px] font-semibold uppercase border-b-2 border-[#950606] pb-1 inline-block" style={{ fontFamily: 'Inter, sans-serif' }}>Read the Manifesto</a>
          </div>
          <div className="md:w-1/2 relative aspect-square">
            <div className="w-full h-full border border-[rgba(109,15,49,0.15)] overflow-hidden" style={{ boxShadow: '4px 4px 0px 0px #950606' }}>
              <GradientImg gradient={GRADIENTS.workspace} className="h-full" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
