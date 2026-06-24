import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon, GradientImg, GRADIENTS } from '../shared/UI';
import { Footer } from '../shared/Footer';

// Sleek, brutalist lock screen wrapper for unpatented ideas
const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [code, setCode] = useState<string[]>(['', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    // Focus first input on load
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    // Only numeric input
    const numVal = val.replace(/[^0-9]/g, '');
    if (!numVal) return;

    const newCode = [...code];
    newCode[index] = numVal[numVal.length - 1];
    setCode(newCode);
    setError(null);

    if (index < 4) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (code[index] === '') {
        if (index > 0) {
          const newCode = [...code];
          newCode[index - 1] = '';
          setCode(newCode);
          inputRefs[index - 1].current?.focus();
        }
      } else {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
      setError(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 5);
    if (paste) {
      const newCode = [...code];
      for (let i = 0; i < paste.length; i++) {
        newCode[i] = paste[i];
      }
      setCode(newCode);
      const nextIdx = Math.min(paste.length, 4);
      inputRefs[nextIdx].current?.focus();
    }
  };

  const handleVirtualKey = (key: string) => {
    setError(null);
    
    if (key === 'CLEAR') {
      setCode(['', '', '', '', '']);
      inputRefs[0].current?.focus();
      return;
    }

    if (key === 'BACK') {
      // Find last filled index
      let lastFilled = -1;
      for (let i = 4; i >= 0; i--) {
        if (code[i] !== '') {
          lastFilled = i;
          break;
        }
      }
      if (lastFilled !== -1) {
        const newCode = [...code];
        newCode[lastFilled] = '';
        setCode(newCode);
        inputRefs[lastFilled].current?.focus();
      }
      return;
    }

    // Number key
    const firstEmpty = code.findIndex(c => c === '');
    if (firstEmpty !== -1) {
      const newCode = [...code];
      newCode[firstEmpty] = key;
      setCode(newCode);
      if (firstEmpty < 4) {
        inputRefs[firstEmpty + 1].current?.focus();
      }
    }
  };

  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === 5) {
      if (fullCode === '58656') {
        setIsSuccess(true);
        setError(null);
        // Play quick transition, then unlock
        const timer = setTimeout(() => {
          localStorage.setItem('offgrid_unlocked', 'true');
          onUnlock();
        }, 900);
        return () => clearTimeout(timer);
      } else {
        setIsShaking(true);
        setError('ACCESS DENIED // INCORRECT KEY');
        const timer = setTimeout(() => {
          setIsShaking(false);
          setCode(['', '', '', '', '']);
          inputRefs[0].current?.focus();
        }, 650);
        return () => clearTimeout(timer);
      }
    }
  }, [code]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f0907] text-[#fff8f5] select-none grid-mesh overflow-y-auto px-4 py-8">
      {/* Stylesheet for custom styling and animations */}
      <style>{`
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.7; transform: scale(1); filter: drop-shadow(0 0 5px rgba(189,242,0,0.3)); }
          50% { opacity: 1; transform: scale(1.03); filter: drop-shadow(0 0 15px rgba(189,242,0,0.7)); }
        }
        @keyframes lockShake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-spin-slow {
          animation: spinSlow 15s linear infinite;
        }
        .animate-pulse-glow {
          animation: pulseGlow 3.5s ease-in-out infinite;
        }
        .animate-shake {
          animation: lockShake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        .grid-mesh {
          background-size: 32px 32px;
          background-image: 
            linear-gradient(to right, rgba(170, 48, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(170, 48, 0, 0.04) 1px, transparent 1px);
        }
        .diagonal-stripes {
          background: repeating-linear-gradient(
            45deg,
            #aa3000,
            #aa3000 12px,
            #0f0907 12px,
            #0f0907 24px
          );
        }
      `}</style>

      {/* Cyber ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[#aa3000]/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0" />

      {/* Main vault container */}
      <div 
        className={`relative z-10 w-full max-w-[440px] bg-[#140c08]/90 backdrop-blur-md border border-[#aa3000]/30 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden rounded-2xl transition-all duration-300 ${
          isShaking ? 'animate-shake border-red-600/80 shadow-[0_0_40px_rgba(239,68,68,0.25)]' : ''
        } ${isSuccess ? 'border-[#bdf200]/80 shadow-[0_0_40px_rgba(189,242,0,0.3)] scale-98 opacity-90' : ''}`}
      >
        {/* Top Hazard Bar */}
        <div className="w-full h-3.5 diagonal-stripes border-b border-[#aa3000]/30" />

        <div className="p-6 md:p-8 flex flex-col items-center">
          
          {/* Animated Construct SVG Graphic */}
          <div className="mb-6 flex justify-center items-center relative">
            {/* Ambient indicator lines */}
            <div className="absolute -left-12 text-[10px] text-[#aa3000]/60 font-mono tracking-widest hidden sm:block animate-pulse">
              [SYS_RESTRICTED]
            </div>
            <div className="absolute -right-12 text-[10px] text-[#bdf200]/60 font-mono tracking-widest hidden sm:block animate-pulse">
              [BYPASS_LOCK]
            </div>

            <div className="relative p-2 rounded-full border border-dashed border-[#aa3000]/20 bg-[#100906]">
              <svg 
                className="w-24 h-24 md:w-28 md:h-28 text-[#aa3000]" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outmost target circle */}
                <circle cx="50" cy="50" r="46" stroke="rgba(170, 48, 0, 0.15)" strokeWidth="1" />
                
                {/* Rotating gear/ticks */}
                <g className="animate-spin-slow origin-center">
                  <circle cx="50" cy="50" r="39" stroke="#aa3000" strokeWidth="2" strokeDasharray="12 6 4 6" opacity="0.8" />
                  <circle cx="50" cy="50" r="43" stroke="#bdf200" strokeWidth="1" strokeDasharray="2 12" opacity="0.9" />
                </g>

                {/* Pulsing inner glow circle */}
                <circle cx="50" cy="50" r="31" fill="rgba(170, 48, 0, 0.05)" stroke="rgba(189, 242, 0, 0.1)" strokeWidth="1" />
                
                {/* Dynamic warning sign */}
                <g className="animate-pulse-glow origin-center">
                  <path 
                    d="M50 22 L76 68 H24 Z" 
                    stroke="#aa3000" 
                    strokeWidth="3.5" 
                    strokeLinejoin="round" 
                    fill="rgba(170, 48, 0, 0.25)" 
                  />
                  {/* Under Construction warning symbol inside triangle (Barricade stripes / Exclamation) */}
                  <line x1="50" y1="36" x2="50" y2="52" stroke="#bdf200" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="60" r="2.5" fill="#bdf200" />
                </g>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[22px] md:text-[26px] font-extrabold uppercase tracking-tight text-center font-display text-white leading-none">
            OFFGRID <span className="text-[#bdf200]">//</span> SECURITY LOCK
          </h2>
          
          <p className="text-[12px] md:text-[13px] text-[#916f65] text-center font-mono mt-3 leading-relaxed max-w-[320px]">
            This design concept is protected under pre-patent confidentiality. Enter passkey to decrypt.
          </p>

          {/* Numeric digit box inputs */}
          <div className="flex gap-2.5 my-6 justify-center">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                onFocus={(e) => e.target.select()}
                disabled={isSuccess}
                className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold font-mono rounded-lg bg-[#19100c] text-[#fff8f5] transition-all focus:outline-none border-2 ${
                  isSuccess 
                    ? 'border-[#bdf200] text-[#bdf200] shadow-[0_0_15px_rgba(189,242,0,0.3)]' 
                    : error 
                      ? 'border-red-600 text-red-500' 
                      : 'border-[#aa3000]/40 focus:border-[#bdf200] focus:shadow-[0_0_12px_rgba(189,242,0,0.45)]'
                }`}
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Feedback Status Readout */}
          <div className="min-h-[22px] flex items-center justify-center">
            {isSuccess ? (
              <span className="text-[#bdf200] text-[11px] font-mono tracking-widest animate-pulse">
                [ACCESS GRANTED // INITIALIZING]
              </span>
            ) : error ? (
              <span className="text-red-500 text-[11px] font-mono tracking-widest">
                [{error}]
              </span>
            ) : (
              <span className="text-[#916f65]/60 text-[11px] font-mono tracking-widest">
                [ENTER SYSTEM ACCESS KEY]
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#aa3000]/20 my-5" />

          {/* On-Screen Virtual Numpad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleVirtualKey(num)}
                disabled={isSuccess}
                className="h-11 md:h-12 flex items-center justify-center border border-[#aa3000]/25 rounded-md bg-[#130c08] text-[#fff8f5] hover:bg-[#aa3000]/20 hover:border-[#aa3000]/60 active:scale-95 transition-all text-[16px] font-bold font-mono"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleVirtualKey('CLEAR')}
              disabled={isSuccess}
              className="h-11 md:h-12 flex items-center justify-center border border-red-900/30 rounded-md bg-[#180e0c] text-red-400 hover:bg-red-900/20 active:scale-95 transition-all text-[11px] font-semibold tracking-wider font-mono uppercase"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={() => handleVirtualKey('0')}
              disabled={isSuccess}
              className="h-11 md:h-12 flex items-center justify-center border border-[#aa3000]/25 rounded-md bg-[#130c08] text-[#fff8f5] hover:bg-[#aa3000]/20 active:scale-95 transition-all text-[16px] font-bold font-mono"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleVirtualKey('BACK')}
              disabled={isSuccess}
              className="h-11 md:h-12 flex items-center justify-center border border-[#aa3000]/25 rounded-md bg-[#130c08] text-[#fff8f5] hover:bg-[#aa3000]/20 active:scale-95 transition-all text-[16px]"
              aria-label="Backspace"
            >
              <Icon name="backspace" size={18} className="text-[#aa3000]" />
            </button>
          </div>

        </div>

        {/* Bottom decorative bar */}
        <div className="w-full h-1 bg-[#aa3000]/20 flex justify-between px-6 font-mono text-[8px] text-[#aa3000]/40 py-1 select-none">
          <span>SECURE_SHELL v1.0.4</span>
          <span>SYSTEM_READY</span>
        </div>
      </div>
    </div>
  );
};

export const HomePage = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { addToCart, setAuthOpen, user } = useContext(AppContext);
  const onAddToCart = addToCart;
  const onAuthClick = () => setAuthOpen(true);
  const [designsFeed, setDesignsFeed] = useState<any[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  const [isLocked, setIsLocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('offgrid_unlocked') !== 'true';
    }
    return true;
  });

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

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  const heroSlides = [
    {
      eyebrow: 'Marketplace / Home / Creator-led drops',
      title: 'Designs with a point of view.',
      subtitle: 'Discover experimental streetwear, creator stories, and limited pieces from the OFFGRID marketplace.',
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1600&auto=format&fit=crop',
      tag: 'New drop',
      primaryLabel: user ? 'Go to Dashboard' : 'Sign In',
      primaryAction: () => (user ? navigate('/dashboard') : onAuthClick()),
      secondaryLabel: 'Explore Marketplace',
      secondaryAction: () => navigate('shop'),
    },
    {
      eyebrow: 'Creator / Studio / Publish',
      title: 'Make it your own.',
      subtitle: 'Start a new collection, publish artwork, and shape the next release with your own direction.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600&auto=format&fit=crop',
      tag: 'Creator tools',
      primaryLabel: user?.role === 'DESIGNER' ? 'Open Studio' : 'Browse Creators',
      primaryAction: () => (user?.role === 'DESIGNER' ? navigate('/studio/upload') : navigate('/shop')),
      secondaryLabel: 'See featured work',
      secondaryAction: () => navigate('/shop'),
    },
    {
      eyebrow: 'Personalized / Saved / Suggested',
      title: 'Suggestions based on what you like.',
      subtitle: 'Your account powers a cleaner path to the pieces and creators that match your taste.',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop',
      tag: 'Personalized',
      primaryLabel: user ? 'Your Dashboard' : 'Create Account',
      primaryAction: () => (user ? navigate('/dashboard') : onAuthClick()),
      secondaryLabel: 'Shop the edit',
      secondaryAction: () => navigate('shop'),
    },
  ];

  const activeHero = heroSlides[heroIndex % heroSlides.length];
  const nextHero = () => setHeroIndex((idx) => (idx + 1) % heroSlides.length);
  const prevHero = () => setHeroIndex((idx) => (idx - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="bg-[#fff8f5] text-[#241910] overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden border-t border-[#d07a55] bg-[#f58a0b] px-4 md:px-12 py-6 md:py-10">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch">
            <div className="relative min-h-[520px] md:min-h-[700px] overflow-hidden border border-[#f2c3a8] bg-[#241910] shadow-[0_28px_80px_rgba(60,25,8,0.18)]">
              <img
                key={activeHero.image}
                src={activeHero.image}
                alt={activeHero.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/35" />
              <div className="absolute left-4 top-4 md:left-6 md:top-6 rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md">
                {activeHero.tag}
              </div>
              <button
                type="button"
                onClick={prevHero}
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-[#e6beb2] bg-white text-[#241910] shadow-lg transition-transform hover:scale-105"
                aria-label="Previous hero"
              >
                <Icon name="arrow_back" size={24} />
              </button>
              <button
                type="button"
                onClick={nextHero}
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-[#e6beb2] bg-white text-[#241910] shadow-lg transition-transform hover:scale-105"
                aria-label="Next hero"
              >
                <Icon name="arrow_forward" size={24} />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                <div className="max-w-xl">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#fff1e8]/90" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {activeHero.eyebrow}
                  </p>
                  <h2 className="text-white text-[42px] md:text-[68px] leading-[0.95] tracking-[-0.04em]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
                    {activeHero.title}
                  </h2>
                  <p className="mt-4 max-w-lg text-[15px] md:text-[18px] leading-[1.6] text-[#fff8f5]/90" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {activeHero.subtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 text-[#241910] py-2 md:py-8 lg:py-10">
              <div className="space-y-5">
                <div className="flex items-center gap-3 text-[#241910]">
                  <Icon name="favorite" size={28} />
                  <Icon name="navigation" size={28} />
                  <Icon name="shopping_bag" size={28} />
                  <Icon name="trending_up" size={28} />
                </div>
                <div className="max-w-lg">
                  <p className="text-[14px] md:text-[16px] font-semibold uppercase tracking-[0.22em] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {activeHero.eyebrow}
                  </p>
                  <h3 className="mt-4 text-[34px] md:text-[56px] leading-[0.98] font-semibold tracking-[-0.04em]" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {activeHero.title}
                  </h3>
                  <p className="mt-5 text-[17px] md:text-[22px] leading-[1.35] max-w-xl" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {activeHero.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[15px] md:text-[17px] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Where would you like to start?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                  <button
                    type="button"
                    onClick={activeHero.primaryAction}
                    className="bg-[#241910] text-[#fff8f5] px-6 py-4 md:py-5 text-[13px] md:text-[15px] font-semibold uppercase tracking-[0.18em] transition-transform hover:-translate-y-0.5"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {activeHero.primaryLabel}
                  </button>
                  <button
                    type="button"
                    onClick={activeHero.secondaryAction}
                    className="border border-[#241910] bg-transparent px-6 py-4 md:py-5 text-[13px] md:text-[15px] font-semibold uppercase tracking-[0.18em] text-[#241910] transition-colors hover:bg-[#241910] hover:text-[#fff8f5]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {activeHero.secondaryLabel}
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  {heroSlides.map((slide, idx) => (
                    <button
                      key={slide.tag}
                      type="button"
                      onClick={() => setHeroIndex(idx)}
                      className={`h-2.5 rounded-full transition-all ${idx === heroIndex ? 'w-12 bg-[#241910]' : 'w-2.5 bg-[#241910]/35 hover:bg-[#241910]/60'}`}
                      aria-label={`Go to hero ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
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
