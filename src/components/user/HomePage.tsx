import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon, GradientImg, GRADIENTS } from '../shared/UI';
import { Footer } from '../shared/Footer';

export const HomePage = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { addToCart, setAuthOpen } = useContext(AppContext);
  const onAddToCart = addToCart;
  const onAuthClick = () => setAuthOpen(true);
  const [designsFeed, setDesignsFeed] = useState<any[]>([]);

  useEffect(() => {
    apiJson<any[]>('/api/catalog')
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setDesignsFeed(d);
          return;
        }
        return apiJson<any[]>('/api/products')
          .then(products => setDesignsFeed(Array.isArray(products) ? products : []));
      })
      .catch(() => { });
  }, []);

  return (
    <div className="bg-[#fff8f5] text-[#241910] overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[600px] md:min-h-[870px] flex items-center overflow-hidden px-4 md:px-12" style={{ background: 'linear-gradient(180deg, #aa3000 0%, #fff8f5 100%)' }}>
        <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center z-10 py-12 md:py-0">
          <div className="flex flex-col gap-6">
            <span className="uppercase tracking-[0.2em] text-[#852400] text-[10px] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>New Season / 2024</span>
            <h2 className="text-white drop-shadow-sm leading-none text-[40px] md:text-[64px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Art That Lives Nowhere Else</h2>
            <p className="text-white/90 max-w-md text-[14px] md:text-[18px]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>Discover the vanguard of streetwear and digital collectibles. Exclusive drops from the world's most reclusive creators, curated for the bold.</p>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <button
                onClick={() => navigate('shop')}
                className="bg-[#aa3000] text-white font-semibold px-6 py-4 md:px-10 md:py-6 rounded text-[14px] uppercase tracking-wider hover:bg-[#d43f00] transition-all"
                style={{ boxShadow: '4px 4px 0px 0px #3a0b00', fontFamily: 'Inter, sans-serif' }}
              >
                EXPLORE SHOP
              </button>
            </div>
          </div>
          <div className="relative group hidden lg:block">
            <div className="absolute inset-0 bg-[#bdf200]/20 -rotate-3 scale-105 rounded-xl z-0" />
            <div className="relative z-10 w-full h-[600px] rounded shadow-2xl border-4 border-white overflow-hidden">
              <img src="https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800&auto=format&fit=crop" alt="Streetwear Hero Model" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#bdf200] rounded-full blur-[120px] opacity-30" />
      </section>

      {/* Category ticker */}
      <div className="w-full bg-[#241910] text-[#fff8f5] py-4 overflow-hidden whitespace-nowrap">
        <div className="inline-flex items-center gap-8 md:gap-16 animate-[ticker_30s_linear_infinite]">
          {['GEN-Z FUTURISM', 'BRUTALIST WEAR', 'DIGITAL NOMAD GEAR', 'AVANT-GARDE ARCHIVE', 'NEO-STREETWEAR',
            'GEN-Z FUTURISM', 'BRUTALIST WEAR', 'DIGITAL NOMAD GEAR', 'AVANT-GARDE ARCHIVE', 'NEO-STREETWEAR'].map((t, i) => (
              <span key={i} className="flex items-center gap-4">
                <span className="uppercase italic font-semibold text-[14px] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>{t}</span>
                <Icon name="star" size={18} className="text-[#fff8f5]" />
              </span>
            ))}
        </div>
      </div>

      {/* Latest Designs */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h3 className="text-[24px] md:text-[32px] font-bold" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>Latest Designs</h3>
            <div className="w-20 h-1 bg-[#aa3000] mt-2" />
          </div>
          <button onClick={() => navigate('shop')} className="text-[14px] text-[#aa3000] underline underline-offset-4 uppercase font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>View All</button>
        </div>

        {designsFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-[#e6beb2] rounded-lg gap-4 text-center">
            <Icon name="palette" size={40} className="text-[#e6beb2]" />
            <p className="text-[18px] font-semibold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>No designs yet</p>
            <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Designs will appear here as soon as creators publish them.</p>
            <button onClick={() => navigate('shop')} className="bg-[#aa3000] text-white px-6 py-3 text-[14px] font-semibold rounded hover:bg-[#d43f00] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Browse Shop</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
            {designsFeed.map((item: any) => {
              const image = item.image || item.fileUrl;
              const displayPrice = item.price || (typeof item.baseCostINR === 'number' && typeof item.designerPriceINR === 'number'
                ? `₹${(item.baseCostINR + item.designerPriceINR).toLocaleString('en-IN')}`
                : 'Coming soon');
              const cardTarget = item.productId ? `/product/${item.productId}` : `/creator/${item.designerId}`;
              return (
                <div key={item.id} className="bg-white group cursor-pointer border border-[#EDE4D8] rounded-lg overflow-hidden" onClick={() => navigate(cardTarget)}>
                  <div className="overflow-hidden aspect-[3/4]">
                    {image
                      ? <img src={image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      : <GradientImg gradient={GRADIENTS.tee} className="h-full" />
                    }
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] uppercase tracking-wider text-[#aa3000] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{item.designerName || 'OFFGRID Creator'}</p>
                    <h5 className="text-[15px] font-semibold text-[#241910] mt-1 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{item.title}</h5>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-[#5c4037] text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }}>{displayPrice}</p>
                      <button
                        className="bg-[#241910] text-[#fff8f5] text-[12px] font-semibold px-4 py-2 rounded uppercase"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        onClick={e => {
                          e.stopPropagation();
                          onAddToCart({ name: item.title, price: displayPrice, gradient: GRADIENTS.tee });
                        }}
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="lg:col-span-2 xl:col-span-4 bg-[#bdf200]/10 border-2 border-[#bdf200] p-6 md:p-10 flex flex-col justify-center items-center text-center rounded-lg">
              <h5 className="text-[24px] font-semibold text-[#241910] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Exclusive Creator Drops</h5>
              <p className="text-[16px] text-[#5c4037] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Sign up to get early access when new designs go live.</p>
              <button className="bg-[#241910] text-[#fff8f5] text-[14px] font-semibold px-10 py-4 rounded hover:bg-[#aa3000] transition-all uppercase w-full sm:w-auto" style={{ fontFamily: 'Inter, sans-serif' }} onClick={onAuthClick}>SIGN UP FOR ALERTS</button>
            </div>
          </div>
        )}
      </section>

      {/* Creator Spotlight */}
      <section className="bg-[#fae4d5] py-16 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="relative">
              <div className="pl-6" style={{ borderLeft: '4px solid #bdf200' }}>
                <span className="text-[14px] text-[#aa3000] uppercase font-semibold tracking-wider mb-1 inline-block" style={{ fontFamily: 'Inter, sans-serif' }}>Creator Spotlight</span>
                <h3 className="text-[32px] md:text-[48px] font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.1, letterSpacing: '-0.01em' }}>Elara Void</h3>
              </div>
              <p className="text-[18px] text-[#5c4037] mb-10 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                "Architecture is just clothing for space. My designs aim to be space for the human body to redefine itself." <br /><br />
                Void's collection, <strong className="text-[#241910]">Subterranean Echoes</strong>, explores the intersection of brutalist shapes and soft textiles.
              </p>
              <div className="flex gap-6">
                {[['12', 'Drops'], ['4.8k', 'Holders'], ['Top 1%', 'Rank']].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <span className="block text-[24px] font-semibold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif' }}>{v}</span>
                    <span className="text-[10px] uppercase text-[#5c4037] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-[300px] md:h-[500px] overflow-hidden rounded-sm border border-[#916f65] shadow-xl grayscale hover:grayscale-0 transition-all duration-1000">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop" alt="Elara Void Portrait" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-10 -right-10 bg-[#bdf200] w-32 h-32 flex items-center justify-center rounded-full rotate-12 p-4 shadow-lg">
                <span className="text-[#526b00] text-[10px] text-center leading-tight font-bold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>OFFGRID EXCLUSIVE ARTIST</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* This Week in OffGrid */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
        <h3 className="text-[24px] md:text-[32px] font-bold text-center mb-10 italic tracking-tight" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>"This Week in OffGrid"</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10">
          {[
            { num: '01', title: 'Minimalist Rigor', desc: 'A collection focused on the removal of the unnecessary. Pure form, pure function.', img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop", scale: false },
            { num: '02', title: 'Electric Pulse', desc: "The boldest colors in our inventory, curated for those who refuse to blend in.", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop", scale: true },
            { num: '03', title: 'The Over-Layer', desc: 'Mastering the art of technical layering for the urban nomad.', img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop", scale: false },
          ].map(c => (
            <div key={c.num} className={`flex flex-col gap-4 p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer ${c.scale ? 'scale-105 z-10' : ''}`} style={{ border: '1px solid #EDE4D8' }}>
              <div className="aspect-square overflow-hidden rounded">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
              </div>
              <span className="text-[10px] font-bold uppercase text-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }}>Curation {c.num}</span>
              <h4 className="text-[24px] font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>{c.title}</h4>
              <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#241910] text-[#fff8f5] py-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {[
            { quote: '"OFFGRID isn\'t just a store; it\'s a statement. The quality of the limited parka I received is unparalleled."', author: '— Julian R., Tokyo' },
            { quote: '"The creator transparency here is something else. Knowing the story behind the piece makes it worth so much more."', author: '— Sarah M., Berlin' },
            { quote: '"The digital twin verification is genius. I can prove my gear is authentic in both the physical and digital worlds."', author: '— Leo K., New York' },
          ].map((t, i) => (
            <div key={i} className="pl-6" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="flex text-[#bdf200] mb-4">
                {[...Array(5)].map((_, j) => <Icon key={j} name="star" fill={1} size={20} className="text-[#bdf200]" />)}
              </div>
              <p className="text-[16px] md:text-[18px] italic mb-6" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>{t.quote}</p>
              <span className="text-[14px] font-semibold uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>{t.author}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
        <div className="bg-[#aa3000] p-8 md:p-16 rounded-xl flex flex-col md:flex-row items-center gap-10 text-white">
          <div className="flex-1">
            <h3 className="text-[24px] md:text-[32px] font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Join the Inner Circle</h3>
            <p className="text-[18px]" style={{ fontFamily: 'Inter, sans-serif' }}>Get early access to drops, creator interviews, and secret showroom events.</p>
          </div>
          <div className="flex-1 w-full max-w-md">
            <form className="flex flex-col sm:flex-row gap-4">
              <input className="flex-1 bg-white/10 border border-white/30 text-white placeholder-white/60 p-6 rounded focus:outline-none focus:ring-2 focus:ring-[#bdf200]" placeholder="YOUR EMAIL ADDRESS" type="email" style={{ fontFamily: 'Inter, sans-serif' }} />
              <button className="bg-[#bdf200] text-[#526b00] font-semibold px-6 py-4 md:px-10 md:py-6 rounded hover:opacity-90 transition-opacity uppercase text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }} type="submit">SUBSCRIBE</button>
            </form>
            <p className="text-[10px] mt-4 text-white/60 font-bold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Respecting your inbox since 2024.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
