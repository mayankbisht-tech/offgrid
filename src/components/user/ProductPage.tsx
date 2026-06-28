import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { Icon, GradientImg, GRADIENTS } from '../shared/UI';
import { Footer } from '../shared/Footer';

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { addToCart } = useContext(AppContext);
  const onAddToCart = addToCart;
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedEdition, setSelectedEdition] = useState('sunset');

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setProduct(data);
        }
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

  // Fallback to default product if not found/no ID (for backwards compatibility/demo)
  const displayProduct = product || {
    id: 'samurai-hoodie',
    title: 'Neon Samurai Hoodie',
    designerId: 'dsg-1',
    designerName: 'KENTA_OFF',
    baseCostINR: 12000,
    designerPriceINR: 3500,
    description: 'Crafted from 450GSM heavy-weight French Terry. Featuring high-density discharge printing and reflective 3M accents for a true cyber-street aesthetic.',
    productType: 'hoodie',
    image: null
  };

  const priceVal = displayProduct.baseCostINR + displayProduct.designerPriceINR;
  const priceString = `â‚¹${priceVal.toLocaleString('en-IN')}`;

  return (
    <div className="text-[#1A1A1A]" style={{ background: 'linear-gradient(180deg, #F7F3EF 0%, #EDE4DB 50%, #F1E7DE 100%)', minHeight: '100vh' }}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-12 mt-10">
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white border border-[rgba(109,15,49,0.15)] rounded-lg overflow-hidden group relative" style={{ aspectRatio: '4/5' }}>
              <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                {displayProduct.image ? (
                  <img src={displayProduct.image} alt={displayProduct.title} className="w-full h-full object-cover" />
                ) : (
                  <GradientImg gradient={GRADIENTS.hoodie} className="h-full" />
                )}
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-[#C6FF00] text-[#3D5A00] px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Limited Drop</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[GRADIENTS.art1, GRADIENTS.art2, GRADIENTS.art3, ''].map((g, i) => (
                <div key={i} className={`aspect-square bg-white border border-[rgba(109,15,49,0.15)] rounded hover:border-[#950606] transition-colors cursor-pointer overflow-hidden ${i === 3 ? 'flex items-center justify-center bg-[#F1E7DE]' : ''}`}>
                  {i < 3 ? <GradientImg gradient={g} className="h-full" /> : <Icon name="play_circle" size={40} className="text-[#950606]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif' }}>Collection 04 / {displayProduct.productType.toUpperCase()}</span>
            </div>
            <h1 className="text-[#1A1A1A] mb-2 leading-none text-[32px] md:text-[48px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{displayProduct.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 cursor-pointer hover:text-[#950606] transition-colors" onClick={() => navigate(`/creator/${displayProduct.designerId}`)}>
                <div className="w-8 h-8 rounded-full border border-[#8A7A72] bg-[#F1E7DE] flex items-center justify-center overflow-hidden">
                  <div style={{ background: GRADIENTS.portrait, width: '100%', height: '100%' }} />
                </div>
                <span className="text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{displayProduct.designerName}</span>
              </div>
              <span className="w-1 h-1 bg-[rgba(109,15,49,0.15)] rounded-full" />
              <span className="text-[24px] font-semibold text-[#950606]" style={{ fontFamily: 'Syne, sans-serif' }}>{priceString}</span>
            </div>
            <p className="text-[18px] text-[#5C5C5C] mb-10" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
              {displayProduct.description}
            </p>

            {/* Size selector */}
            <div className="space-y-6 mb-16">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter mb-4 block text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Select Size</label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 rounded flex items-center justify-center text-[14px] font-semibold transition-all ${selectedSize === s ? 'border-2 border-[#950606]' : 'border border-[rgba(109,15,49,0.15)] hover:border-[#950606]'}`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter mb-4 block text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Edition</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEdition('sunset')}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 text-[14px] font-semibold uppercase transition-all ${selectedEdition === 'sunset' ? 'border-2 border-[#950606] bg-[#950606] text-white' : 'border border-[rgba(109,15,49,0.15)] hover:border-[#950606]'}`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Icon name="bolt" size={14} /> Sunset Mode
                  </button>
                  <button
                    onClick={() => setSelectedEdition('stealth')}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 text-[14px] font-semibold uppercase transition-all ${selectedEdition === 'stealth' ? 'border-2 border-[#950606]' : 'border border-[rgba(109,15,49,0.15)] hover:border-[#950606]'}`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Icon name="nights_stay" size={14} /> Stealth Black
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <button
                className="w-full h-14 md:h-16 bg-[#950606] text-white rounded-lg uppercase flex items-center justify-center gap-4 text-[20px] md:text-[24px] font-semibold transition-all"
                style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}
                onClick={() => onAddToCart({ name: displayProduct.title, price: priceString, gradient: GRADIENTS.hoodie, image: displayProduct.image })}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px #950606'; (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px,-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
              >
                Add to Cart <Icon name="arrow_forward" size={24} className="text-white" />
              </button>
              <div className="flex items-center justify-between px-2 py-4 border-t border-[rgba(109,15,49,0.15)] mt-2">
                <span className="flex items-center gap-1 text-[12px] text-[#5C5C5C] uppercase font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Icon name="local_shipping" size={14} /> Free Worldwide Shipping
                </span>
                <span className="flex items-center gap-1 text-[12px] text-[#5C5C5C] uppercase font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Icon name="verified" size={14} /> Authenticity Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Bento */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-16 py-16 border-t border-[rgba(109,15,49,0.15)]">
          {/* About the Design */}
          <div className="md:col-span-8 p-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(109,15,49,0.12)', borderLeft: '4px solid #C6FF00' }}>
            <h2 className="text-[32px] font-bold mb-6 uppercase" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>About the Design</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-[18px] text-[#5C5C5C] mb-4" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                  This design is a custom creation by {displayProduct.designerName}. Built and published using <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span>'s dynamic creator pipeline.
                </p>
                <ul className="space-y-2">
                  {['Hand-numbered limited run', `Signature ${displayProduct.designerName} style`, 'Oversized "Hacker" Fit'].map(l => (
                    <li key={l} className="flex items-center gap-2 text-[14px] font-semibold uppercase text-[#950606]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="w-2 h-2 bg-[#950606] rounded-full" /> {l}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg overflow-hidden border border-[rgba(109,15,49,0.15)]">
                <GradientImg gradient={GRADIENTS.workspace} className="h-full min-h-[200px]" />
              </div>
            </div>
          </div>

          {/* More from creator */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <div className="bg-[#C6FF00]/10 border border-[#C6FF00] p-10 rounded-xl flex-1 flex flex-col justify-center items-center text-center">
              <h4 className="text-[20px] font-bold mb-2 uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>More by {displayProduct.designerName}</h4>
              <p className="text-[14px] text-[#5C5C5C] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Explore more high-performance streetwear artifacts by this artist.</p>
              <button
                onClick={() => navigate(`/creator/${displayProduct.designerId}`)}
                className="bg-[#1A1A1A] text-[#F7F3EF] text-[12px] font-bold uppercase py-3 px-6 hover:bg-[#950606] hover:text-white transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
