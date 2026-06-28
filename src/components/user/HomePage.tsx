import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'motion/react';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { FadeUp, SlideIn, AnimatedCounter, TiltCard, HoverLift, MagneticButton, InfiniteMarquee, HoverReveal, StaggerChildren } from '../../animations/text animations/Animations';
import { Icon, GradientImg, GRADIENTS } from '../shared/UI';
import Stack from '../../animations/Component Animations/stack';
import RotatingText from '../../animations/text animations/rotatingtext';
import { ScrollVelocity } from '../../animations/text animations/scrollvelocity';
import { Footer } from '../shared/Footer';

const CusArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-middle ml-1"
  >
    <path
      d="M1 8H15M15 8L8 1M15 8L8 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f0907] text-[#F7F3EF] select-none grid-mesh overflow-y-auto px-4 py-8">
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
            #950606,
            #950606 12px,
            #0f0907 12px,
            #0f0907 24px
          );
        }
      `}</style>

      {/* Cyber ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-[#950606]/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0" />

      {/* Main vault container */}
      <div
        className={`relative z-10 w-full max-w-[440px] bg-[#140c08]/90 backdrop-blur-md border border-[#950606]/30 shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden rounded-2xl transition-all duration-300 ${isShaking ? 'animate-shake border-red-600/80 shadow-[0_0_40px_rgba(239,68,68,0.25)]' : ''
          } ${isSuccess ? 'border-[#C6FF00]/80 shadow-[0_0_40px_rgba(189,242,0,0.3)] scale-98 opacity-90' : ''}`}
      >
        {/* Top Hazard Bar */}
        <div className="w-full h-3.5 diagonal-stripes border-b border-[#950606]/30" />

        <div className="p-6 md:p-8 flex flex-col items-center">

          {/* Animated Construct SVG Graphic */}
          <div className="mb-6 flex justify-center items-center relative">
            {/* Ambient indicator lines */}
            <div className="absolute -left-12 text-[10px] text-[#950606]/60 font-mono tracking-widest hidden sm:block animate-pulse">
              [SYS_RESTRICTED]
            </div>
            <div className="absolute -right-12 text-[10px] text-[#C6FF00]/60 font-mono tracking-widest hidden sm:block animate-pulse">
              [BYPASS_LOCK]
            </div>

            <div className="relative p-2 rounded-full border border-dashed border-[#950606]/20 bg-[#100906]">
              <svg
                className="w-24 h-24 md:w-28 md:h-28 text-[#950606]"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Outmost target circle */}
                <circle cx="50" cy="50" r="46" stroke="rgba(170, 48, 0, 0.15)" strokeWidth="1" />

                {/* Rotating gear/ticks */}
                <g className="animate-spin-slow origin-center">
                  <circle cx="50" cy="50" r="39" stroke="#950606" strokeWidth="2" strokeDasharray="12 6 4 6" opacity="0.8" />
                  <circle cx="50" cy="50" r="43" stroke="#C6FF00" strokeWidth="1" strokeDasharray="2 12" opacity="0.9" />
                </g>

                {/* Pulsing inner glow circle */}
                <circle cx="50" cy="50" r="31" fill="rgba(170, 48, 0, 0.05)" stroke="rgba(189, 242, 0, 0.1)" strokeWidth="1" />

                {/* Dynamic warning sign */}
                <g className="animate-pulse-glow origin-center">
                  <path
                    d="M50 22 L76 68 H24 Z"
                    stroke="#950606"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    fill="rgba(170, 48, 0, 0.25)"
                  />
                  {/* Under Construction warning symbol inside triangle (Barricade stripes / Exclamation) */}
                  <line x1="50" y1="36" x2="50" y2="52" stroke="#C6FF00" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="60" r="2.5" fill="#C6FF00" />
                </g>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[22px] md:text-[26px] font-extrabold uppercase tracking-tight text-center font-display leading-none">
            <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span> <span className="text-[#C6FF00]">//</span> SECURITY LOCK
          </h2>

          <p className="text-[12px] md:text-[13px] text-[#8A7A72] text-center font-mono mt-3 leading-relaxed max-w-[320px]">
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
                className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold font-mono rounded-lg bg-[#19100c] text-[#F7F3EF] transition-all focus:outline-none border-2 ${isSuccess
                  ? 'border-[#C6FF00] text-[#C6FF00] shadow-[0_0_15px_rgba(189,242,0,0.3)]'
                  : error
                    ? 'border-red-600 text-red-500'
                    : 'border-[#950606]/40 focus:border-[#C6FF00] focus:shadow-[0_0_12px_rgba(189,242,0,0.45)]'
                  }`}
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Feedback Status Readout */}
          <div className="min-h-[22px] flex items-center justify-center">
            {isSuccess ? (
              <span className="text-[#C6FF00] text-[11px] font-mono tracking-widest animate-pulse">
                [ACCESS GRANTED // INITIALIZING]
              </span>
            ) : error ? (
              <span className="text-red-500 text-[11px] font-mono tracking-widest">
                [{error}]
              </span>
            ) : (
              <span className="text-[#8A7A72]/60 text-[11px] font-mono tracking-widest">
                [ENTER SYSTEM ACCESS KEY]
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#950606]/20 my-5" />

          {/* On-Screen Virtual Numpad */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleVirtualKey(num)}
                disabled={isSuccess}
                className="h-11 md:h-12 flex items-center justify-center border border-[#950606]/25 rounded-md bg-[#130c08] text-[#F7F3EF] hover:bg-[#950606]/20 hover:border-[#950606]/60 active:scale-95 transition-all text-[16px] font-bold font-mono"
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
              className="h-11 md:h-12 flex items-center justify-center border border-[#950606]/25 rounded-md bg-[#130c08] text-[#F7F3EF] hover:bg-[#950606]/20 active:scale-95 transition-all text-[16px] font-bold font-mono"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleVirtualKey('BACK')}
              disabled={isSuccess}
              className="h-11 md:h-12 flex items-center justify-center border border-[#950606]/25 rounded-md bg-[#130c08] text-[#F7F3EF] hover:bg-[#950606]/20 active:scale-95 transition-all text-[16px]"
              aria-label="Backspace"
            >
              <Icon name="backspace" size={18} className="text-[#950606]" />
            </button>
          </div>

        </div>

        {/* Bottom decorative bar */}
        <div className="w-full h-1 bg-[#950606]/20 flex justify-between px-6 font-mono text-[8px] text-[#950606]/40 py-1 select-none">
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

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Magazine Cover Cards for Stack Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const magazineCards = [
    <div key="mag-1" className="relative w-full h-full overflow-hidden bg-[#1A1A1A]">
      <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800&auto=format&fit=crop" alt="Swarang by Amita" className="w-full h-full object-cover pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>ISSUE 03</span>
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>SPRING / SUMMER 2025</span>
      </div>
      <div className="absolute top-1/4 left-4 right-4 pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="text-white">Re</span><span className="text-[#950606]">OG</span>
        </p>
        <h3 className="text-white text-[28px] md:text-[36px] leading-[0.95] font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>SWARANG<br />BY AMITA</h3>
      </div>
      <div className="absolute bottom-6 left-4 right-4 pointer-events-none">
        <p className="text-[9px] text-white/80 uppercase tracking-[0.2em]" style={{ fontFamily: 'Inter, sans-serif' }}>ROOTED IN HERITAGE.<br />CRAFTED FOR TODAY.</p>
      </div>
    </div>,
    <div key="mag-2" className="relative w-full h-full overflow-hidden bg-[#1E1E1E]">
      <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop" alt="Threads That Tell Stories" className="w-full h-full object-cover pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>FEATURE</span>
      </div>
      <div className="absolute top-1/3 left-4 right-4 pointer-events-none">
        <h3 className="text-white text-[26px] md:text-[32px] leading-[1.05] font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Threads<br />That Tell<br />Stories</h3>
      </div>
    </div>,
    <div key="mag-3" className="relative w-full h-full overflow-hidden bg-[#1A1A1A]">
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop" alt="Caverleigh & Co." className="w-full h-full object-cover pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>VOL. 07</span>
        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>FALL / WINTER 2024</span>
      </div>
      <div className="absolute top-1/4 left-4 right-4 pointer-events-none">
        <h3 className="text-white text-[28px] md:text-[36px] leading-[0.95] font-bold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>CAVERLEIGH<br />& CO.</h3>
      </div>
      <div className="absolute bottom-6 left-4 right-4 pointer-events-none">
        <p className="text-[9px] text-white/80 uppercase tracking-[0.2em]" style={{ fontFamily: 'Inter, sans-serif' }}>WHERE PRESENCE SPEAKS.</p>
      </div>
    </div>,
    <div key="mag-4" className="relative w-full h-full overflow-hidden bg-[#1a1714]">
      <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop" alt="Studio Noir" className="w-full h-full object-cover pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-white/60" style={{ fontFamily: 'Inter, sans-serif' }}>
          <span className="text-white">Re</span><span className="text-[#950606]">OG</span> EXCLUSIVE
        </span>
      </div>
      <div className="absolute top-1/3 left-4 right-4 pointer-events-none">
        <h3 className="text-white text-[28px] md:text-[36px] leading-[0.95] font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>STUDIO<br />NOIR</h3>
        <p className="text-[10px] text-white/60 mt-2 uppercase tracking-[0.2em]" style={{ fontFamily: 'Inter, sans-serif' }}>CONTEMPORARY DESIGN</p>
      </div>
    </div>,
  ];

  // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Featured Houses Data Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const featuredHouses = [
    { name: 'CAVERLEIGH & CO.', subtitle: 'TIMELESS FASHION', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&auto=format&fit=crop' },
    { name: 'SWARANG BY AMITA', subtitle: 'HERITAGE FASHION', img: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?q=80&w=400&auto=format&fit=crop' },
    { name: 'CCo. MAGAZINE', subtitle: 'EDITORIAL JOURNAL', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop' },
    { name: 'ATELIER NOIR', subtitle: 'CONTEMPORARY DESIGN', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
    { name: 'STUDIO KATHA', subtitle: 'ARCHITECTURE', img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=400&auto=format&fit=crop' },
    { name: 'INKLAND', subtitle: 'ILLUSTRATION', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=400&auto=format&fit=crop' },
    { name: 'AURAA STUDIO', subtitle: 'OBJECTS & HOME', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop' },
    { name: 'SONIC WAVES', subtitle: 'MUSIC & SOUND', img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=400&auto=format&fit=crop' },
  ];

  // Horizontal scroll ref for Featured Houses
  const housesScrollRef = useRef<HTMLDivElement>(null);
  const scrollHouses = (direction: 'left' | 'right') => {
    if (!housesScrollRef.current) return;
    const amount = direction === 'left' ? -320 : 320;
    housesScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F7F3EF] text-[#1A1A1A] overflow-x-hidden">
      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â HERO Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="relative border-b border-[rgba(109,15,49,0.08)]">
        {/* Subtle floral/decorative background accent (left side) */}
        <div className="absolute left-0 top-0 w-[300px] h-full opacity-[0.04] pointer-events-none overflow-hidden hidden lg:block">
          <svg viewBox="0 0 300 600" fill="none" className="w-full h-full">
            <path d="M150 50 C100 100, 50 200, 80 350 C110 500, 200 550, 250 600" stroke="#950606" strokeWidth="1.5" fill="none" />
            <circle cx="80" cy="120" r="20" fill="#950606" opacity="0.3" />
            <circle cx="120" cy="180" r="15" fill="#950606" opacity="0.2" />
            <circle cx="60" cy="250" r="12" fill="#950606" opacity="0.25" />
            <path d="M75 110 C85 95, 95 100, 90 115 C85 130, 70 125, 75 110Z" fill="#950606" opacity="0.4" />
            <path d="M115 170 C125 155, 135 160, 130 175 C125 190, 110 185, 115 170Z" fill="#950606" opacity="0.3" />
            <path d="M55 240 C65 225, 75 230, 70 245 C65 260, 50 255, 55 240Z" fill="#950606" opacity="0.35" />
          </svg>
        </div>
        <div className="absolute left-[-79px] top-40 transform -translate-y-1/2 w-[250px] h-[250px] opacity-[0.90] pointer-events-none">
          <img src="flower.png" alt="flower" className='' />
          <img src="flower.png" alt="flower" className='w-[200px] h-[200px]' />
        </div>
        <div className="max-w-[1440px] mx-auto pl-8 md:pl-32 pr-10 md:pr-20 py-5 md:py-7">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-center">
            {/* â”€â”€ Left: Editorial Text â”€â”€ */}
            <div className="relative z-10 max-w-[700px]">
              <FadeUp>
                <h1 className="text-[#1A1A1A] leading-[1.15] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 500 }}>
                  <span className="block text-[32px] sm:text-[44px] md:text-[56px] lg:text-[64px] whitespace-nowrap">Discover Originals.</span>
                  <span className="block text-[32px] sm:text-[44px] md:text-[56px] lg:text-[64px] whitespace-nowrap">
                    Publish{' '}
                    <span className="text-[#950606] inline-flex">
                      <RotatingText
                        texts={['Culture.', 'Stories.', 'Vision.', 'Art.']}
                        rotationInterval={2800}
                        staggerDuration={0.03}
                        staggerFrom="first"
                        mainClassName="inline-flex overflow-hidden"
                        elementLevelClassName="text-[#950606]"
                        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-110%', opacity: 0 }}
                      />
                    </span>
                  </span>
                  <span className="block text-[32px] sm:text-[44px] md:text-[56px] lg:text-[64px] whitespace-nowrap">
                    Build <span className="text-[#950606]">Legacy.</span>
                  </span>
                </h1>
              </FadeUp>

              <FadeUp delay={0.2}>
                <p className="mt-8 text-[16px] md:text-[18px] text-[#5C5C5C] leading-[1.7] max-w-[480px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span> is the global platform for emerging designers,
                  artists and creative thinkers. Discover original work,
                  connect with creators and be part of a movement
                  shaping the future of culture.
                </p>
              </FadeUp>

              <FadeUp delay={0.35}>
                <MagneticButton
                  className="mt-8 inline-flex items-center gap-3 bg-[#950606] text-white px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.2em] border border-[#950606] cursor-pointer rounded-sm transition-all hover:bg-[#950606] hover:border-[#950606]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  onClick={() => navigate('shop')}
                >
                  EXPLORE CREATORS
                  <span className="text-[18px]"><CusArrowRight /></span>
                </MagneticButton>
              </FadeUp>
            </div>

            {/* Ã¢â€ â‚¬Ã¢â€ â‚¬ Right: Overlapping Magazine Stack Ã¢â€ â‚¬Ã¢â€ â‚¬ */}
            <div className="relative flex justify-center lg:justify-end items-center">
              <FadeUp delay={0.3}>
                <div className="relative w-[320px] h-[420px] md:w-[420px] md:h-[520px]">
                  <Stack
                    cards={magazineCards}
                    randomRotation={true}
                    sensitivity={180}
                    sendToBackOnClick={true}
                    autoplay={true}
                    autoplayDelay={4000}
                    pauseOnHover={true}
                    animationConfig={{ stiffness: 220, damping: 22 }}
                  />
                </div>
              </FadeUp>

              {/* Circular "Curated Originals" Badge */}
              <motion.div
                className="absolute -bottom-4 -right-2 md:bottom-4 md:right-0 w-[90px] h-[90px] md:w-[110px] md:h-[110px] z-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <svg viewBox="0 0 120 120" className="w-full h-full">
                  <defs>
                    <path id="circlePath" d="M60,60 m-48,0 a48,48 0 1,1 96,0 a48,48 0 1,1 -96,0" />
                  </defs>
                  <circle cx="60" cy="60" r="55" fill="#F7F3EF" stroke="#950606" strokeWidth="1" opacity="0.9" />
                  <text fill="#950606" fontSize="9" fontWeight="700" letterSpacing="3" fontFamily="Inter, sans-serif" style={{ textTransform: 'uppercase' }}>
                    <textPath href="#circlePath">CURATED ORIGINALS · GLOBAL PLATFORM · </textPath>
                  </text>
                  <text x="60" y="58" textAnchor="middle" fill="#1A1A1A" fontSize="24" fontWeight="800" fontFamily="Syne, sans-serif">Re</text>
                  <text x="60" y="78" textAnchor="middle" fill="#950606" fontSize="24" fontWeight="800" fontFamily="Syne, sans-serif">OG</text>
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  STATS BAR Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  */}
      <section className="border-b border-[rgba(109,15,49,0.08)]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-8 md:py-10">
          <div className="flex flex-wrap items-center gap-6 md:gap-0">
            {/* Stats */}
            <div className="flex flex-wrap flex-1 gap-6 md:gap-0">
              {[
                { value: 100, suffix: '+', label: 'CREATIVE HOUSES' },
                { value: 500, suffix: '+', label: 'ORIGINAL PROJECTS' },
                { value: 20, suffix: '+', label: 'DISCIPLINES' },
                { value: 1, suffix: '', label: 'GLOBAL PLATFORM' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`flex-1 min-w-[120px] ${i < 3 ? 'md:border-r md:border-[rgba(109,15,49,0.08)]' : ''} ${i > 0 ? 'md:pl-8' : ''} ${i < 3 ? 'md:pr-8' : ''}`}
                >
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    className="block text-[32px] md:text-[40px] font-bold text-[#1A1A1A] leading-none"
                    style={{ fontFamily: 'Syne, sans-serif' }}
                  />
                  <span className="text-[10px] md:text-[11px] font-semibold text-[#5C5C5C] uppercase tracking-[0.15em] mt-1 block" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Description + Star */}
            <div className="flex items-center gap-4 md:ml-8 md:pl-8 md:border-l md:border-[rgba(109,15,49,0.08)]">
              <p className="text-[13px] md:text-[14px] text-[#5C5C5C] leading-[1.6] max-w-[260px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Uniting creativity from fashion, art, design, craft, architecture, music and beyond.
              </p>
              <motion.div
                animate={{ rotate: [0, 180, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="text-[#950606]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  FEATURED HOUSES Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  */}
      <section className="z-10 border-b border-[rgba(109,15,49,0.08)] py-12 md:py-16">
        <div className="max-w-[1440px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12 items-start">
            {/* Left: Section Label */}
            <FadeUp>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#950606]" style={{ fontFamily: 'Inter, sans-serif' }}>FEATURED HOUSES</span>
                  <div className="h-px flex-1 bg-[#950606]/20" />
                </div>
                <h2 className="text-[32px] md:text-[40px] font-bold leading-[1.05] tracking-[-0.02em] text-[#1A1A1A]" style={{ fontFamily: 'Syne, sans-serif' }}>
                  A World of<br />Visionaries
                </h2>
                <p className="mt-4 text-[14px] text-[#5C5C5C] leading-[1.7] max-w-[240px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Independent houses and magazines that inspire, innovate and lead culture forward.
                </p>
                <button
                  onClick={() => navigate('shop')}
                  className="mt-6 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-[#950606] hover:text-[#950606] transition-colors group "
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  VIEW ALL HOUSES
                </button>
              </div>
            </FadeUp>

            {/* Right: Horizontal Scroll Gallery */}
            <div className="relative">
              {/* Scroll Arrows */}
              <div className="absolute -top-2 right-0 z-10 hidden md:flex gap-2">
                <button
                  onClick={() => scrollHouses('left')}
                  className="w-9 h-9 flex items-center justify-center border border-[rgba(109,15,49,0.15)] rounded-full text-[#5C5C5C] hover:text-[#950606] hover:border-[#950606] transition-all bg-[#F7F3EF]"
                  aria-label="Scroll left"
                >
                  <Icon name="arrow_back" size={16} />
                </button>
                <button
                  onClick={() => scrollHouses('right')}
                  className="w-9 h-9 flex items-center justify-center border border-[rgba(109,15,49,0.15)] rounded-full text-[#5C5C5C] hover:text-[#950606] hover:border-[#950606] transition-all bg-[#F7F3EF]"
                  aria-label="Scroll right"
                >
                  <Icon name="arrow_forward" size={16} />
                </button>
              </div>

              <div
                ref={housesScrollRef}
                className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featuredHouses.map((house, i) => (
                  <FadeUp key={house.name} delay={i * 0.06}>
                    <HoverLift
                      className="flex-shrink-0 w-[160px] md:w-[180px] cursor-pointer group"
                      glowColor="rgba(109,15,49,0.08)"
                    >
                      <div className="border border-[rgba(109,15,49,0.08)] rounded-sm overflow-hidden bg-white" onClick={() => navigate('shop')}>
                        {/* Card Image */}
                        <div className="aspect-[3/4] overflow-hidden relative">
                          <img
                            src={house.img}
                            alt={house.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 right-3">
                            <h4 className="text-white text-[13px] md:text-[14px] font-bold leading-[1.15] tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
                              {house.name}
                            </h4>
                          </div>
                        </div>
                        {/* Card Footer */}
                        <div className="p-3 text-center">
                          <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {house.subtitle}
                          </span>
                        </div>
                      </div>
                    </HoverLift>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1A1A1A] overflow-hidden">
        <ScrollVelocity
          texts={[
            <span key="t1" className="flex items-center gap-6 md:gap-10">
              {['OFFGRID', 'ORIGINALS', 'CULTURE', 'LEGACY', 'CREATORS', 'DESIGN', 'FASHION', 'ART'].map((word, i) => (
                <span key={i} className="flex items-center gap-6 md:gap-10">
                  {word === 'OFFGRID' ? (
                    <span className="text-[20px] md:text-[28px] font-bold tracking-[0.1em] uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>
                      <span className="text-[#F7F3EF]">Re</span><span className="text-[#950606]">OG</span>
                    </span>
                  ) : (
                    <span className="text-[#F7F3EF] text-[20px] md:text-[28px] font-bold tracking-[0.1em] uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>{word}</span>
                  )}
                </span>
              ))}
            </span>
          ]}
          velocity={40}
          numCopies={4}
          scrollerClassName="!text-[20px] !md:text-[28px] !leading-none md:!leading-none pt-3"
          scrollerStyle={{ fontSize: 'inherit' }}
        />
      </section>

      {/* Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  CURATIONS Ã¢â‚¬â€  EDITORIAL CARDS Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 md:py-20">
        <FadeUp>
          <div className="flex items-center gap-3 mb-10">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#950606]" style={{ fontFamily: 'Inter, sans-serif' }}>
              THIS WEEK IN <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span>
            </span>
            <div className="h-px flex-1 bg-[#950606]/20" />
          </div>
        </FadeUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
          {[
            { num: '01', title: 'Minimalist Rigor', desc: 'A collection focused on the removal of the unnecessary. Pure form, pure function.', img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop' },
            { num: '02', title: 'Electric Pulse', desc: "The boldest colors in our inventory, curated for those who refuse to blend in.", img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop' },
            { num: '03', title: 'The Over-Layer', desc: 'Mastering the art of technical layering for the urban nomad.', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop' },
          ].map((c, i) => (
            <FadeUp key={c.num} delay={i * 0.1}>
              <HoverLift className="bg-white cursor-pointer group" glowColor="rgba(109,15,49,0.08)">
                <div className="border border-[rgba(109,15,49,0.08)] rounded-sm overflow-hidden">
                  <HoverReveal
                    className="aspect-[4/5]"
                    overlay={
                      <div className="text-white">
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C6FF00]" style={{ fontFamily: 'Inter, sans-serif' }}>Curation {c.num}</span>
                        <h4 className="text-[22px] font-bold mt-1" style={{ fontFamily: 'Syne, sans-serif' }}>{c.title}</h4>
                      </div>
                    }
                  >
                    <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                  </HoverReveal>
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#950606]" style={{ fontFamily: 'Inter, sans-serif' }}>Curation {c.num}</span>
                    <h4 className="text-[20px] md:text-[22px] font-bold mt-1.5 text-[#1A1A1A]" style={{ fontFamily: 'Syne, sans-serif' }}>{c.title}</h4>
                    <p className="text-[14px] text-[#5C5C5C] mt-2 leading-[1.6]" style={{ fontFamily: 'Inter, sans-serif' }}>{c.desc}</p>
                  </div>
                </div>
              </HoverLift>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  LATEST DESIGNS Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  */}
      {designsFeed.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 border-t border-[rgba(109,15,49,0.08)]">
          <FadeUp>
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#950606] block mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>MARKETPLACE</span>
                <h3 className="text-[28px] md:text-[36px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.1 }}>Latest Designs</h3>
              </div>
              <button onClick={() => navigate('shop')} className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#950606] hover:text-[#950606] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                View All Ã¢â€ â€™
              </button>
            </div>
          </FadeUp>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {designsFeed.slice(0, 8).map((item: any, idx: number) => {
              const image = item.image || item.fileUrl;
              const displayPrice = item.price || (typeof item.baseCostINR === 'number' && typeof item.designerPriceINR === 'number'
                ? `Ã¢â€šÂ¹${(item.baseCostINR + item.designerPriceINR).toLocaleString('en-IN')}`
                : 'Coming soon');
              const cardTarget = item.productId ? `/product/${item.productId}` : `/creator/${item.designerId}`;
              return (
                <FadeUp key={item.id} delay={idx * 0.05}>
                  <HoverLift
                    className="bg-white group cursor-pointer"
                    glowColor="rgba(109,15,49,0.08)"
                  >
                    <div className="border border-[rgba(109,15,49,0.08)] rounded-sm overflow-hidden" onClick={() => navigate(cardTarget)}>
                      <div className="aspect-[3/4] overflow-hidden relative">
                        {image
                          ? <img src={image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          : <GradientImg gradient={GRADIENTS.tee} className="h-full" />
                        }
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#950606] font-semibold flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.designerName || (<span><span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span> Creator</span>)}
                        </p>
                        <h5 className="text-[14px] font-semibold text-[#1A1A1A] mt-1 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{item.title}</h5>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-[#5C5C5C] text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>{displayPrice}</p>
                          <button
                            className="text-[#950606] text-[10px] font-bold uppercase tracking-[0.15em] hover:text-[#950606] transition-colors"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                            onClick={e => {
                              e.stopPropagation();
                              onAddToCart({ name: item.title, price: displayPrice, gradient: GRADIENTS.tee });
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </HoverLift>
                </FadeUp>
              );
            })}
          </div>
        </section>
      )}

      {/* Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  CREATOR SPOTLIGHT Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â Ã¢â€¢Â  */}
      <section className="py-16 md:py-20" style={{ background: 'linear-gradient(180deg, #F1E7DE 0%, #EDE4DB 100%)' }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <SlideIn direction="left">
              <div className="relative">
                <div className="pl-6" style={{ borderLeft: '3px solid #950606' }}>
                  <span className="text-[11px] text-[#950606] uppercase font-bold tracking-[0.25em] mb-2 inline-block" style={{ fontFamily: 'Inter, sans-serif' }}>Creator Spotlight</span>
                  <h3 className="text-[36px] md:text-[52px] font-bold mb-4 text-[#1A1A1A]" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.05, letterSpacing: '-0.02em' }}>Elara Void</h3>
                </div>
                <p className="text-[16px] md:text-[18px] text-[#5C5C5C] mb-10 leading-[1.7] mt-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  "Architecture is just clothing for space. My designs aim to be space for the human body to redefine itself." <br /><br />
                  Void's collection, <strong className="text-[#1A1A1A]">Subterranean Echoes</strong>, explores the intersection of brutalist shapes and soft textiles.
                </p>
                <div className="flex gap-10">
                  {[
                    { value: 12, label: 'Drops', suffix: '' },
                    { value: 4800, label: 'Followers', suffix: '' },
                    { value: 98, label: 'Sales', suffix: '%' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <AnimatedCounter
                        value={stat.value}
                        suffix={stat.suffix}
                        className="block text-[28px] font-bold text-[#950606]"
                        style={{ fontFamily: 'Syne, sans-serif' }}
                      />
                      <span className="text-[10px] uppercase text-[#5C5C5C] font-bold tracking-[0.15em]" style={{ fontFamily: 'Inter, sans-serif' }}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SlideIn>
            <SlideIn direction="right">
              <div className="relative">
                <TiltCard className="w-full">
                  <div className="w-full h-[320px] md:h-[480px] overflow-hidden rounded-sm shadow-xl grayscale hover:grayscale-0 transition-all duration-1000" style={{ border: '1px solid rgba(109,15,49,0.12)' }}>
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop" alt="Elara Void Portrait" className="w-full h-full object-cover" />
                  </div>
                </TiltCard>
                <motion.div
                  className="absolute -top-6 -right-6 w-24 h-24 flex items-center justify-center rounded-full p-3 shadow-lg"
                  style={{ background: '#C6FF00', rotate: 12 }}
                  whileHover={{ scale: 1.1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span className="text-[#3D5A00] text-[8px] text-center leading-tight font-bold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="text-[#1A1A1A]">Re</span><span className="text-[#950606]">OG</span> EXCLUSIVE ARTIST
                  </span>
                </motion.div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â TESTIMONIALS Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="py-16 md:py-20" style={{ background: '#1A1A1A' }}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-16">
          <FadeUp>
            <div className="text-center mb-12">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#950606] block mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>COMMUNITY</span>
              <h3 className="text-[28px] md:text-[36px] font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                What Creators <span className="text-[#C6FF00]">&</span> Collectors Say
              </h3>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                quote: (
                  <span>
                    "<span className="text-[#F7F3EF]">Re</span><span className="text-[#950606]">OG</span> isn't just a store; it's a statement. The quality of the limited parka I received is unparalleled."
                  </span>
                ),
                author: '— Julian R.',
                location: 'Tokyo',
                product: 'Limited Parka'
              },
              { quote: '"The creator transparency here is something else. Knowing the story behind the piece makes it worth so much more."', author: '— Sarah M.', location: 'Berlin', product: 'Creator Collab Tee' },
              { quote: '"The digital twin verification is genius. I can prove my gear is authentic in both the physical and digital worlds."', author: '— Leo K.', location: 'New York', product: 'Verified Hoodie' },
            ].map((t, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <div className="pl-6 h-full" style={{ borderLeft: '2px solid #950606' }}>
                  <div className="flex text-[#C6FF00] mb-4">
                    {[...Array(5)].map((_, j) => <Icon key={j} name="star" fill={1} size={16} className="text-[#C6FF00]" />)}
                  </div>
                  <p className="text-[15px] md:text-[17px] italic mb-6 text-[#F7F3EF] leading-[1.7]" style={{ fontFamily: 'Inter, sans-serif' }}>{t.quote}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold" style={{ background: '#950606' }}>
                      {t.author.charAt(2)}
                    </div>
                    <div>
                      <span className="text-[12px] font-semibold text-white block" style={{ fontFamily: 'Inter, sans-serif' }}>{t.author}</span>
                      <span className="text-[10px] text-[#5C5C5C]" style={{ fontFamily: 'Inter, sans-serif' }}>{t.location} Ã‚Â· {t.product}</span>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â NEWSLETTER CTA Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-16 py-16 md:py-20">
        <FadeUp>
          <div className="p-8 md:p-16 rounded-sm flex flex-col md:flex-row items-center gap-10 text-white border border-[rgba(109,15,49,0.12)]" style={{ background: '#950606' }}>
            <div className="flex-1">
              <h3 className="text-[28px] md:text-[36px] font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>Join the Inner Circle</h3>
              <p className="text-[16px] text-white/80 leading-[1.6]" style={{ fontFamily: 'Inter, sans-serif' }}>Get early access to drops, creator interviews, and secret showroom events.</p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <form className="flex flex-col sm:flex-row gap-4" onSubmit={e => e.preventDefault()}>
                <input className="flex-1 bg-white/10 border border-white/25 text-white placeholder-white/50 p-4 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#C6FF00] backdrop-blur-sm text-[14px]" placeholder="YOUR EMAIL ADDRESS" type="email" style={{ fontFamily: 'Inter, sans-serif' }} />
                <MagneticButton
                  type="submit"
                  className="bg-[#C6FF00] text-[#3D5A00] font-bold px-8 py-4 rounded-sm uppercase text-[13px] tracking-[0.15em] border-0 cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  SUBSCRIBE
                </MagneticButton>
              </form>
              <p className="text-[10px] mt-4 text-white/40 font-bold uppercase tracking-[0.15em]" style={{ fontFamily: 'Inter, sans-serif' }}>Respecting your inbox since 2024.</p>
            </div>
          </div>
        </FadeUp>
      </section>

      <Footer />
    </div>
  );
};

