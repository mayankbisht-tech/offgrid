import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode, FormEvent } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Page = 'home' | 'shop' | 'product' | 'creator' | 'dashboard' | 'studio-upload' | 'studio-pricing' | 'studio-review';

interface CartItem { name: string; price: string; gradient: string; qty: number; }
type AuthMode = 'signin' | 'signup';
type UserRole = 'consumer' | 'designer' | 'manufacturer';

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────
const Icon = ({ name, fill = 0, size = 24, className = '' }: { name: string; fill?: number; size?: number; className?: string; key?: number | string }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`, fontSize: size }}
  >
    {name}
  </span>
);

// Gradient placeholder for product images
const GradientImg = ({ gradient, className = '', children }: { gradient: string; className?: string; children?: ReactNode }) => (
  <div className={`w-full h-full flex items-end justify-center ${className}`} style={{ background: gradient }}>
    {children}
  </div>
);

const GRADIENTS = {
  parka: 'linear-gradient(135deg, #241910 0%, #aa3000 60%, #d43f00 100%)',
  hoodie: 'linear-gradient(135deg, #1a1a1a 0%, #5c4037 50%, #aa3000 100%)',
  tee: 'linear-gradient(135deg, #fff8f5 0%, #ffeadb 50%, #ffb59e 100%)',
  sneakers: 'linear-gradient(135deg, #aa3000 0%, #d43f00 50%, #ff6b35 100%)',
  frames: 'linear-gradient(135deg, #241910 0%, #3a2e24 50%, #5c4037 100%)',
  print: 'linear-gradient(135deg, #bdf200 0%, #4f6600 50%, #241910 100%)',
  vessel: 'linear-gradient(135deg, #241910 0%, #3a2e24 70%, #5c4037 100%)',
  cap: 'linear-gradient(135deg, #fff1e8 0%, #ffeadb 50%, #ffa07a 100%)',
  pants: 'linear-gradient(135deg, #bdf200 0%, #4f6600 100%)',
  wallet: 'linear-gradient(135deg, #241910 0%, #5c4037 100%)',
  hero: 'linear-gradient(135deg, #aa3000 0%, #d43f00 30%, #ffa07a 70%, #fff8f5 100%)',
  portrait: 'linear-gradient(180deg, #ffeadb 0%, #ffb59e 50%, #aa3000 100%)',
  art1: 'linear-gradient(135deg, #241910 0%, #aa3000 40%, #bdf200 100%)',
  art2: 'linear-gradient(135deg, #bdf200 0%, #4f6600 40%, #241910 100%)',
  art3: 'linear-gradient(135deg, #ffb59e 0%, #aa3000 50%, #241910 100%)',
  workspace: 'linear-gradient(135deg, #fff8f5 0%, #ffeadb 50%, #f4dfcf 100%)',
};

// ─────────────────────────────────────────────
// TOP NAV BAR
// ─────────────────────────────────────────────
const TopNav = ({
  currentPage,
  navigate,
  cartCount,
  onCartClick,
  onAuthClick,
  onSearchClick,
}: {
  currentPage: Page;
  navigate: (p: Page) => void;
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onSearchClick: () => void;
}) => (
  <nav className="w-full sticky top-0 z-50 bg-[#fff8f5]/90 backdrop-blur-md border-b border-[#e6beb2]">
    <div className="flex items-center justify-between px-12 h-20 max-w-[1200px] mx-auto">
      <div className="flex items-center gap-10">
        <button
          onClick={() => navigate('home')}
          className="font-bold tracking-tighter text-[#aa3000] text-[32px] leading-none"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          OFFGRID
        </button>
        <div className="hidden md:flex gap-6 items-center">
          {(['shop', 'creator', 'product', 'home'] as Page[]).map((pg, i) => {
            const labels = ['Shop', 'Creators', 'Drops', 'About'];
            const active = currentPage === pg;
            return (
              <button
                key={pg}
                onClick={() => navigate(pg)}
                className={`text-[18px] leading-[1.6] font-normal transition-colors ${active ? 'text-[#aa3000] border-b-2 border-[#aa3000] pb-1' : 'text-[#5c4037] hover:text-[#aa3000]'}`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {labels[i]}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Search */}
        <button
          onClick={onSearchClick}
          className="grid h-10 w-10 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors"
          aria-label="Search"
        >
          <Icon name="search" size={24} />
        </button>
        {/* Cart */}
        <button
          onClick={onCartClick}
          className="relative grid h-10 w-10 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors"
          aria-label="Cart"
        >
          <Icon name="shopping_cart" size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#aa3000] text-white text-[10px] font-bold">
              {cartCount}
            </span>
          )}
        </button>
        {/* Account / Sign In */}
        <button
          onClick={onAuthClick}
          className="grid h-10 w-10 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors"
          aria-label="Account"
        >
          <Icon name="person" size={24} />
        </button>
      </div>
    </div>
  </nav>
);

// ─────────────────────────────────────────────
// AUTH MODAL
// ─────────────────────────────────────────────
const FIELD = ({
  label, type = 'text', value, onChange, placeholder, required = false, hint,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean; hint?: string;
}) => (
  <div>
    <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>
      {label}{required && <span className="text-[#aa3000] ml-0.5">*</span>}
    </label>
    <input
      type={type} required={required} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-[#e6beb2] px-4 py-3 text-[14px] focus:outline-none focus:border-[#aa3000] transition-colors rounded"
      style={{ fontFamily: 'Inter, sans-serif' }}
    />
    {hint && <p className="text-[11px] text-[#5c4037] mt-1 opacity-70" style={{ fontFamily: 'Inter, sans-serif' }}>{hint}</p>}
  </div>
);

const AuthModal = ({ onClose, navigate }: { onClose: () => void; navigate: (p: Page) => void }) => {
  const [mode, setMode]         = useState<AuthMode>('signin');
  const [step, setStep]         = useState(1);   // signup only: 1=role, 2=basic, 3=role-specific
  const [role, setRole]         = useState<UserRole>('consumer');
  // sign-in fields
  const [siEmail, setSiEmail]   = useState('');
  const [siPass, setSiPass]     = useState('');
  // sign-up step 2
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [pass, setPass]         = useState('');
  const [passConf, setPassConf] = useState('');
  // designer step 3
  const [username, setUsername] = useState('');
  const [dCity, setDCity]       = useState('');
  const [portfolio, setPortfolio] = useState('');
  // manufacturer step 3
  const [bizName, setBizName]   = useState('');
  const [mCity, setMCity]       = useState('');
  const [gst, setGst]           = useState('');
  const [prints, setPrints]     = useState<string[]>([]);

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const switchMode = (m: AuthMode) => { setMode(m); setStep(1); };

  /* ── SIGN IN submit ── */
  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    onClose();
  };

  /* ── SIGN UP step navigation ── */
  const totalSteps = role === 'consumer' ? 2 : 3;

  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) { setStep(s => s + 1); return; }
    // final submit
    onClose();
    if (role === 'designer' || role === 'manufacturer') navigate('dashboard');
  };

  const togglePrint = (t: string) =>
    setPrints(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const roleCards: { id: UserRole; icon: string; label: string; desc: string }[] = [
    { id: 'consumer',     icon: 'shopping_bag',           label: 'Shopper',      desc: 'Browse & buy exclusive drops' },
    { id: 'designer',     icon: 'palette',                label: 'Designer',     desc: 'Upload art & earn royalties' },
    { id: 'manufacturer', icon: 'precision_manufacturing', label: 'Manufacturer', desc: 'Fulfill print orders' },
  ];

  const inputCls = 'w-full bg-white border border-[#e6beb2] px-4 py-3 text-[14px] focus:outline-none focus:border-[#aa3000] transition-colors rounded';
  const labelCls = 'text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider';
  const font = { fontFamily: 'Inter, sans-serif' };

  /* ── step labels ── */
  const stepLabels = role === 'consumer'
    ? ['Choose role', 'Account info']
    : role === 'designer'
    ? ['Choose role', 'Account info', 'Creator profile']
    : ['Choose role', 'Account info', 'Business details'];

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#241910]/60 backdrop-blur-sm overflow-y-auto py-6 px-4"
    >
      <div className="relative w-full max-w-lg bg-[#fff8f5] border border-[#e6beb2] shadow-[8px_8px_0px_0px_#aa3000]">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-[#e6beb2]">
          <div>
            <span className="text-[26px] font-bold tracking-tighter text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif' }}>OFFGRID</span>
            <p className="text-[11px] uppercase tracking-widest text-[#5c4037] font-semibold mt-0.5" style={font}>
              {mode === 'signin' ? 'Welcome back' : stepLabels[step - 1]}
            </p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center text-[#5c4037] hover:text-[#aa3000] hover:bg-[#ffeadb] rounded-full transition-colors" aria-label="Close">
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* ── Mode tabs ── */}
        <div className="flex border-b border-[#e6beb2]">
          {(['signin', 'signup'] as AuthMode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)}
              className={`flex-1 py-3 text-[13px] font-semibold uppercase tracking-wider transition-colors ${mode === m ? 'bg-[#aa3000] text-white' : 'bg-white text-[#5c4037] hover:bg-[#fff1e8]'}`}
              style={font}>
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <div className="px-8 py-7">

          {/* ══════════════════════════════════════
              SIGN IN — simple, no role picker
          ══════════════════════════════════════ */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div>
                <label className={labelCls} style={font}>Email</label>
                <input type="email" required value={siEmail} onChange={e => setSiEmail(e.target.value)}
                  placeholder="you@example.com" className={inputCls} style={font} />
              </div>
              <div>
                <label className={labelCls} style={font}>Password</label>
                <input type="password" required value={siPass} onChange={e => setSiPass(e.target.value)}
                  placeholder="••••••••" className={inputCls} style={font} />
              </div>
              <button type="button" className="text-right text-[12px] text-[#5c4037] hover:text-[#aa3000] transition-colors underline underline-offset-4" style={font}>
                Forgot password?
              </button>
              <button type="submit"
                className="w-full bg-[#aa3000] text-white py-4 text-[14px] font-semibold uppercase tracking-widest hover:bg-[#d43f00] active:scale-95 transition-all rounded mt-1"
                style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}>
                Sign In
              </button>
              <p className="text-center text-[12px] text-[#5c4037]" style={font}>
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-[#aa3000] font-semibold underline underline-offset-4">Sign Up</button>
              </p>
            </form>
          )}

          {/* ══════════════════════════════════════
              SIGN UP — 3 steps
          ══════════════════════════════════════ */}
          {mode === 'signup' && (
            <>
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-7">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <React.Fragment key={i}>
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold border-2 transition-all ${
                      step > i + 1 ? 'bg-[#aa3000] border-[#aa3000] text-white'
                      : step === i + 1 ? 'border-[#aa3000] text-[#aa3000] bg-white'
                      : 'border-[#e6beb2] text-[#5c4037] bg-white'
                    }`} style={font}>
                      {step > i + 1 ? <Icon name="check" size={14} className="text-white" /> : i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                      <div className={`flex-1 h-0.5 transition-all ${step > i + 1 ? 'bg-[#aa3000]' : 'bg-[#e6beb2]'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <form onSubmit={handleNext} className="flex flex-col gap-4">

                {/* ── STEP 1: Role picker ── */}
                {step === 1 && (
                  <>
                    <p className="text-[12px] text-[#5c4037] mb-1" style={font}>How do you want to use OFFGRID?</p>
                    <div className="grid grid-cols-1 gap-3">
                      {roleCards.map(r => (
                        <button key={r.id} type="button" onClick={() => setRole(r.id)}
                          className={`flex items-center gap-4 p-4 border-2 rounded text-left transition-all ${
                            role === r.id
                              ? 'border-[#aa3000] bg-[#ffeadb]'
                              : 'border-[#e6beb2] bg-white hover:border-[#aa3000]/40 hover:bg-[#fff8f5]'
                          }`}>
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${role === r.id ? 'bg-[#aa3000]' : 'bg-[#f4dfcf]'}`}>
                            <Icon name={r.icon} size={22} className={role === r.id ? 'text-white' : 'text-[#aa3000]'} />
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-[#241910]" style={font}>{r.label}</p>
                            <p className="text-[12px] text-[#5c4037]" style={font}>{r.desc}</p>
                          </div>
                          {role === r.id && <Icon name="check_circle" size={20} className="text-[#aa3000] ml-auto shrink-0" fill={1} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* ── STEP 2: Basic account info (all roles) ── */}
                {step === 2 && (
                  <>
                    <FIELD label="Full Name" value={name} onChange={setName} placeholder="Your full name" required />
                    <FIELD label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
                    <FIELD label="Password" type="password" value={pass} onChange={setPass} placeholder="Min. 8 characters" required
                      hint="Use a mix of letters, numbers and symbols." />
                    <FIELD label="Confirm Password" type="password" value={passConf} onChange={setPassConf} placeholder="Re-enter password" required />
                    {pass && passConf && pass !== passConf && (
                      <p className="text-[12px] text-[#ba1a1a] -mt-2" style={font}>Passwords don't match.</p>
                    )}
                  </>
                )}

                {/* ── STEP 3 — DESIGNER ── */}
                {step === 3 && role === 'designer' && (
                  <>
                    <div className="flex items-center gap-2 mb-1 pl-3" style={{ borderLeft: '3px solid #bdf200' }}>
                      <p className="text-[12px] font-bold text-[#aa3000] uppercase tracking-wider" style={font}>Creator Profile</p>
                    </div>
                    <FIELD label="Creator Username" value={username} onChange={setUsername} placeholder="e.g. KENTA_OFF"
                      required hint="This is your public handle on the marketplace." />
                    <FIELD label="City / Base" value={dCity} onChange={setDCity} placeholder="e.g. Tokyo, Berlin" />
                    <FIELD label="Portfolio URL" value={portfolio} onChange={setPortfolio} placeholder="https://yoursite.com or Behance link" />
                    <div className="bg-[#ffeadb] border border-[#e6beb2] rounded p-4">
                      <p className="text-[11px] text-[#5c4037] leading-relaxed" style={font}>
                        Once registered you can upload artwork, set pricing, and start earning royalties on every sale — no inventory needed.
                      </p>
                    </div>
                  </>
                )}

                {/* ── STEP 3 — MANUFACTURER ── */}
                {step === 3 && role === 'manufacturer' && (
                  <>
                    <div className="flex items-center gap-2 mb-1 pl-3" style={{ borderLeft: '3px solid #bdf200' }}>
                      <p className="text-[12px] font-bold text-[#aa3000] uppercase tracking-wider" style={font}>Business Details</p>
                    </div>
                    <FIELD label="Business / Studio Name" value={bizName} onChange={setBizName}
                      placeholder="e.g. PrintNode Mumbai" required />
                    <FIELD label="City" value={mCity} onChange={setMCity} placeholder="e.g. Mumbai" required />
                    <FIELD label="GST Number" value={gst} onChange={setGst} placeholder="22AAAAA0000A1Z5"
                      hint="Optional but required for payouts above ₹50,000/month." />
                    <div>
                      <label className={labelCls} style={font}>Print Capabilities</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {['DTG', 'Screen Print', 'Embroidery', 'Sublimation', 'UV Print'].map(t => (
                          <button key={t} type="button" onClick={() => togglePrint(t)}
                            className={`px-3 py-1.5 rounded text-[12px] font-semibold border transition-all ${
                              prints.includes(t)
                                ? 'bg-[#aa3000] text-white border-[#aa3000]'
                                : 'bg-white text-[#5c4037] border-[#e6beb2] hover:border-[#aa3000]'
                            }`} style={font}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#ffeadb] border border-[#e6beb2] rounded p-4">
                      <p className="text-[11px] text-[#5c4037] leading-relaxed" style={font}>
                        Your account will go through a <strong className="text-[#241910]">24–48 hr verification</strong> before you can accept orders. We'll email you once approved.
                      </p>
                    </div>
                  </>
                )}

                {/* ── STEP 3 — CONSUMER (skip to done at step 2) ── */}

                {/* Navigation buttons */}
                <div className="flex gap-3 pt-1">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(s => s - 1)}
                      className="flex items-center gap-1 px-5 py-3 border border-[#e6beb2] text-[#5c4037] text-[13px] font-semibold rounded hover:bg-[#f4dfcf] transition-colors"
                      style={font}>
                      <Icon name="arrow_back" size={16} /> Back
                    </button>
                  )}
                  <button type="submit"
                    disabled={step === 2 && pass !== passConf && passConf.length > 0}
                    className="flex-1 bg-[#aa3000] text-white py-3.5 text-[14px] font-semibold uppercase tracking-widest hover:bg-[#d43f00] active:scale-95 transition-all rounded disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}>
                    {step < totalSteps ? 'Continue' : (
                      role === 'consumer' ? 'Create Account' :
                      role === 'designer' ? 'Launch Creator Profile' :
                      'Submit for Verification'
                    )}
                  </button>
                </div>
              </form>

              <p className="mt-5 text-center text-[12px] text-[#5c4037]" style={font}>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('signin')} className="text-[#aa3000] font-semibold underline underline-offset-4">Sign In</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CART DRAWER
// ─────────────────────────────────────────────
const CartDrawer = ({
  items,
  onClose,
  onRemove,
  onQtyChange,
  navigate,
}: {
  items: CartItem[];
  onClose: () => void;
  onRemove: (idx: number) => void;
  onQtyChange: (idx: number, delta: number) => void;
  navigate: (p: Page) => void;
}) => {
  const subtotal = items.reduce((acc, i) => acc + parseFloat(i.price.replace('$', '')) * i.qty, 0);

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
                onClick={() => { navigate('shop'); onClose(); }}
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
              onClick={() => { navigate('shop'); onClose(); }}
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

// ─────────────────────────────────────────────
// SEARCH OVERLAY
// ─────────────────────────────────────────────
const SearchOverlay = ({ onClose, navigate }: { onClose: () => void; navigate: (p: Page) => void }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const suggestions = ['Neural Mesh Tee', 'Kinetica Hoodie', 'Neon Samurai', 'Void-Walker Parka', 'Horizon Cap', 'Static Wallet']
    .filter(s => query.length > 1 && s.toLowerCase().includes(query.toLowerCase()));

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 bg-[#241910]/50 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-2xl bg-[#fff8f5] border border-[#e6beb2] shadow-[8px_8px_0px_0px_#aa3000]">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-[#e6beb2]">
          <Icon name="search" size={22} className="text-[#5c4037]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products, creators, drops…"
            className="flex-1 bg-transparent text-[16px] text-[#241910] placeholder-[#916f65] focus:outline-none"
            style={{ fontFamily: 'Inter, sans-serif' }}
            onKeyDown={e => { if (e.key === 'Enter') { navigate('shop'); onClose(); } }}
          />
          <button onClick={onClose} className="text-[#5c4037] hover:text-[#aa3000] transition-colors" aria-label="Close search">
            <Icon name="close" size={20} />
          </button>
        </div>
        {suggestions.length > 0 ? (
          <ul className="py-2">
            {suggestions.map(s => (
              <li key={s}>
                <button
                  onClick={() => { navigate('product'); onClose(); }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-[14px] text-[#241910] hover:bg-[#fff1e8] transition-colors text-left"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Icon name="arrow_forward" size={16} className="text-[#aa3000]" /> {s}
                </button>
              </li>
            ))}
          </ul>
        ) : query.length > 1 ? (
          <div className="px-5 py-6 text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>No results for "{query}"</div>
        ) : (
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase text-[#5c4037] tracking-widest mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {['Hoodie', 'Art Print', 'Streetwear', 'Limited Drop', 'Cyberpunk'].map(tag => (
                <button
                  key={tag}
                  onClick={() => { setQuery(tag); }}
                  className="px-3 py-1 bg-[#ffeadb] text-[#aa3000] text-[12px] font-semibold rounded-full hover:bg-[#aa3000] hover:text-white transition-colors"
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

// ─────────────────────────────────────────────
// SHARED FOOTER
// ─────────────────────────────────────────────
const Footer = () => (
  <footer className="w-full mt-16 bg-[#fff1e8] border-t border-[#e6beb2]">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 px-12 py-10 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-[#241910] text-[24px]" style={{ fontFamily: 'Syne, sans-serif' }}>OFFGRID</h2>
        <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Defining the visual language of the digital underground. Independent, community-driven, and forward-focused.</p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-[#241910] mb-2 uppercase text-[14px] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Shop</h4>
        {['New Arrivals', 'All Products', 'Collaborations', 'Digital Wearables'].map(l => (
          <a key={l} href="#" className="text-[14px] text-[#5c4037] hover:text-[#aa3000] underline underline-offset-4 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</a>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-[#241910] mb-2 uppercase text-[14px] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Company</h4>
        {['About Us', 'Creators Program', 'Sitemap', 'Newsletter'].map(l => (
          <a key={l} href="#" className="text-[14px] text-[#5c4037] hover:text-[#aa3000] underline underline-offset-4 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</a>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-semibold text-[#241910] mb-2 uppercase text-[14px] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Connect</h4>
        {['Instagram', 'TikTok', 'Twitter', 'Discord'].map(l => (
          <a key={l} href="#" className="text-[14px] text-[#5c4037] hover:text-[#aa3000] underline underline-offset-4 transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</a>
        ))}
      </div>
    </div>
    <div className="max-w-[1200px] mx-auto px-12 py-4 border-t border-[#e6beb2] flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>© 2024 OFFGRID Marketplace. All rights reserved.</p>
      <div className="flex gap-6">
        <a href="#" className="text-[10px] text-[#5c4037] hover:text-[#aa3000] transition-all uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Privacy Policy</a>
        <a href="#" className="text-[10px] text-[#5c4037] hover:text-[#aa3000] transition-all uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Terms of Service</a>
      </div>
    </div>
  </footer>
);

// ─────────────────────────────────────────────
// HOME PAGE  (Image 10.html)
// ─────────────────────────────────────────────
const HomePage = ({ navigate, onAddToCart, onAuthClick }: { navigate: (p: Page) => void; onAddToCart: (i: Omit<CartItem,'qty'>) => void; onAuthClick: () => void }) => (
  <div className="bg-[#fff8f5] text-[#241910] overflow-x-hidden">
    {/* Hero */}
    <section className="relative min-h-[870px] flex items-center overflow-hidden px-12" style={{ background: 'linear-gradient(180deg, #aa3000 0%, #fff8f5 100%)' }}>
      <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center z-10">
        <div className="flex flex-col gap-6">
          <span className="uppercase tracking-[0.2em] text-[#852400] text-[10px] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>New Season / 2024</span>
          <h2 className="text-white drop-shadow-sm leading-none" style={{ fontFamily: 'Syne, sans-serif', fontSize: 64, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Art That Lives Nowhere Else</h2>
          <p className="text-white/90 max-w-md text-[18px]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>Discover the vanguard of streetwear and digital collectibles. Exclusive drops from the world's most reclusive creators, curated for the bold.</p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => navigate('shop')}
              className="bg-[#aa3000] text-white font-semibold px-10 py-6 rounded text-[14px] uppercase tracking-wider hover:bg-[#d43f00] transition-all"
              style={{ boxShadow: '4px 4px 0px 0px #3a0b00', fontFamily: 'Inter, sans-serif' }}
            >
              EXPLORE SHOP
            </button>
            <button
              onClick={() => navigate('creator')}
              className="border-2 border-white text-white font-semibold px-10 py-6 rounded text-[14px] uppercase tracking-wider hover:bg-white/10 transition-all"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              VIEW CREATORS
            </button>
          </div>
        </div>
        <div className="relative group hidden lg:block">
          <div className="absolute inset-0 bg-[#bdf200]/20 -rotate-3 scale-105 rounded-xl z-0" />
          <div className="relative z-10 w-full h-[600px] rounded shadow-2xl border-4 border-white overflow-hidden">
            <GradientImg gradient={GRADIENTS.hero} className="h-full" />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#bdf200] rounded-full blur-[120px] opacity-30" />
    </section>

    {/* Category ticker */}
    <div className="w-full bg-[#241910] text-[#fff8f5] py-4 overflow-hidden whitespace-nowrap">
      <div className="inline-flex items-center gap-16 animate-[ticker_30s_linear_infinite]">
        {['GEN-Z FUTURISM', 'BRUTALIST WEAR', 'DIGITAL NOMAD GEAR', 'AVANT-GARDE ARCHIVE', 'NEO-STREETWEAR',
          'GEN-Z FUTURISM', 'BRUTALIST WEAR', 'DIGITAL NOMAD GEAR', 'AVANT-GARDE ARCHIVE', 'NEO-STREETWEAR'].map((t, i) => (
          <span key={i} className="flex items-center gap-4">
            <span className="uppercase italic font-semibold text-[14px] tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>{t}</span>
            <Icon name="star" size={18} className="text-[#fff8f5]" />
          </span>
        ))}
      </div>
    </div>

    {/* Trending Products Bento */}
    <section className="max-w-[1200px] mx-auto px-12 py-16">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h3 className="text-[32px] font-bold" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>Trending Products</h3>
          <div className="w-20 h-1 bg-[#aa3000] mt-2" />
        </div>
        <button onClick={() => navigate('shop')} className="text-[14px] text-[#aa3000] underline underline-offset-4 uppercase font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Main large card */}
        <div
          className="md:col-span-2 md:row-span-2 relative group bg-[#fff1e8] overflow-hidden rounded-lg cursor-pointer min-h-[400px]"
          style={{ border: '1px solid #EDE4D8' }}
          onClick={() => navigate('product')}
        >
          <div className="w-full h-full absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <GradientImg gradient={GRADIENTS.parka} className="h-full" />
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
            <span className="bg-[#bdf200] text-[#526b00] px-2 py-1 text-[10px] font-bold uppercase rounded mb-2 inline-block" style={{ fontFamily: 'Inter, sans-serif' }}>Best Seller</span>
            <h4 className="text-white text-[24px] font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>Void-Walker Parka</h4>
            <p className="text-white/80 text-[14px] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>$450.00</p>
            <button className="bg-white text-[#241910] text-[14px] font-semibold px-6 py-2 rounded-sm hover:bg-[#aa3000] hover:text-white transition-colors uppercase" style={{ fontFamily: 'Inter, sans-serif' }} onClick={() => onAddToCart({ name: 'Void-Walker Parka', price: '$450.00', gradient: GRADIENTS.parka })}>QUICK ADD</button>
          </div>
        </div>
        {/* Small cards */}
        {[
          { name: 'Neural Frames 01', price: '$120.00', gradient: GRADIENTS.frames },
          { name: 'Kinetic Soles L2', price: '$280.00', gradient: GRADIENTS.sneakers },
        ].map(p => (
          <div key={p.name} className="bg-white group cursor-pointer" style={{ border: '1px solid #EDE4D8' }} onClick={() => navigate('product')}>
            <div className="overflow-hidden rounded h-64 mb-4">
              <div className="w-full h-full transition-transform duration-500 group-hover:scale-110">
                <GradientImg gradient={p.gradient} className="h-full" />
              </div>
            </div>
            <div className="p-4">
              <h5 className="text-[14px] font-semibold text-[#241910]" style={{ fontFamily: 'Inter, sans-serif' }}>{p.name}</h5>
              <p className="text-[#5c4037] text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }}>{p.price}</p>
            </div>
          </div>
        ))}
        {/* Alert banner */}
        <div className="md:col-span-2 bg-[#bdf200]/10 border-2 border-[#bdf200] p-10 flex flex-col justify-center items-center text-center">
          <h5 className="text-[24px] font-semibold text-[#241910] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Exclusive Creator Drop</h5>
          <p className="text-[16px] text-[#5c4037] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Limited to 50 pieces worldwide. Each item comes with a verified digital twin.</p>
          <button className="bg-[#241910] text-[#fff8f5] text-[14px] font-semibold px-10 py-6 rounded hover:bg-[#aa3000] transition-all uppercase" style={{ fontFamily: 'Inter, sans-serif' }} onClick={onAuthClick}>SIGN UP FOR ALERTS</button>
        </div>
      </div>
    </section>

    {/* Creator Spotlight */}
    <section className="bg-[#fae4d5] py-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="pl-6" style={{ borderLeft: '4px solid #bdf200' }}>
              <span className="text-[14px] text-[#aa3000] uppercase font-semibold tracking-wider mb-1 inline-block" style={{ fontFamily: 'Inter, sans-serif' }}>Creator Spotlight</span>
              <h3 className="text-[48px] font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.1, letterSpacing: '-0.01em' }}>Elara Void</h3>
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
            <div className="w-full h-[500px] overflow-hidden rounded-sm border border-[#916f65] shadow-xl grayscale hover:grayscale-0 transition-all duration-1000">
              <GradientImg gradient={GRADIENTS.portrait} className="h-full" />
            </div>
            <div className="absolute -top-10 -right-10 bg-[#bdf200] w-32 h-32 flex items-center justify-center rounded-full rotate-12 p-4 shadow-lg">
              <span className="text-[#526b00] text-[10px] text-center leading-tight font-bold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>OFFGRID EXCLUSIVE ARTIST</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* This Week in OffGrid */}
    <section className="max-w-[1200px] mx-auto px-12 py-16">
      <h3 className="text-[32px] font-bold text-center mb-10 italic tracking-tight" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>"This Week in OffGrid"</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { num: '01', title: 'Minimalist Rigor', desc: 'A collection focused on the removal of the unnecessary. Pure form, pure function.', g: GRADIENTS.frames, scale: false },
          { num: '02', title: 'Electric Pulse', desc: "The boldest colors in our inventory, curated for those who refuse to blend in.", g: GRADIENTS.sneakers, scale: true },
          { num: '03', title: 'The Over-Layer', desc: 'Mastering the art of technical layering for the urban nomad.', g: GRADIENTS.hoodie, scale: false },
        ].map(c => (
          <div key={c.num} className={`flex flex-col gap-4 p-6 bg-white hover:shadow-lg transition-shadow cursor-pointer ${c.scale ? 'scale-105 z-10' : ''}`} style={{ border: '1px solid #EDE4D8' }}>
            <div className="aspect-square overflow-hidden rounded">
              <GradientImg gradient={c.g} className="h-full" />
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
      <div className="max-w-[1200px] mx-auto px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { quote: '"OFFGRID isn\'t just a store; it\'s a statement. The quality of the limited parka I received is unparalleled."', author: '— Julian R., Tokyo' },
          { quote: '"The creator transparency here is something else. Knowing the story behind the piece makes it worth so much more."', author: '— Sarah M., Berlin' },
          { quote: '"The digital twin verification is genius. I can prove my gear is authentic in both the physical and digital worlds."', author: '— Leo K., New York' },
        ].map((t, i) => (
          <div key={i} className="pl-6" style={{ borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="flex text-[#bdf200] mb-4">
              {[...Array(5)].map((_, j) => <Icon key={j} name="star" fill={1} size={20} className="text-[#bdf200]" />)}
            </div>
            <p className="text-[18px] italic mb-6" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>{t.quote}</p>
            <span className="text-[14px] font-semibold uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>{t.author}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Newsletter */}
    <section className="max-w-[1200px] mx-auto px-12 py-16">
      <div className="bg-[#aa3000] p-16 rounded-xl flex flex-col md:flex-row items-center gap-10 text-white">
        <div className="flex-1">
          <h3 className="text-[32px] font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Join the Inner Circle</h3>
          <p className="text-[18px]" style={{ fontFamily: 'Inter, sans-serif' }}>Get early access to drops, creator interviews, and secret showroom events.</p>
        </div>
        <div className="flex-1 w-full max-w-md">
          <form className="flex flex-col sm:flex-row gap-4">
            <input className="flex-1 bg-white/10 border border-white/30 text-white placeholder-white/60 p-6 rounded focus:outline-none focus:ring-2 focus:ring-[#bdf200]" placeholder="YOUR EMAIL ADDRESS" type="email" style={{ fontFamily: 'Inter, sans-serif' }} />
            <button className="bg-[#bdf200] text-[#526b00] font-semibold px-10 py-6 rounded hover:opacity-90 transition-opacity uppercase text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }} type="submit">SUBSCRIBE</button>
          </form>
          <p className="text-[10px] mt-4 text-white/60 font-bold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Respecting your inbox since 2024.</p>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

// ─────────────────────────────────────────────
// SHOP PAGE  (Image 14.html)
// ─────────────────────────────────────────────
const ShopPage = ({ navigate, onAddToCart }: { navigate: (p: Page) => void; onAddToCart: (i: Omit<CartItem,'qty'>) => void }) => {
  const products = [
    { name: 'Neural Mesh Tee', price: '$75.00', badge: 'New Drop', gradient: GRADIENTS.tee },
    { name: 'Kinetica Hoodie', price: '$120.00', badge: null, gradient: GRADIENTS.hoodie },
    { name: 'Onyx Pulse Print', price: '$55.00', badge: null, gradient: GRADIENTS.print },
    { name: 'Brutalist Vessel 01', price: '$180.00', badge: null, gradient: GRADIENTS.vessel },
    { name: 'Syntax Error Tee', price: '$68.00', badge: null, gradient: GRADIENTS.tee },
    { name: 'Horizon Cap', price: '$45.00', badge: null, gradient: GRADIENTS.cap },
    { name: 'Neo-Utility Pants', price: '$145.00', badge: null, gradient: GRADIENTS.pants },
    { name: 'Static Wallet', price: '$90.00', badge: null, gradient: GRADIENTS.wallet },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFF8F5 0%, #FFD0B0 50%, #FFB59E 100%)' }}>
      <main className="max-w-[1200px] mx-auto px-12 py-10">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-10">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Categories</h3>
              <ul className="space-y-2">
                {['T-Shirts', 'Hoodies', 'Accessories', 'Art Prints', 'Collectibles'].map((c, i) => (
                  <li key={c}>
                    <a href="#" className={`flex items-center justify-between text-[14px] font-semibold py-2 px-4 rounded transition-all ${i === 0 ? 'bg-[#d43f00] text-white' : 'hover:bg-[#fae4d5]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                      {c} <Icon name="chevron_right" size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Filter by Price</h3>
              <div className="space-y-2">
                {[['$0 - $50', false], ['$50 - $150', true], ['$150+', false]].map(([l, checked]) => (
                  <label key={l as string} className="flex items-center gap-4 group cursor-pointer">
                    <input type="checkbox" defaultChecked={checked as boolean} className="w-4 h-4 rounded-sm border-[#916f65] text-[#aa3000] focus:ring-[#aa3000]" />
                    <span className={`text-[14px] ${checked ? 'text-[#aa3000] font-bold' : 'text-[#241910] group-hover:text-[#aa3000]'} transition-colors`} style={{ fontFamily: 'Inter, sans-serif' }}>{l as string}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Filter by Style</h3>
              <div className="flex flex-wrap gap-2">
                {[['Minimalist', true, '#bdf200', '#526b00'], ['Cyberpunk', false, '#fff', '#241910'], ['Retro', false, '#fff', '#241910'], ['Abstract', true, '#d43f00', '#fff'], ['Brutalist', false, '#fff', '#241910']].map(([label, active, bg, fg]) => (
                  <button key={label as string} className="px-4 py-1 rounded-full text-[12px] font-medium border transition-all hover:bg-[#aa3000] hover:text-white hover:border-[#aa3000]" style={{ background: bg as string, color: fg as string, border: active ? '1px solid #aa3000' : '1px solid #e6beb2', fontFamily: 'Inter, sans-serif' }}>
                    {label as string}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="flex items-baseline justify-between mb-10 pl-6" style={{ borderLeft: '4px solid #bdf200' }}>
              <h1 className="text-[48px] font-bold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.1, letterSpacing: '-0.01em' }}>Browse All Art</h1>
              <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Showing 24 of 142 results</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {products.map(p => (
                <div
                  key={p.name}
                  className="group bg-white border border-[#e6beb2] rounded p-4 transition-all duration-300"
                  style={{ }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0px 0px #aa3000'; (e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px, -2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
                >
                  <div
                    className="relative overflow-hidden mb-4 bg-[#ffeadb] cursor-pointer"
                    style={{ aspectRatio: '3/4' }}
                    onClick={() => navigate('product')}
                  >
                    <div className="w-full h-full transition-transform duration-500 group-hover:scale-110">
                      <GradientImg gradient={p.gradient} className="h-full" />
                    </div>
                    {p.badge && (
                      <span className="absolute top-2 right-2 bg-[#bdf200] text-[#526b00] text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>{p.badge}</span>
                    )}
                    {/* Quick add overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-[#aa3000] py-2 text-white text-[11px] font-bold uppercase tracking-wider text-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => { e.stopPropagation(); onAddToCart({ name: p.name, price: p.price, gradient: p.gradient }); }}
                    >
                      + Quick Add
                    </div>
                  </div>
                  <h4 className="text-[18px] font-semibold text-[#241910] mb-1 cursor-pointer hover:text-[#aa3000] transition-colors" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }} onClick={() => navigate('product')}>{p.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[18px] font-bold text-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>{p.price}</span>
                    <button
                      onClick={() => onAddToCart({ name: p.name, price: p.price, gradient: p.gradient })}
                      className="text-[#5c4037] hover:text-[#aa3000] transition-colors"
                      aria-label="Add to cart"
                    >
                      <Icon name="shopping_bag" size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="mt-16 flex justify-center gap-4">
              {[1, 2, 3].map(n => (
                <button key={n} className={`w-12 h-12 flex items-center justify-center border rounded text-[14px] font-semibold transition-all hover:bg-[#aa3000] hover:text-white ${n === 2 ? 'border-[#aa3000] bg-[#aa3000] text-white font-bold' : 'border-[#e6beb2]'}`} style={{ ...(n === 2 ? { boxShadow: '4px 4px 0px 0px #aa3000' } : {}), fontFamily: 'Inter, sans-serif' }}>
                  {n}
                </button>
              ))}
              <button className="w-12 h-12 flex items-center justify-center border border-[#e6beb2] rounded hover:bg-[#aa3000] hover:text-white transition-all">
                <Icon name="chevron_right" size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────
// PRODUCT DETAIL PAGE  (Image 12.html)
// ─────────────────────────────────────────────
const ProductPage = ({ navigate, onAddToCart }: { navigate: (p: Page) => void; onAddToCart: (i: Omit<CartItem,'qty'>) => void }) => {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedEdition, setSelectedEdition] = useState('sunset');

  return (
    <div className="text-[#241910]" style={{ background: 'linear-gradient(180deg, #fff8f5 0%, #fae4d5 50%, #ffeadb 100%)', minHeight: '100vh' }}>
      <main className="max-w-[1200px] mx-auto px-12 mt-10">
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white border border-[#e6beb2] rounded-lg overflow-hidden group relative" style={{ aspectRatio: '4/5' }}>
              <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                <GradientImg gradient={GRADIENTS.hoodie} className="h-full" />
              </div>
              <div className="absolute top-4 left-4">
                <span className="bg-[#bdf200] text-[#526b00] px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Limited Drop</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[GRADIENTS.art1, GRADIENTS.art2, GRADIENTS.art3, ''].map((g, i) => (
                <div key={i} className={`aspect-square bg-white border border-[#e6beb2] rounded hover:border-[#aa3000] transition-colors cursor-pointer overflow-hidden ${i === 3 ? 'flex items-center justify-center bg-[#fff1e8]' : ''}`}>
                  {i < 3 ? <GradientImg gradient={g} className="h-full" /> : <Icon name="play_circle" size={40} className="text-[#aa3000]" />}
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Collection 04 / Neon Bushido</span>
            </div>
            <h1 className="text-[#241910] mb-2 leading-none" style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Neon Samurai Hoodie</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-[#916f65] bg-[#ffeadb] flex items-center justify-center overflow-hidden">
                  <div style={{ background: GRADIENTS.portrait, width: '100%', height: '100%' }} />
                </div>
                <span className="text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>KENTA_OFF</span>
              </div>
              <span className="w-1 h-1 bg-[#e6beb2] rounded-full" />
              <span className="text-[24px] font-semibold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif' }}>$185.00</span>
            </div>
            <p className="text-[18px] text-[#5c4037] mb-10" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
              Crafted from 450GSM heavy-weight French Terry. Featuring high-density discharge printing and reflective 3M accents for a true cyber-street aesthetic.
            </p>

            {/* Size selector */}
            <div className="space-y-6 mb-16">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter mb-4 block text-[#241910]" style={{ fontFamily: 'Inter, sans-serif' }}>Select Size</label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                    <button key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-12 h-12 rounded flex items-center justify-center text-[14px] font-semibold transition-all ${selectedSize === s ? 'border-2 border-[#aa3000]' : 'border border-[#e6beb2] hover:border-[#aa3000]'}`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-tighter mb-4 block text-[#241910]" style={{ fontFamily: 'Inter, sans-serif' }}>Edition</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedEdition('sunset')}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 text-[14px] font-semibold uppercase transition-all ${selectedEdition === 'sunset' ? 'border-2 border-[#aa3000] bg-[#d43f00] text-white' : 'border border-[#e6beb2] hover:border-[#aa3000]'}`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <Icon name="bolt" size={14} /> Sunset Mode
                  </button>
                  <button
                    onClick={() => setSelectedEdition('stealth')}
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 text-[14px] font-semibold uppercase transition-all ${selectedEdition === 'stealth' ? 'border-2 border-[#aa3000]' : 'border border-[#e6beb2] hover:border-[#aa3000]'}`}
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
                className="w-full h-16 bg-[#aa3000] text-white rounded-lg uppercase flex items-center justify-center gap-4 text-[24px] font-semibold transition-all"
                style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}
                onClick={() => onAddToCart({ name: 'Neon Samurai Hoodie', price: '$185.00', gradient: GRADIENTS.hoodie })}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '6px 6px 0px 0px #aa3000'; (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px,-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
              >
                Add to Cart <Icon name="arrow_forward" size={24} className="text-white" />
              </button>
              <div className="flex items-center justify-between px-2 py-4 border-t border-[#e6beb2] mt-2">
                <span className="flex items-center gap-1 text-[12px] text-[#5c4037] uppercase font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Icon name="local_shipping" size={14} /> Free Worldwide Shipping
                </span>
                <span className="flex items-center gap-1 text-[12px] text-[#5c4037] uppercase font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Icon name="verified" size={14} /> Authenticity Guaranteed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Bento */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-16 py-16 border-t border-[#e6beb2]">
          {/* About the Design */}
          <div className="md:col-span-8 p-10 rounded-xl" style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', border: '1px solid #EDE4D8', borderLeft: '4px solid #bdf200' }}>
            <h2 className="text-[32px] font-bold mb-6 uppercase" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>About the Design</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-[18px] text-[#5c4037] mb-4" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                  The "Neon Samurai" is a tribute to the collision of traditional artisan spirits and the frantic pace of digital metropolis life. KENTA_OFF spent 6 months refining the back graphic.
                </p>
                <ul className="space-y-2">
                  {['Hand-numbered limited run (500 units)', 'Signature KENTA_OFF embroidery', 'Oversized "Hacker" Fit'].map(l => (
                    <li key={l} className="flex items-center gap-2 text-[14px] font-semibold uppercase text-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="w-2 h-2 bg-[#aa3000] rounded-full" /> {l}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg overflow-hidden border border-[#e6beb2]">
                <GradientImg gradient={GRADIENTS.workspace} className="h-full min-h-[200px]" />
              </div>
            </div>
          </div>

          {/* More from creator */}
          <div className="md:col-span-4 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-[24px] font-semibold uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>By KENTA_OFF</h3>
              <a href="#" className="text-[10px] font-bold underline uppercase tracking-widest text-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }}>View All</a>
            </div>
            <div className="space-y-4">
              {[
                { cat: 'T-Shirt', name: 'Digital Ronin Tee', price: '$65.00', g: GRADIENTS.tee },
                { cat: 'Accessory', name: 'Signal Loss Cap', price: '$45.00', g: GRADIENTS.cap },
              ].map(item => (
                <div key={item.name} className="flex gap-4 bg-white p-2 border border-[#e6beb2] rounded-lg group cursor-pointer hover:border-[#aa3000] transition-all">
                  <div className="w-24 h-24 rounded bg-[#fff1e8] overflow-hidden">
                    <div className="w-full h-full transition-transform group-hover:scale-110">
                      <GradientImg gradient={item.g} className="h-full" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] font-bold uppercase text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.cat}</span>
                    <span className="text-[14px] font-semibold group-hover:text-[#aa3000] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{item.name}</span>
                    <span className="text-[14px] font-semibold text-[#aa3000] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#bdf200] p-6 rounded-lg border border-[#526b00]/20">
              <p className="text-[14px] font-bold text-[#526b00] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>CREATOR VERIFIED</p>
              <p className="text-[14px] text-[#526b00]" style={{ fontFamily: 'Inter, sans-serif' }}>KENTA_OFF has been a verified OFFGRID creator since 2022, specializing in digital-to-physical textile translation.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────
// CREATOR PROFILE PAGE  (Image 2.html)
// ─────────────────────────────────────────────
const CreatorPage = ({ navigate }: { navigate: (p: Page) => void }) => (
  <div className="text-[#241910]" style={{ background: 'linear-gradient(180deg, #fff8f5 0%, #fae4d5 50%, #ebd6c7 100%)', minHeight: '100vh' }}>
    <main className="max-w-[1200px] mx-auto px-12 py-10">
      {/* Hero */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center mb-16">
        <div className="md:col-span-5 relative">
          <div className="aspect-square bg-white p-1 border border-[#e6beb2] overflow-hidden" style={{ boxShadow: '4px 4px 0px 0px #aa3000' }}>
            <div className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden">
              <GradientImg gradient={GRADIENTS.portrait} className="h-full" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-[#bdf200] px-6 py-2 border border-[#526b00]">
            <span className="text-[14px] font-semibold text-[#526b00] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Verified Creator</span>
          </div>
        </div>
        <div className="md:col-span-7 flex flex-col items-start gap-6 mt-10 md:mt-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#aa3000] uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Multidisciplinary Artist</span>
            <h1 className="text-[#241910] leading-none mb-2" style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>VALERIE_K</h1>
          </div>
          <div className="pl-6 max-w-xl" style={{ borderLeft: '4px solid #bdf200' }}>
            <p className="text-[18px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
              Exploring the intersection of digital decay and high-performance streetwear. Based between Berlin and Tokyo, building tactile artifacts for the modern nomad.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            <button
              className="bg-[#aa3000] text-white px-16 py-4 text-[14px] font-semibold uppercase border border-[#aa3000] hover:bg-[#d43f00] transition-all"
              style={{ boxShadow: '4px 4px 0px 0px #aa3000', fontFamily: 'Inter, sans-serif' }}
              onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translate(4px,4px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
              onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px 0px 0px #aa3000'; }}
            >
              Follow Creator
            </button>
            <button className="bg-transparent text-[#241910] px-10 py-4 text-[14px] font-semibold uppercase border border-[#241910] hover:bg-[#fff1e8] transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
              Message
            </button>
          </div>
          <div className="flex gap-10 mt-4">
            {[['12.4K', 'Collectors'], ['42', 'Works'], ['8.2 ETH', 'Volume']].map(([v, l]) => (
              <div key={l} className="flex flex-col">
                <span className="text-[24px] font-semibold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>{v}</span>
                <span className="text-[12px] uppercase text-[#5c4037] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Works filter */}
      <div className="flex items-center justify-between border-b border-[#e6beb2] pb-4 mb-10">
        <h2 className="text-[32px] font-bold text-[#241910] uppercase tracking-tight" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>Collected Works</h2>
        <div className="flex gap-4">
          {['Latest', 'Popular', 'Archives'].map((t, i) => (
            <button key={t} className={`text-[14px] font-semibold transition-colors ${i === 0 ? 'text-[#aa3000] border-b-2 border-[#aa3000] pb-1' : 'text-[#5c4037] hover:text-[#aa3000]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Bento works grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Card 1 large */}
        <div className="md:col-span-8 group">
          <div className="bg-white border border-[#e6beb2] p-6 h-full flex flex-col cursor-pointer transition-all"
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0px 0px #aa3000'; (e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px,-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
          >
            <div className="overflow-hidden mb-6 relative" style={{ aspectRatio: '16/9' }}>
              <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                <GradientImg gradient={GRADIENTS.parka} className="h-full" />
              </div>
              <div className="absolute top-4 left-4 bg-[#4f6600] text-white px-2 py-1 text-[10px] font-bold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Exclusive Drop</div>
            </div>
            <div className="flex justify-between items-end mt-auto">
              <div>
                <span className="text-[10px] font-bold text-[#aa3000] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Drop 001 / Edition of 10</span>
                <h3 className="text-[24px] font-semibold text-[#241910] mt-1" style={{ fontFamily: 'Syne, sans-serif' }}>KINETIC MONOLITH PARKA</h3>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold text-[#5c4037] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Current Floor</span>
                <span className="text-[24px] font-semibold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif' }}>0.85 ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Small cards */}
        {[
          { title: 'MODULAR SLING V2', cat: 'Archive', action: 'View Secondary', price: 'Sold Out', g: GRADIENTS.wallet },
          { title: 'THERMAL SHELL L1', cat: 'Collaborative', action: 'Bid', price: '0.42 ETH', g: GRADIENTS.hoodie },
          { title: 'VECTORS SPRINT', cat: 'Edition of 50', action: 'Buy', price: '0.15 ETH', g: GRADIENTS.sneakers },
          { title: 'VOID WEAVE TEE', cat: 'Conceptual', action: 'Alert Me', price: '-- ETH', g: GRADIENTS.tee },
        ].map((c, i) => (
          <div key={c.title} className="md:col-span-4 group">
            <div className="bg-white border border-[#e6beb2] p-6 flex flex-col cursor-pointer transition-all"
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '6px 6px 0px 0px #aa3000'; (e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px,-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
            >
              <div className="aspect-square overflow-hidden mb-6 relative bg-[#ffeadb]">
                <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                  <GradientImg gradient={c.g} className="h-full" />
                </div>
                {i === 1 && <div className="absolute top-4 right-4 bg-[#d43f00] text-white p-1"><Icon name="bolt" size={20} className="text-white" /></div>}
                {i === 3 && <div className="absolute bottom-4 right-4 bg-[#bdf200] px-2 py-1"><span className="text-[10px] text-[#526b00] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>Coming Soon</span></div>}
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#aa3000] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>{c.cat}</span>
                <h3 className="text-[24px] font-semibold text-[#241910] mt-1" style={{ fontFamily: 'Syne, sans-serif' }}>{c.title}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className={`text-[24px] font-semibold ${i === 3 ? 'text-[#5c4037] opacity-50' : 'text-[#aa3000]'}`} style={{ fontFamily: 'Syne, sans-serif' }}>{c.price}</span>
                  <button className="bg-[#241910] text-[#fff8f5] px-4 py-2 text-[10px] font-bold uppercase hover:bg-[#aa3000] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{c.action}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured callout */}
      <section className="mt-16 bg-[#fae4d5] p-16 flex flex-col md:flex-row items-center gap-10 border border-[#e6beb2] relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#aa3000] rounded-full blur-[100px] opacity-20" />
        <div className="relative z-10 md:w-1/2">
          <span className="text-[10px] font-bold text-[#aa3000] uppercase tracking-[0.2em] mb-4 block" style={{ fontFamily: 'Inter, sans-serif' }}>Behind the process</span>
          <h2 className="text-[#241910] mb-6" style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>REDEFINING TEXTILE TOPOLOGY.</h2>
          <p className="text-[18px] text-[#5c4037] mb-10" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
            Every piece in the 001 Drop was crafted using procedural generation algorithms mapped onto traditional Japanese weaving patterns.
          </p>
          <a href="#" className="text-[#241910] text-[14px] font-semibold uppercase border-b-2 border-[#aa3000] pb-1 inline-block" style={{ fontFamily: 'Inter, sans-serif' }}>Read the Manifesto</a>
        </div>
        <div className="md:w-1/2 relative aspect-square">
          <div className="w-full h-full border border-[#e6beb2] overflow-hidden" style={{ boxShadow: '4px 4px 0px 0px #aa3000' }}>
            <GradientImg gradient={GRADIENTS.workspace} className="h-full" />
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

// ─────────────────────────────────────────────
// STUDIO SIDEBAR
// ─────────────────────────────────────────────
const StudioSidebar = ({ navigate, activeItem = 'designs' }: { navigate: (p: Page) => void; activeItem?: string }) => {
  const items = [
    { icon: 'dashboard', label: 'Overview', page: 'dashboard' as Page, key: 'overview' },
    { icon: 'palette', label: 'My Designs', page: 'studio-upload' as Page, key: 'designs' },
    { icon: 'insights', label: 'Analytics', page: 'dashboard' as Page, key: 'analytics' },
    { icon: 'payments', label: 'Payouts', page: 'dashboard' as Page, key: 'payouts' },
    { icon: 'settings', label: 'Settings', page: 'dashboard' as Page, key: 'settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen sticky top-0 p-4 bg-[#fff1e8] border-r border-[#e6beb2] w-64 shrink-0">
      <div className="mb-10 px-2">
        <h1 className="text-[24px] font-semibold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>OffGrid</h1>
        <p className="text-[12px] text-[#5c4037] opacity-70 uppercase tracking-widest font-medium mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Creator Studio</p>
      </div>
      <div className="mb-4 px-4">
        <div className="w-10 h-10 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#aa3000] font-bold text-sm mb-2">JD</div>
        <p className="text-[14px] font-semibold text-[#241910]" style={{ fontFamily: 'Inter, sans-serif' }}>Jane Doe</p>
        <p className="text-[10px] uppercase text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Elite Partner</p>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {items.map(item => {
          const isActive = item.key === activeItem;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.page)}
              className={`flex items-center gap-4 px-4 py-2 text-[14px] font-semibold rounded-lg transition-all ${isActive ? 'bg-[#aa3000] text-white translate-x-1' : 'text-[#5c4037] hover:bg-[#f4dfcf]'}`}
              style={{ fontFamily: 'Inter, sans-serif', ...(isActive ? { boxShadow: '4px 4px 0px 0px #aa3000' } : {}) }}
            >
              <Icon name={item.icon} size={20} fill={isActive ? 1 : 0} className={isActive ? 'text-white' : ''} /> {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#e6beb2]/30">
        <button className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:bg-[#f4dfcf] transition-all rounded-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Icon name="help_outline" size={20} /> Help
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:text-[#ba1a1a] transition-all rounded-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Icon name="logout" size={20} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

// Studio header
const StudioHeader = ({ navigate }: { navigate: (p: Page) => void }) => (
  <header className="flex justify-between items-center w-full px-12 h-20 border-b border-[#e6beb2] bg-transparent">
    <div className="flex items-center gap-10">
      <div className="hidden lg:flex items-center gap-6">
        {[['Dashboard', 'dashboard'], ['Earnings', 'dashboard'], ['Marketplace', 'shop']].map(([l, pg]) => (
          <button key={l} onClick={() => navigate(pg as Page)} className="text-[14px] font-semibold text-[#5c4037] hover:text-[#aa3000] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</button>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-4">
      <button className="hidden md:flex items-center gap-2 bg-[#aa3000] text-white px-6 py-2 text-[14px] font-semibold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all" style={{ fontFamily: 'Inter, sans-serif' }} onClick={() => navigate('studio-upload')}>
        <Icon name="upload" size={18} className="text-white" /> Upload Design
      </button>
      <Icon name="notifications" size={24} className="text-[#5c4037] cursor-pointer hover:text-[#aa3000]" />
      <Icon name="account_circle" size={24} className="text-[#5c4037] cursor-pointer hover:text-[#aa3000]" />
    </div>
  </header>
);

// ─────────────────────────────────────────────
// DASHBOARD PAGE  (Image 4.html)
// ─────────────────────────────────────────────
const DashboardPage = ({ navigate }: { navigate: (p: Page) => void }) => (
  <div className="flex min-h-screen text-[#241910]" style={{ backgroundColor: '#fff8f5', backgroundImage: 'radial-gradient(at 0% 0%, #ffeadb 0px, transparent 50%), radial-gradient(at 100% 100%, #f4dfcf 0px, transparent 50%)', backgroundAttachment: 'fixed' }}>
    <StudioSidebar navigate={navigate} activeItem="overview" />
    <main className="flex-1 min-w-0">
      <StudioHeader navigate={navigate} />
      <section className="max-w-7xl mx-auto px-12 py-10">
        {/* Greeting */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Welcome back, Jane.</h2>
            <p className="text-[18px] text-[#5c4037] max-w-xl pl-6 mt-2" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6, borderLeft: '4px solid #bdf200' }}>
              Your limited-edition streetwear drops are performing 24% above average this month. Keep the momentum going.
            </p>
          </div>
        </div>

        {/* Stats bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: 'Available Payout', value: '$2,450.00', sub: '+12.5% vs last month', subIcon: 'trending_up', bgIcon: 'payments', color: '#4f6600' },
            { label: 'Active Designs', value: '08', sub: 'Capacity: 8/12 Slots', subIcon: null, bgIcon: 'auto_awesome', color: null },
            { label: 'Global Reach', value: '1.2k', sub: '+ New followers', subIcon: null, bgIcon: null, color: null },
          ].map(s => (
            <div key={s.label} className="p-10 rounded-xl relative overflow-hidden flex flex-col justify-between h-48" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid #e6beb2' }}>
              <div className="z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{s.label}</span>
                <h3 className="text-[#241910] mt-2" style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>{s.value}</h3>
              </div>
              <div className="z-10">
                {s.subIcon && (
                  <div className="flex items-center gap-1 font-semibold text-[14px]" style={{ color: s.color ?? '#4f6600', fontFamily: 'Inter, sans-serif' }}>
                    <Icon name={s.subIcon} size={14} className="" /> {s.sub}
                  </div>
                )}
                {s.label === 'Active Designs' && (
                  <div>
                    <div className="w-full bg-[#f4dfcf] h-1 rounded-full overflow-hidden">
                      <div className="bg-[#aa3000] h-full" style={{ width: '75%' }} />
                    </div>
                    <p className="text-[10px] mt-1 uppercase text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{s.sub}</p>
                  </div>
                )}
                {s.label === 'Global Reach' && (
                  <div className="flex items-center -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[#fff8f5] bg-[#ffdbd0]" />
                    <div className="w-8 h-8 rounded-full border-2 border-[#fff8f5] bg-[#c0f500]" />
                    <div className="w-8 h-8 rounded-full border-2 border-[#fff8f5] bg-[#ebd6c7]" />
                    <span className="ml-4 text-[12px] font-medium text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{s.sub}</span>
                  </div>
                )}
              </div>
              {s.bgIcon && (
                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                  <Icon name={s.bgIcon} size={120} className="text-[#241910]" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active designs */}
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-[24px] font-semibold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>Your Active Designs</h3>
          <a href="#" className="text-[14px] font-semibold text-[#aa3000] flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
            View All <Icon name="arrow_forward" size={14} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Neon Nomad Hoodie', sub: 'Drop #042 • 120 Units Left', badge: 'Selling Fast', badgeBg: '#bdf200', badgeFg: '#526b00', g: GRADIENTS.hoodie },
            { name: 'Cyber-Punk Tee', sub: 'Drop #039 • 450 Units Left', badge: 'Steady', badgeBg: '#f4dfcf', badgeFg: '#5c4037', g: GRADIENTS.tee },
            { name: 'Geometric Longsleeve', sub: 'Drop #038 • 12 Units Left', badge: 'Limited', badgeBg: '#aa3000', badgeFg: '#fff', g: GRADIENTS.art1 },
          ].map(d => (
            <div key={d.name} className="group cursor-pointer" onClick={() => navigate('product')}>
              <div className="relative rounded-lg overflow-hidden border border-[#e6beb2] mb-4" style={{ aspectRatio: '3/4' }}>
                <div className="w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500">
                  <GradientImg gradient={d.g} className="h-full" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase" style={{ background: d.badgeBg, color: d.badgeFg, fontFamily: 'Inter, sans-serif' }}>{d.badge}</span>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[14px] font-semibold text-[#241910]" style={{ fontFamily: 'Inter, sans-serif' }}>{d.name}</h4>
                  <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{d.sub}</p>
                </div>
                <Icon name="more_vert" size={20} className="text-[#5c4037] cursor-pointer hover:text-[#aa3000]" />
              </div>
            </div>
          ))}
          {/* Add new */}
          <div className="group border-2 border-dashed border-[#e6beb2] rounded-lg flex flex-col items-center justify-center hover:bg-[#fff1e8] transition-colors cursor-pointer p-10 text-center" style={{ aspectRatio: '3/4' }} onClick={() => navigate('studio-upload')}>
            <div className="w-16 h-16 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#aa3000] mb-4">
              <Icon name="add" size={32} className="text-[#aa3000]" />
            </div>
            <h4 className="text-[#241910] font-semibold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>New Release</h4>
            <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Push your next design to the OffGrid marketplace</p>
          </div>
        </div>

        {/* Recent activity */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <h3 className="text-[24px] font-semibold text-[#241910] mb-10" style={{ fontFamily: 'Syne, sans-serif' }}>Recent Sales Activity</h3>
            <div className="space-y-4">
              {[
                { item: 'Neon Nomad Hoodie Sold', when: '2 minutes ago • London, UK', amount: '+$45.00', bg: '#ffdbd0', opacity: '1' },
                { item: 'Cyber-Punk Tee Sold (x2)', when: '1 hour ago • Tokyo, JP', amount: '+$70.00', bg: '#c0f500', opacity: '0.8' },
                { item: 'Geometric Longsleeve Sold', when: '4 hours ago • New York, US', amount: '+$38.00', bg: '#ede0d9', opacity: '0.6' },
              ].map(a => (
                <div key={a.item} className="flex items-center justify-between p-6 rounded-lg" style={{ opacity: a.opacity, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid #e6beb2' }}>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded flex items-center justify-center" style={{ background: a.bg }}>
                      <Icon name="shopping_bag" size={20} className="text-[#aa3000]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{a.item}</p>
                      <p className="text-[10px] uppercase text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{a.when}</p>
                    </div>
                  </div>
                  <p className="text-[24px] font-semibold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif' }}>{a.amount}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-10">
            <div className="p-10 bg-[#241910] text-[#fff8f5] rounded-xl">
              <h4 className="font-semibold mb-4" style={{ fontFamily: 'Syne, sans-serif', fontSize: 20 }}>Elite Status Perks</h4>
              <p className="text-[14px] opacity-80 mb-6" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>You've unlocked higher commission rates and featured placement for your next 3 drops.</p>
              <button className="w-full py-4 border border-[#fff8f5] text-[#fff8f5] text-[14px] font-semibold rounded-lg hover:bg-[#fff8f5] hover:text-[#241910] transition-all uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Claim Benefits</button>
            </div>
            <div className="p-10 border border-[#e6beb2] rounded-xl bg-[#fff1e8]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Drop Countdown</span>
              <div className="mt-4 flex gap-4">
                {[['02', 'Days'], ['14', 'Hrs'], ['55', 'Min']].map(([v, l]) => (
                  <div key={l} className="flex-1 text-center">
                    <p className="text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.1 }}>{v}</p>
                    <p className="text-[10px] uppercase text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    {/* Mobile bottom nav */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#f4dfcf] border-t border-[#e6beb2] flex items-center justify-around px-4 z-50">
      {[['dashboard', 'Overview'], ['palette', 'Designs'], ['add', ''], ['insights', 'Stats'], ['settings', 'Settings']].map(([icon, label]) => (
        <button key={icon} onClick={() => navigate('dashboard')} className="flex flex-col items-center gap-1 text-[#aa3000]">
          {icon === 'add'
            ? <div className="-mt-8 w-14 h-14 bg-[#aa3000] rounded-full flex items-center justify-center shadow-lg"><Icon name="add" size={28} className="text-white" /></div>
            : <><Icon name={icon} size={22} /><span className="text-[10px] font-bold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span></>
          }
        </button>
      ))}
    </nav>
  </div>
);

// ─────────────────────────────────────────────
// STUDIO UPLOAD PAGE  (Image 6.html)
// ─────────────────────────────────────────────
const StudioUploadPage = ({ navigate }: { navigate: (p: Page) => void }) => (
  <div className="bg-[#fff8f5] text-[#241910] min-h-screen">
    {/* Top nav for upload flow */}
    <nav className="bg-[#fff8f5] border-b border-[#e6beb2] flex justify-between items-center w-full px-12 h-20 max-w-7xl mx-auto sticky top-0 z-50">
      <button onClick={() => navigate('home')} className="font-bold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1 }}>OffGrid</button>
      <div className="hidden md:flex items-center space-x-6">
        {['Dashboard', 'Earnings', 'Marketplace'].map(l => (
          <button key={l} className="text-[14px] font-semibold text-[#5c4037] hover:text-[#aa3000] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</button>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button><Icon name="notifications" size={24} className="text-[#5c4037]" /></button>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#e6beb2] bg-[#ffdbd0] flex items-center justify-center">
          <span className="text-[#aa3000] font-bold text-sm">JD</span>
        </div>
      </div>
    </nav>
    <main className="max-w-7xl mx-auto px-4 md:px-12 py-10">
      {/* Progress */}
      <div className="mb-16 max-w-2xl mx-auto">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-[10px] font-bold text-[#aa3000] uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>Step 1 of 3</span>
            <h1 className="text-[32px] font-bold mt-1" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>Upload Artwork</h1>
          </div>
          <span className="text-[14px] font-semibold text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>33% Complete</span>
        </div>
        <div className="w-full h-1 bg-[#f4dfcf] rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-[#aa3000] transition-all duration-700" />
        </div>
      </div>

      {/* Bento layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Upload zone (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          <div
            className="bg-white rounded-lg p-10 transition-all duration-300 flex flex-col items-center justify-center min-h-[400px] text-center cursor-pointer group"
            style={{ border: '2px dashed #EDE4D8' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#aa3000'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#EDE4D8'; }}
          >
            <div className="w-16 h-16 bg-[#ffdbd0] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Icon name="cloud_upload" size={28} className="text-[#aa3000]" />
            </div>
            <h2 className="text-[24px] font-semibold mb-2" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>Drag &amp; drop artwork</h2>
            <p className="text-[16px] text-[#5c4037] max-w-sm mx-auto mb-10" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
              High-resolution PNG or SVG files preferred. Max file size: 50MB. Minimum dimensions: 3000px.
            </p>
            <button
              className="bg-[#aa3000] text-white text-[14px] font-semibold px-10 py-4 rounded hover:brightness-110 transition-all"
              style={{ boxShadow: '4px 4px 0px 0px #aa3000', fontFamily: 'Inter, sans-serif' }}
            >
              Browse Files
            </button>
          </div>
          {/* Editorial callout */}
          <div className="bg-[#fff1e8] p-6 rounded-lg" style={{ borderLeft: '4px solid #c0f500' }}>
            <p className="text-[16px] text-[#241910] italic" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
              "Your creation is the soul of the garment. Ensure your vectors are clean and your raster images are at 300 DPI for the best physical reproduction."
            </p>
            <div className="mt-4 flex gap-2">
              <span className="bg-[#bdf200] text-[#526b00] px-2 py-1 text-[10px] font-bold rounded uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Quality Guide</span>
              <span className="bg-[#bdf200] text-[#526b00] px-2 py-1 text-[10px] font-bold rounded uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>SVG Tips</span>
            </div>
          </div>
        </div>

        {/* Mockup preview (5 cols) */}
        <div className="md:col-span-5 sticky top-24">
          <div className="bg-[#ffeadb] rounded-xl overflow-hidden border border-[#EDE4D8] relative" style={{ aspectRatio: '4/5' }}>
            <GradientImg gradient={GRADIENTS.hoodie} className="h-full w-full" />
            {/* Artwork placement overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
              <div className="border-2 border-[#aa3000] border-dashed w-48 h-64 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[#aa3000] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Artwork Area</span>
              </div>
            </div>
            {/* Floating indicator */}
            <div className="absolute bottom-6 left-6 right-6 bg-[#fff8f5]/90 backdrop-blur-md p-4 rounded border border-[#e6beb2] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#5c4037] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Preview</p>
                <p className="text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Heavyweight Hoodie</p>
              </div>
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#1A1410] border border-white" />
                <div className="w-6 h-6 rounded-full bg-[#EDE4D8] border border-white" />
                <div className="w-6 h-6 rounded-full bg-[#FF4D00] border border-white" />
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button className="flex-1 bg-[#f4dfcf] border border-[#e6beb2] text-[#241910] text-[14px] font-semibold py-4 rounded hover:bg-[#ebd6c7] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
              Save Draft
            </button>
            <button
              onClick={() => navigate('studio-pricing')}
              className="flex-1 bg-[#aa3000] text-white text-[14px] font-semibold py-4 rounded transition-all"
              style={{ boxShadow: '4px 4px 0px 0px #aa3000', fontFamily: 'Inter, sans-serif' }}
            >
              Continue to Step 2
            </button>
          </div>
        </div>
      </div>
    </main>

    {/* Mobile bottom nav */}
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#fff1e8] border-t border-[#e6beb2] flex justify-around items-center h-16 z-50">
      {[['dashboard', 'Dashboard'], ['palette', 'Designs'], ['add_circle', 'Upload'], ['insights', 'Analytics'], ['settings', 'Settings']].map(([icon, label]) => (
        <button key={icon} className="flex flex-col items-center text-[#5c4037]">
          <Icon name={icon} size={22} />
          <span className="text-[10px]" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>
        </button>
      ))}
    </nav>
  </div>
);

// ─────────────────────────────────────────────
// STUDIO PRICING PAGE  (Image 8.html)
// ─────────────────────────────────────────────
const StudioPricingPage = ({ navigate }: { navigate: (p: Page) => void }) => {
  const [margins, setMargins] = useState({ hoodie: 50, tshirt: 33, print: 200 });

  const products = [
    { id: 'hoodie' as keyof typeof margins, name: 'Oversized Hoodie', base: 32, minM: 10, maxM: 100, step: 5, gradient: GRADIENTS.hoodie },
    { id: 'tshirt' as keyof typeof margins, name: 'Essential Tee', base: 18, minM: 10, maxM: 100, step: 1, gradient: GRADIENTS.tee },
    { id: 'print' as keyof typeof margins, name: 'Gallery Print (12x18)', base: 12, minM: 10, maxM: 300, step: 10, gradient: GRADIENTS.print },
  ];

  return (
    <div className="flex text-[#241910] overflow-x-hidden min-h-screen" style={{ background: '#fff8f5' }}>
      <StudioSidebar navigate={navigate} activeItem="designs" />
      <main className="flex-1 min-h-screen relative flex flex-col">
        {/* Step header */}
        <header className="h-20 flex items-center justify-between px-12 bg-[#fff8f5] border-b border-[#e6beb2] sticky top-0 z-50">
          <div className="flex items-center gap-10">
            <button onClick={() => navigate('studio-upload')} className="text-[#5c4037] hover:text-[#aa3000] transition-colors"><Icon name="arrow_back" size={22} /></button>
            <div>
              <h1 className="text-[24px] font-semibold text-[#aa3000] leading-none" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>Step 2: Pricing</h1>
              <p className="text-[10px] text-[#5c4037] mt-1 uppercase font-bold tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>PRODUCT SELECTION & REVENUE CONFIG</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <div className="w-12 h-1.5 bg-[#aa3000]" />
              <div className="w-12 h-1.5 bg-[#aa3000]" />
              <div className="w-12 h-1.5 bg-[#f4dfcf]" />
            </div>
            <span className="text-[10px] text-[#aa3000] uppercase tracking-widest font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>Step 02/03</span>
          </div>
        </header>

        {/* Perspective grid background */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ede4d8 1px, transparent 1px), linear-gradient(to bottom, #ede4d8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="flex-1 p-12 max-w-5xl mx-auto w-full z-10">
          {/* Editorial callout */}
          <div className="pl-6 mb-10" style={{ borderLeft: '4px solid #bdf200' }}>
            <p className="text-[24px] font-semibold text-[#5c4037] italic leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              "Your art deserves a premium margin. Balance your reach with your revenue by selecting high-impact products."
            </p>
          </div>

          {/* Products */}
          <div className="grid grid-cols-1 gap-6">
            {products.map(p => {
              const margin = margins[p.id];
              const earn = p.base * (margin / 100);
              const total = p.base + earn;
              const minPrice = (p.base * 1.1).toFixed(2);
              const maxPrice = (p.base * (1 + p.maxM / 100)).toFixed(2);
              return (
                <div key={p.id} className="bg-white border border-[#e6beb2] p-6 relative transition-all hover:shadow-[8px_8px_0px_0px_#ffeadb]">
                  <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                    <div className="flex items-center gap-6 shrink-0">
                      {/* Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-[#f4dfcf] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#aa3000]" />
                      </label>
                      <div className="w-32 h-32 bg-[#f4dfcf] border border-[#e6beb2] flex items-center justify-center p-4 overflow-hidden">
                        <GradientImg gradient={p.gradient} className="h-full" />
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <h3 className="text-[#241910] font-semibold text-xl" style={{ fontFamily: 'Syne, sans-serif' }}>{p.name}</h3>
                          <span className="text-[10px] font-bold text-[#5c4037] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>BASE COST: ${p.base.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-[#5c4037] mb-1 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Total Price</p>
                          <p className="text-[24px] font-semibold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif' }}>${total.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[14px] font-semibold text-[#241910] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Creator Margin</label>
                          <span className="text-[20px] font-semibold text-[#a8d700]" style={{ fontFamily: 'Syne, sans-serif' }}>{margin}%</span>
                        </div>
                        <input
                          type="range"
                          min={p.minM}
                          max={p.maxM}
                          step={p.step}
                          value={margin}
                          onChange={e => setMargins(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                          className="w-full h-2 bg-[#f4dfcf] rounded-none appearance-none cursor-pointer"
                          style={{ accentColor: '#aa3000' }}
                        />
                        <div className="flex justify-between text-[10px] font-bold text-[#5c4037] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <span>MIN: ${minPrice}</span>
                          <span>YOU EARN: ${earn.toFixed(2)}</span>
                          <span>MAX: ${maxPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 border-t-2 border-[#aa3000] pt-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-md">
              <h4 className="text-[14px] font-semibold text-[#241910] uppercase mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Earnings Projection</h4>
              <p className="text-[14px] text-[#5c4037] italic" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                Based on your current selections, your average profit per bundle sale is approximately <strong className="text-[#aa3000]">$46.00</strong>. Pricing can be edited at any time after publishing.
              </p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button className="flex-1 md:px-10 py-4 border border-[#241910] text-[#241910] text-[14px] font-semibold uppercase hover:bg-[#f4dfcf] transition-all tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
                Save Draft
              </button>
              <button
                onClick={() => navigate('studio-review')}
                className="flex-1 md:px-10 py-4 bg-[#aa3000] text-white text-[14px] font-semibold uppercase hover:scale-95 transition-transform tracking-widest"
                style={{ boxShadow: '6px 6px 0px 0px #3a0b00', fontFamily: 'Inter, sans-serif' }}
              >
                Continue to Final Step
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-auto p-4 border-t border-[#e6beb2] bg-[#fff1e8] flex justify-between items-center">
          <p className="text-[10px] font-bold text-[#5c4037] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>OFFGRID STUDIO ENGINE V.4.2</p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-bold text-[#5c4037] hover:text-[#aa3000] underline uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>HELP CENTER</a>
            <a href="#" className="text-[10px] font-bold text-[#5c4037] hover:text-[#aa3000] underline uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>TERMS OF SERVICE</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────
// STUDIO REVIEW PAGE  (Image 2 (2).html)
// ─────────────────────────────────────────────
const StudioReviewPage = ({ navigate }: { navigate: (p: Page) => void }) => (
  <div className="text-[#241910] min-h-screen flex" style={{ background: 'linear-gradient(135deg, #fff8f5 0%, #ffeadb 100%)' }}>
    <StudioSidebar navigate={navigate} activeItem="designs" />
    <main className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-12 h-20 border-b border-[#e6beb2]">
        <div className="flex items-center gap-10">
          <button onClick={() => navigate('home')} className="font-bold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, letterSpacing: '-0.02em' }}>OffGrid</button>
          <nav className="hidden lg:flex items-center gap-6">
            {['Dashboard', 'Earnings', 'Marketplace'].map(l => (
              <button key={l} className="text-[14px] font-semibold text-[#5c4037] hover:text-[#aa3000] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button><Icon name="notifications" size={24} className="text-[#5c4037] hover:text-[#aa3000]" /></button>
          <div className="w-10 h-10 rounded-full bg-[#f4dfcf] border border-[#e6beb2] overflow-hidden">
            <div style={{ background: GRADIENTS.portrait, width: '100%', height: '100%' }} />
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 md:px-12 py-10 max-w-7xl mx-auto w-full">
        {/* Progress stepper */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-md mb-4">
            <span className="text-[10px] font-bold text-[#aa3000] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Step 3 of 3</span>
            <span className="text-[10px] font-bold text-[#5c4037] opacity-60 uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Final Review</span>
          </div>
          <div className="flex gap-1 w-full max-w-md h-1 bg-[#e6beb2] rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-[#aa3000]/40" />
            <div className="w-1/3 h-full bg-[#aa3000]/40" />
            <div className="w-1/3 h-full bg-[#aa3000]" />
          </div>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Design preview */}
            <section className="bg-white rounded-lg p-10 relative overflow-hidden" style={{ border: '1px solid #EDE4D8' }}>
              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-1/2 aspect-square bg-[#f4dfcf] rounded-lg overflow-hidden border border-[#e6beb2]">
                  <GradientImg gradient={GRADIENTS.art1} className="h-full" />
                </div>
                <div className="w-full md:w-1/2 flex flex-col">
                  <h2 className="text-[32px] font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>Neon Drift</h2>
                  <p className="text-[16px] text-[#5c4037] mb-10" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>High-resolution vector design optimized for print-on-demand textiles and accessories.</p>
                  <div className="space-y-4">
                    <h3 className="text-[14px] font-semibold pl-4 text-[#241910]" style={{ borderLeft: '4px solid #bdf200', fontFamily: 'Inter, sans-serif' }}>Selected Products</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Apparel', 'Wall Art', 'Tech Accessories'].map(tag => (
                        <div key={tag} className="px-4 py-2 bg-[#ffeadb] rounded-lg text-[12px] font-medium flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <Icon name="check_circle" size={16} className="text-[#aa3000]" /> {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Design info form */}
            <section className="bg-white rounded-lg p-10" style={{ border: '1px solid #EDE4D8' }}>
              <h2 className="text-[24px] font-semibold mb-6" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>Design Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-[#5c4037] uppercase mb-1 block" style={{ fontFamily: 'Inter, sans-serif' }}>Design Title</label>
                  <input
                    className="w-full bg-[#fff1e8] p-4 text-[16px] focus:outline-none focus:border-[#aa3000] transition-colors rounded-lg"
                    style={{ border: '1px solid #EDE4D8', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}
                    type="text"
                    defaultValue="Neon Drift"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#5c4037] uppercase mb-1 block" style={{ fontFamily: 'Inter, sans-serif' }}>Description</label>
                  <textarea
                    className="w-full bg-[#fff1e8] p-4 text-[16px] focus:outline-none focus:border-[#aa3000] transition-colors rounded-lg resize-none"
                    style={{ border: '1px solid #EDE4D8', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}
                    rows={4}
                    defaultValue="A high-contrast exploration of urban motion, blending cyberpunk aesthetics with minimalist composition. Part of the 'OffGrid Pulse' series."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#5c4037] uppercase mb-1 block" style={{ fontFamily: 'Inter, sans-serif' }}>Tags</label>
                  <div className="flex flex-wrap gap-2 items-center p-4 bg-[#fff1e8] rounded-lg" style={{ border: '1px solid #EDE4D8' }}>
                    {['Cyberpunk', 'Minimalist', 'Digital Art'].map(tag => (
                      <span key={tag} className="px-2 py-1 bg-[#bdf200] text-[#526b00] text-[12px] font-medium rounded flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {tag} <button className="text-[#526b00]"><Icon name="close" size={12} /></button>
                      </span>
                    ))}
                    <input className="bg-transparent border-none focus:outline-none text-[14px] w-24" placeholder="Add tag..." type="text" style={{ fontFamily: 'Inter, sans-serif' }} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Earnings summary */}
            <section className="bg-[#f4dfcf] rounded-lg p-10 overflow-hidden relative" style={{ border: '1px solid #EDE4D8' }}>
              <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Icon name="trending_up" size={80} />
              </div>
              <h2 className="text-[24px] font-semibold mb-6" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}>Estimated Earnings</h2>
              <div className="space-y-4">
                {[['Base Tier (15%)', '$4.50 / unit'], ['Elite Bonus (+2%)', '$0.60 / unit']].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center py-2 border-b border-[#e6beb2]/30">
                    <span className="text-[16px]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>{l}</span>
                    <span className="text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4">
                  <span className="font-semibold" style={{ fontFamily: 'Syne, sans-serif', fontSize: 20 }}>Total per Sale</span>
                  <span className="text-[#aa3000] font-semibold" style={{ fontFamily: 'Syne, sans-serif', fontSize: 20 }}>$5.10</span>
                </div>
              </div>
              <p className="mt-10 text-[12px] text-[#5c4037]/70 leading-snug" style={{ fontFamily: 'Inter, sans-serif' }}>
                Earnings are calculated based on the standard marketplace pricing. Final payouts occur every 30 days.
              </p>
            </section>

            {/* Final actions */}
            <section className="space-y-4">
              <button
                className="w-full py-10 bg-[#aa3000] text-white text-[24px] font-semibold rounded-lg flex items-center justify-center gap-4 transition-all transform hover:-translate-y-1 hover:brightness-110"
                style={{ boxShadow: '4px 4px 0px 0px #aa3000', fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }}
                onClick={() => navigate('dashboard')}
              >
                Publish to Shop <Icon name="rocket_launch" size={24} className="text-white" />
              </button>
              <button
                onClick={() => navigate('studio-pricing')}
                className="w-full py-6 text-[14px] font-semibold flex items-center justify-center gap-4 hover:bg-[#f4dfcf] transition-colors"
                style={{ border: '1px solid #EDE4D8', fontFamily: 'Inter, sans-serif' }}
              >
                <Icon name="arrow_back" size={18} /> Back to Product Selection
              </button>
              <p className="text-center text-[10px] font-bold text-[#5c4037]/60 uppercase tracking-widest px-10" style={{ fontFamily: 'Inter, sans-serif' }}>
                By publishing, you agree to the <a href="#" className="underline">Creator Terms</a> and confirm you own the rights to this artwork.
              </p>
            </section>

            {/* Editorial tip */}
            <div className="p-10 bg-[#fff8f5] rounded-r-lg" style={{ borderLeft: '4px solid #bdf200' }}>
              <p className="text-[10px] font-bold text-[#aa3000] uppercase mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Pro Creator Tip</p>
              <blockquote className="text-[16px] italic text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}>
                "Using at least 5 relevant tags like 'cyberpunk' and 'minimalist' can increase your shop visibility by up to 40%."
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function ReferenceApp() {
  const [page, setPage] = useState<Page>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (item: Omit<CartItem, 'qty'>) => {
    setCartItems(prev => {
      const existing = prev.findIndex(i => i.name === item.name);
      if (existing >= 0) {
        return prev.map((i, idx) => idx === existing ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeCartItem = (idx: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const changeCartQty = (idx: number, delta: number) => {
    setCartItems(prev =>
      prev
        .map((item, i) => i === idx ? { ...item, qty: item.qty + delta } : item)
        .filter(item => item.qty > 0)
    );
  };

  // Consumer pages have the shared TopNav
  const isConsumerPage = ['home', 'shop', 'product', 'creator'].includes(page);

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-\\[ticker_30s_linear_infinite\\] {
          animation: ticker 30s linear infinite;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #aa3000;
          border: 2px solid #ffffff;
          border-radius: 2px;
          cursor: pointer;
          box-shadow: 4px 4px 0px 0px #aa3000;
        }
        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #aa3000;
          border: 2px solid #ffffff;
          border-radius: 2px;
          cursor: pointer;
        }
      `}</style>

      {isConsumerPage && (
        <TopNav
          currentPage={page}
          navigate={navigate}
          cartCount={cartItems.reduce((s, i) => s + i.qty, 0)}
          onCartClick={() => setCartOpen(true)}
          onAuthClick={() => setAuthOpen(true)}
          onSearchClick={() => setSearchOpen(true)}
        />
      )}

      {page === 'home' && <HomePage navigate={navigate} onAddToCart={addToCart} onAuthClick={() => setAuthOpen(true)} />}
      {page === 'shop' && <ShopPage navigate={navigate} onAddToCart={addToCart} />}
      {page === 'product' && <ProductPage navigate={navigate} onAddToCart={addToCart} />}
      {page === 'creator' && <CreatorPage navigate={navigate} />}
      {page === 'dashboard' && <DashboardPage navigate={navigate} />}
      {page === 'studio-upload' && <StudioUploadPage navigate={navigate} />}
      {page === 'studio-pricing' && <StudioPricingPage navigate={navigate} />}
      {page === 'studio-review' && <StudioReviewPage navigate={navigate} />}

      {/* Overlays */}
      {cartOpen && (
        <CartDrawer
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onRemove={removeCartItem}
          onQtyChange={changeCartQty}
          navigate={navigate}
        />
      )}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} navigate={navigate} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} navigate={navigate} />}
    </div>
  );
}
