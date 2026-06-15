import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { AuthUser } from '../hooks/useAuth';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import type { ReactNode, FormEvent } from 'react';

// ─────────────────────────────────────────────
// Routing helpers — wrap useNavigate into a simple navigate(path) helper
// ─────────────────────────────────────────────
// Page strings map to URL paths
const PAGE_PATHS: Record<string, string> = {
  'home': '/',
  'shop': '/shop',
  'product': '/shop', // default; individual product: /product/:id
  'creator': '/creator',
  'dashboard': '/dashboard',
  'studio-upload': '/studio/upload',
  'studio-pricing': '/studio/pricing',
  'studio-review': '/studio/review',
};

/** Convert a legacy page key OR a direct path string to a router path */
function toPath(p: string): string {
  return PAGE_PATHS[p] ?? (p.startsWith('/') ? p : `/${p}`);
}

// ─────────────────────────────────────────────
// App-level Context (cart, auth, overlays)
// ─────────────────────────────────────────────
interface CartItem { name: string; price: string; gradient: string; qty: number; }

interface AppCtx {
  user: AuthUser | null;
  cartItems: CartItem[];
  cartOpen: boolean;
  authOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setAuthOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  handleLogin: (u: AuthUser) => void;
  handleLogout: () => void;
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  removeCartItem: (idx: number) => void;
  changeCartQty: (idx: number, delta: number) => void;
}

export const AppContext = createContext<AppCtx>(null as any);

type AuthMode = 'signin' | 'signup';
type UserRole = 'consumer' | 'designer' | 'manufacturer';
// Page type kept for legacy prop signatures
type Page = string;


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
  cartCount,
  onCartClick,
  onAuthClick,
  onSearchClick,
}: {
  cartCount: number;
  onCartClick: () => void;
  onAuthClick: () => void;
  onSearchClick: () => void;
}) => {
  const rNavigate = useNavigate();
  const isShopActive = window.location.pathname.startsWith('/shop') || window.location.pathname.startsWith('/product');
  return (
    <nav className="w-full sticky top-0 z-50 bg-[#fff8f5]/90 backdrop-blur-md border-b border-[#e6beb2]">
      <div className="flex items-center justify-between px-4 md:px-12 h-20 max-w-[1200px] mx-auto">
        {/* Logo */}
        <button
          onClick={() => rNavigate('/')}
          className="font-bold tracking-tighter text-[#aa3000] text-[40px] md:text-[120px] leading-none"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          OFFGRID
        </button>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => rNavigate('/shop')}
            className={`text-[18px] font-normal transition-colors ${isShopActive ? 'text-[#aa3000] border-b-2 border-[#aa3000] pb-1' : 'text-[#5c4037] hover:text-[#aa3000]'}`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Shop
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button onClick={onSearchClick} className="grid h-10 w-10 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Search">
            <Icon name="search" size={24} />
          </button>
          <button onClick={onCartClick} className="relative grid h-10 w-10 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Cart">
            <Icon name="shopping_cart" size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#aa3000] text-white text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={onAuthClick} className="grid h-10 w-10 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Account">
            <Icon name="person" size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};


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

const AuthModal = ({ onClose, onLogin }: { onClose: () => void; onLogin?: (u: AuthUser) => void }) => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => { rNavigate(toPath(p)); };
  const [mode, setMode] = useState<AuthMode>('signin');
  const [step, setStep] = useState(1);   // signup only: 1=role, 2=basic, 3=role-specific
  const [role, setRole] = useState<UserRole>('consumer');
  // sign-in fields
  const [siEmail, setSiEmail] = useState('');
  const [siPass, setSiPass] = useState('');
  // sign-up step 2
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passConf, setPassConf] = useState('');
  // designer step 3
  const [username, setUsername] = useState('');
  const [dCity, setDCity] = useState('');
  const [portfolio, setPortfolio] = useState('');
  // manufacturer step 3
  const [bizName, setBizName] = useState('');
  const [mCity, setMCity] = useState('');
  const [gst, setGst] = useState('');
  const [prints, setPrints] = useState<string[]>([]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const switchMode = (m: AuthMode) => { setMode(m); setStep(1); setAuthError(''); };

  /* ── SIGN IN — hits real DB ── */
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: siEmail, password: siPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      // Persist login to caller
      onLogin?.(data.user);
      try { localStorage.setItem('offgrid_user', JSON.stringify(data.user)); } catch { }
      onClose();
      if (data.user?.role === 'DESIGNER' || data.user?.role === 'MANUFACTURER') navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  /* ── SIGN UP step navigation + final DB submit ── */
  const totalSteps = role === 'consumer' ? 2 : 3;

  const handleNext = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (step === 2 && pass !== passConf) { setAuthError("Passwords don't match."); return; }
    if (step < totalSteps) { setStep(s => s + 1); return; }

    // Final submit
    setAuthLoading(true);
    try {
      const payload: Record<string, string> = {
        email, password: pass, name,
        role: role.toUpperCase() as string,
      };
      if (role === 'designer') { payload.username = username; payload.city = dCity; payload.portfolio = portfolio; }
      if (role === 'manufacturer') { payload.bizName = bizName; payload.city = mCity; payload.gst = gst; }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');
      onLogin?.(data.user);
      try { localStorage.setItem('offgrid_user', JSON.stringify(data.user)); } catch { }
      onClose();
      if (role === 'designer' || role === 'manufacturer') navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const togglePrint = (t: string) =>
    setPrints(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const roleCards: { id: UserRole; icon: string; label: string; desc: string }[] = [
    { id: 'consumer', icon: 'shopping_bag', label: 'Shopper', desc: 'Browse & buy exclusive drops' },
    { id: 'designer', icon: 'palette', label: 'Designer', desc: 'Upload art & earn royalties' },
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
            <span className="text-[32px] font-bold tracking-tighter text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif' }}>OFFGRID</span>
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
              {authError && (
                <div className="bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] text-[13px] px-4 py-3 rounded" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {authError}
                </div>
              )}
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
              <div className="bg-[#fff1e8] border border-[#e6beb2] rounded p-3 text-[11px] text-[#5c4037]" style={font}>
                <p className="font-bold mb-1 text-[#aa3000]">Test accounts (any password: password123)</p>
                <div className="flex flex-wrap gap-2">
                  {[['karan@offgrid.in', 'Designer'], ['mumbai@offgrid.in', 'Manufacturer'], ['mayankbisht1107@gmail.com', 'Consumer']].map(([e, r]) => (
                    <button key={e} type="button" onClick={() => { setSiEmail(e); setSiPass('password123'); }}
                      className="px-2 py-1 bg-white border border-[#e6beb2] rounded hover:border-[#aa3000] transition-colors text-[11px]" style={font}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={authLoading}
                className="w-full bg-[#aa3000] text-white py-4 text-[14px] font-semibold uppercase tracking-widest hover:bg-[#d43f00] active:scale-95 transition-all rounded mt-1 disabled:opacity-50"
                style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}>
                {authLoading ? 'Signing in…' : 'Sign In'}
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
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold border-2 transition-all ${step > i + 1 ? 'bg-[#aa3000] border-[#aa3000] text-white'
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
                          className={`flex items-center gap-4 p-4 border-2 rounded text-left transition-all ${role === r.id
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
                            className={`px-3 py-1.5 rounded text-[12px] font-semibold border transition-all ${prints.includes(t)
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
                  {authError && (
                    <p className="w-full text-[12px] text-[#93000a] bg-[#ffdad6] border border-[#ba1a1a] px-3 py-2 rounded" style={{ fontFamily: 'Inter, sans-serif' }}>{authError}</p>
                  )}
                </div>
                <div className="flex gap-3 pt-1">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(s => s - 1)}
                      className="flex items-center gap-1 px-5 py-3 border border-[#e6beb2] text-[#5c4037] text-[13px] font-semibold rounded hover:bg-[#f4dfcf] transition-colors"
                      style={font}>
                      <Icon name="arrow_back" size={16} /> Back
                    </button>
                  )}
                  <button type="submit"
                    disabled={authLoading || (step === 2 && pass !== passConf && passConf.length > 0)}
                    className="flex-1 bg-[#aa3000] text-white py-3.5 text-[14px] font-semibold uppercase tracking-widest hover:bg-[#d43f00] active:scale-95 transition-all rounded disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ boxShadow: '4px 4px 0px 0px #3a0b00', ...font }}>
                    {authLoading ? 'Please wait…' : (
                      step < totalSteps
                        ? (step === 2 && role === 'consumer' ? 'Create Account' : 'Continue')
                        : (role === 'designer' ? 'Launch Creator Profile' : role === 'manufacturer' ? 'Submit for Verification' : 'Create Account')
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

// ─────────────────────────────────────────────
// SEARCH OVERLAY
// ─────────────────────────────────────────────
const SearchOverlay = ({ onClose }: { onClose: () => void }) => {
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
    fetch('/api/products').then(r => r.json()).then(d => setAll(Array.isArray(d) ? d : [])).catch(() => { });
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
            {suggestions.map((p: any) => (
              <li key={p.id}>
                <button
                  onClick={() => { navigate('shop'); onClose(); }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-[14px] text-[#241910] hover:bg-[#fff1e8] transition-colors text-left"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Icon name="arrow_forward" size={16} className="text-[#aa3000]" />
                  <span className="flex-1 truncate">{p.title}</span>
                  <span className="text-[12px] text-[#5c4037] shrink-0">₹{(p.baseCostINR + p.designerPriceINR).toLocaleString('en-IN')}</span>
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 px-4 md:px-12 py-10 max-w-[1200px] mx-auto">
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
    <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-4 border-t border-[#e6beb2] flex flex-col md:flex-row justify-between items-center gap-4">
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
const HomePage = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { addToCart, setAuthOpen } = useContext(AppContext);
  const onAddToCart = addToCart;
  const onAuthClick = () => setAuthOpen(true);
  const [trending, setTrending] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => setTrending(Array.isArray(d) ? d.slice(0, 4) : [])).catch(() => { });
  }, []);
  return (
    <div className="bg-[#fff8f5] text-[#241910] overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[600px] md:min-h-[870px] flex items-center overflow-hidden px-4 md:px-12" style={{ background: 'linear-gradient(180deg, #aa3000 0%, #fff8f5 100%)' }}>
        <div className="max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center z-10 py-12 md:py-0">
          <div className="flex flex-col gap-6">
            <span className="uppercase tracking-[0.2em] text-[#852400] text-[10px] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>New Season / 2024</span>
            <h2 className="text-white drop-shadow-sm leading-none text-[40px] md:text-[64px]" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Art That Lives Nowhere Else</h2>
            <p className="text-white/90 max-w-md text-[18px]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>Discover the vanguard of streetwear and digital collectibles. Exclusive drops from the world's most reclusive creators, curated for the bold.</p>
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

      {/* Trending Products Bento */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h3 className="text-[24px] md:text-[32px] font-bold" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>Trending Products</h3>
            <div className="w-20 h-1 bg-[#aa3000] mt-2" />
          </div>
          <button onClick={() => navigate('shop')} className="text-[14px] text-[#aa3000] underline underline-offset-4 uppercase font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>View All</button>
        </div>

        {trending.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-[#e6beb2] rounded-lg gap-4 text-center">
            <Icon name="palette" size={40} className="text-[#e6beb2]" />
            <p className="text-[18px] font-semibold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>No products yet</p>
            <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Designers haven't published anything yet. Check back soon!</p>
            <button onClick={() => navigate('shop')} className="bg-[#aa3000] text-white px-6 py-3 text-[14px] font-semibold rounded hover:bg-[#d43f00] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Browse Shop</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Main large card — first product */}
            {trending[0] && (
              <div className="md:col-span-2 md:row-span-2 relative group bg-[#fff1e8] overflow-hidden rounded-lg cursor-pointer min-h-[400px]"
                style={{ border: '1px solid #EDE4D8' }} onClick={() => navigate('shop')}>
                {trending[0].image
                  ? <img src={trending[0].image} alt={trending[0].title} className="w-full h-full absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105" />
                  : <div className="w-full h-full absolute inset-0 transition-transform duration-700 group-hover:scale-105"><GradientImg gradient={GRADIENTS.parka} className="h-full" /></div>
                }
                <div className="absolute bottom-0 left-0 w-full p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                  {trending[0].featured && <span className="bg-[#bdf200] text-[#526b00] px-2 py-1 text-[10px] font-bold uppercase rounded mb-2 inline-block" style={{ fontFamily: 'Inter, sans-serif' }}>Best Seller</span>}
                  <h4 className="text-white text-[24px] font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>{trending[0].title}</h4>
                  <p className="text-white/80 text-[14px] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>₹{(trending[0].baseCostINR + trending[0].designerPriceINR).toLocaleString('en-IN')}</p>
                  <button className="bg-white text-[#241910] text-[14px] font-semibold px-6 py-2 rounded-sm hover:bg-[#aa3000] hover:text-white transition-colors uppercase" style={{ fontFamily: 'Inter, sans-serif' }}
                    onClick={e => { e.stopPropagation(); onAddToCart({ name: trending[0].title, price: `₹${trending[0].baseCostINR + trending[0].designerPriceINR}`, gradient: GRADIENTS.parka }); }}>
                    QUICK ADD
                  </button>
                </div>
              </div>
            )}
            {/* Small cards — next 2 products */}
            {trending.slice(1, 3).map((p: any) => (
              <div key={p.id} className="bg-white group cursor-pointer" style={{ border: '1px solid #EDE4D8' }} onClick={() => navigate('shop')}>
                <div className="overflow-hidden rounded h-64 mb-4">
                  {p.image
                    ? <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    : <GradientImg gradient={GRADIENTS.tee} className="h-full" />
                  }
                </div>
                <div className="p-4">
                  <h5 className="text-[14px] font-semibold text-[#241910] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{p.title}</h5>
                  <p className="text-[#5c4037] text-[14px]" style={{ fontFamily: 'Inter, sans-serif' }}>₹{(p.baseCostINR + p.designerPriceINR).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
            {/* CTA banner */}
            <div className="md:col-span-2 bg-[#bdf200]/10 border-2 border-[#bdf200] p-10 flex flex-col justify-center items-center text-center">
              <h5 className="text-[24px] font-semibold text-[#241910] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Exclusive Creator Drops</h5>
              <p className="text-[16px] text-[#5c4037] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Sign up to get early access when new designs go live.</p>
              <button className="bg-[#241910] text-[#fff8f5] text-[14px] font-semibold px-10 py-6 rounded hover:bg-[#aa3000] transition-all uppercase" style={{ fontFamily: 'Inter, sans-serif' }} onClick={onAuthClick}>SIGN UP FOR ALERTS</button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
        <div className="max-w-[1200px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-10">
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
      <section className="max-w-[1200px] mx-auto px-4 md:px-12 py-16">
        <div className="bg-[#aa3000] p-8 md:p-16 rounded-xl flex flex-col md:flex-row items-center gap-10 text-white">
          <div className="flex-1">
            <h3 className="text-[24px] md:text-[32px] font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Join the Inner Circle</h3>
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
};

// ─────────────────────────────────────────────
// SHOP PAGE  — live products from API
// ─────────────────────────────────────────────
const ShopPage = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { addToCart } = useContext(AppContext);
  const onAddToCart = addToCart;
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFF8F5 0%, #FFD0B0 50%, #FFB59E 100%)' }}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-12 py-10">
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
              <h1 className="text-[32px] md:text-[48px] font-bold text-[#241910]" style={{ ...syne, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Browse All Art</h1>
              <p className="text-[14px] text-[#5c4037]" style={font}>{products.length} result{products.length !== 1 ? 's' : ''}</p>
            </div>

            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-[#aa3000] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 gap-4 text-center border border-[#e6beb2] rounded-lg bg-white p-12">
                <Icon name="palette" size={48} className="text-[#e6beb2]" />
                <p className="text-[18px] font-semibold text-[#241910]" style={syne}>No designs yet</p>
                <p className="text-[14px] text-[#5c4037]" style={font}>Designers haven't published any products yet. Be the first!</p>
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((p: any) => {
                  const price = `₹${(p.baseCostINR + p.designerPriceINR).toLocaleString('en-IN')}`;
                  return (
                    <div key={p.id}
                      className="group bg-white border border-[#e6beb2] rounded p-4 transition-all duration-300"
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
                      <h4 className="text-[16px] font-semibold text-[#241910] mb-1 cursor-pointer hover:text-[#aa3000] transition-colors truncate" style={{ ...syne, lineHeight: 1.3 }} onClick={() => navigate(`/product/${p.id}`)}>{p.title}</h4>
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
    </div>
  );
};

// ─────────────────────────────────────────────
// PRODUCT DETAIL PAGE
// ─────────────────────────────────────────────
const ProductPage = () => {
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
      <div className="flex items-center justify-center min-h-screen bg-[#fff8f5]">
        <div className="w-10 h-10 border-4 border-[#aa3000] border-t-transparent rounded-full animate-spin" />
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
  const priceString = `₹${priceVal.toLocaleString('en-IN')}`;

  return (
    <div className="text-[#241910]" style={{ background: 'linear-gradient(180deg, #fff8f5 0%, #fae4d5 50%, #ffeadb 100%)', minHeight: '100vh' }}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-12 mt-10">
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white border border-[#e6beb2] rounded-lg overflow-hidden group relative" style={{ aspectRatio: '4/5' }}>
              <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                {displayProduct.image ? (
                  <img src={displayProduct.image} alt={displayProduct.title} className="w-full h-full object-cover" />
                ) : (
                  <GradientImg gradient={GRADIENTS.hoodie} className="h-full" />
                )}
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>Collection 04 / {displayProduct.productType.toUpperCase()}</span>
            </div>
            <h1 className="text-[#241910] mb-2 leading-none" style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{displayProduct.title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 cursor-pointer hover:text-[#aa3000] transition-colors" onClick={() => navigate(`/creator/${displayProduct.designerId}`)}>
                <div className="w-8 h-8 rounded-full border border-[#916f65] bg-[#ffeadb] flex items-center justify-center overflow-hidden">
                  <div style={{ background: GRADIENTS.portrait, width: '100%', height: '100%' }} />
                </div>
                <span className="text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{displayProduct.designerName}</span>
              </div>
              <span className="w-1 h-1 bg-[#e6beb2] rounded-full" />
              <span className="text-[24px] font-semibold text-[#aa3000]" style={{ fontFamily: 'Syne, sans-serif' }}>{priceString}</span>
            </div>
            <p className="text-[18px] text-[#5c4037] mb-10" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
              {displayProduct.description}
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
                onClick={() => onAddToCart({ name: displayProduct.title, price: priceString, gradient: GRADIENTS.hoodie })}
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
                  This design is a custom creation by {displayProduct.designerName}. Built and published using OFFGRID's dynamic creator pipeline.
                </p>
                <ul className="space-y-2">
                  {['Hand-numbered limited run', `Signature ${displayProduct.designerName} style`, 'Oversized "Hacker" Fit'].map(l => (
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
            <div className="bg-[#bdf200]/10 border border-[#bdf200] p-10 rounded-xl flex-1 flex flex-col justify-center items-center text-center">
              <h4 className="text-[20px] font-bold mb-2 uppercase" style={{ fontFamily: 'Syne, sans-serif' }}>More by {displayProduct.designerName}</h4>
              <p className="text-[14px] text-[#5c4037] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Explore more high-performance streetwear artifacts by this artist.</p>
              <button
                onClick={() => navigate(`/creator/${displayProduct.designerId}`)}
                className="bg-[#241910] text-[#fff8f5] text-[12px] font-bold uppercase py-3 px-6 hover:bg-[#aa3000] hover:text-white transition-colors"
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

// ─────────────────────────────────────────────
// CREATOR PROFILE PAGE
// ─────────────────────────────────────────────
const CreatorPage = () => {
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
      <div className="flex items-center justify-center min-h-screen bg-[#fff8f5]">
        <div className="w-10 h-10 border-4 border-[#aa3000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const designerName = designer?.name || 'Unknown Designer';
  const usernameDisplay = designer?.username ? `@${designer.username}` : 'verified_creator';

  return (
    <div className="text-[#241910]" style={{ background: 'linear-gradient(180deg, #fff8f5 0%, #fae4d5 50%, #ebd6c7 100%)', minHeight: '100vh' }}>
      <main className="max-w-[1200px] mx-auto px-4 md:px-12 py-10">
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
              <span className="text-[10px] font-bold text-[#aa3000] uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{usernameDisplay}</span>
              <h1 className="text-[#241910] leading-none mb-2" style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>{designerName}</h1>
            </div>
            <div className="pl-6 max-w-xl" style={{ borderLeft: '4px solid #bdf200' }}>
              <p className="text-[18px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                Exploring the intersection of digital decay and high-performance streetwear. Building tactile artifacts for the modern nomad.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              <button
                className="bg-[#aa3000] text-white px-16 py-4 text-[14px] font-semibold uppercase border border-[#aa3000] hover:bg-[#d43f00] transition-all"
                style={{ boxShadow: '4px 4px 0px 0px #aa3000', fontFamily: 'Inter, sans-serif' }}
              >
                Follow Creator
              </button>
              <button className="bg-transparent text-[#241910] px-10 py-4 text-[14px] font-semibold uppercase border border-[#241910] hover:bg-[#fff1e8] transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                Message
              </button>
            </div>
            <div className="flex gap-10 mt-4">
              {[
                ['1.2K', 'Followers'],
                [products.length.toString(), 'Works'],
                ['1.8k+', 'Views']
              ].map(([v, l]) => (
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
            {['Latest', 'Popular'].map((t, i) => (
              <button key={t} className={`text-[14px] font-semibold transition-colors ${i === 0 ? 'text-[#aa3000] border-b-2 border-[#aa3000] pb-1' : 'text-[#5c4037] hover:text-[#aa3000]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{t}</button>
            ))}
          </div>
        </div>
        {/* Products grid */}
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border border-[#e6beb2] bg-white rounded-lg gap-4 text-center p-8">
            <Icon name="palette" size={40} className="text-[#e6beb2]" />
            <p className="text-[18px] font-semibold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>No works published yet</p>
            <p className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>This creator hasn't published any designs to the shop yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {products.map((p: any) => {
              const price = `₹${(p.baseCostINR + p.designerPriceINR).toLocaleString('en-IN')}`;
              return (
                <div key={p.id}
                  className="group bg-white border border-[#e6beb2] rounded p-4 transition-all duration-300"
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '4px 4px 0px 0px #aa3000'; (e.currentTarget as HTMLDivElement).style.transform = 'translate(-2px,-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
                >
                  <div className="relative overflow-hidden mb-4 bg-[#ffeadb] cursor-pointer" style={{ aspectRatio: '3/4' }} onClick={() => navigate(`/product/${p.id}`)}>
                    {p.image
                      ? <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      : <GradientImg gradient={GRADIENTS.tee} className="h-full" />
                    }
                    <div className="absolute inset-x-0 bottom-0 bg-[#aa3000] py-2 text-white text-[11px] font-bold uppercase tracking-wider text-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => { e.stopPropagation(); onAddToCart({ name: p.title, price, gradient: GRADIENTS.tee }); }}>
                      + Quick Add
                    </div>
                  </div>
                  <h4 className="text-[16px] font-semibold text-[#241910] mb-1 cursor-pointer hover:text-[#aa3000] transition-colors truncate" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1.3 }} onClick={() => navigate(`/product/${p.id}`)}>{p.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-bold text-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }}>{price}</span>
                    <button onClick={() => onAddToCart({ name: p.title, price, gradient: GRADIENTS.tee })} className="text-[#5c4037] hover:text-[#aa3000] transition-colors" aria-label="Add to cart">
                      <Icon name="shopping_bag" size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
};

// ─────────────────────────────────────────────
// STUDIO SIDEBAR
// ─────────────────────────────────────────────
const StudioSidebar = ({ activeItem = 'overview', onSignOut }: { activeItem?: string; onSignOut?: () => void }) => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const items = [
    { icon: 'dashboard', label: 'Overview', page: 'dashboard', key: 'overview' },
    { icon: 'palette', label: 'My Designs', page: 'studio-upload', key: 'designs' },
    { icon: 'insights', label: 'Analytics', page: 'dashboard', key: 'analytics' },
    { icon: 'payments', label: 'Payouts', page: 'dashboard', key: 'payouts' },
    { icon: 'settings', label: 'Settings', page: 'dashboard', key: 'settings' },
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
        <button
          className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:text-[#ba1a1a] transition-all rounded-lg"
          style={{ fontFamily: 'Inter, sans-serif' }}
          onClick={() => onSignOut ? onSignOut() : navigate('/')}
        >
          <Icon name="logout" size={20} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

// Studio header
const StudioHeader = () => {
  const rNavigate = useNavigate();
  return (
    <header className="flex justify-between items-center w-full px-4 md:px-12 h-20 border-b border-[#e6beb2] bg-transparent">
      <div className="flex items-center gap-10">
        <div className="hidden lg:flex items-center gap-6">
          {[['Dashboard', '/dashboard'], ['Earnings', '/dashboard'], ['Marketplace', '/shop']].map(([l, pg]) => (
            <button key={l} onClick={() => rNavigate(pg)} className="text-[14px] font-semibold text-[#5c4037] hover:text-[#aa3000] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden md:flex items-center gap-2 bg-[#aa3000] text-white px-6 py-2 text-[14px] font-semibold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all" style={{ fontFamily: 'Inter, sans-serif' }} onClick={() => rNavigate('/studio/upload')}>
          <Icon name="upload" size={18} className="text-white" /> Upload Design
        </button>
        <Icon name="notifications" size={24} className="text-[#5c4037] cursor-pointer hover:text-[#aa3000]" />
        <Icon name="account_circle" size={24} className="text-[#5c4037] cursor-pointer hover:text-[#aa3000]" />
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────
// DASHBOARD PAGE  (Image 4.html)
// ─────────────────────────────────────────────
const DashboardPage = () => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const [tab, setTab] = useState<'overview' | 'analytics' | 'payouts' | 'settings'>('overview');
  const [designs, setDesigns] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  // Get logged-in user from localStorage
  const loggedUser = (() => { try { const r = localStorage.getItem('offgrid_user'); return r ? JSON.parse(r) : null; } catch { return null; } })();

  useEffect(() => {
    const designerId = loggedUser?.id;
    Promise.all([
      fetch('/api/products').then(r => r.json()).catch(() => []),
      fetch('/api/orders').then(r => r.json()).catch(() => []),
      // Fetch real designs for this designer if logged in
      designerId
        ? fetch(`/api/designers/${designerId}/designs`).then(r => r.json()).catch(() => [])
        : Promise.resolve([]),
    ]).then(([p, o, d]) => {
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
      setDesigns(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  const designerProducts = products.filter((p: any) => p.designerId === loggedUser?.id);
  const designerOrders = orders.filter((o: any) =>
    o.items && Array.isArray(o.items) && o.items.some((item: any) =>
      designerProducts.some(p => p.id === item.productId)
    )
  );

  const totalSold = designerProducts.reduce((s: number, p: any) => s + (p.totalSold ?? 0), 0);

  const totalRevenue = orders.reduce((s: number, o: any) => {
    let earnings = 0;
    if (o.items && Array.isArray(o.items)) {
      o.items.forEach((item: any) => {
        const p = designerProducts.find(prod => prod.id === item.productId);
        if (p) {
          earnings += item.quantity * p.designerPriceINR;
        }
      });
    }
    return s + earnings;
  }, 0);

  const displayName = loggedUser?.name || 'Guest Creator';
  const initialInitials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  // Sidebar items wired to tabs
  const sidebarItems = [
    { icon: 'dashboard', label: 'Overview', key: 'overview' as const, page: null },
    { icon: 'palette', label: 'My Designs', key: null, page: 'studio-upload' as string },
    { icon: 'insights', label: 'Analytics', key: 'analytics' as const, page: null },
    { icon: 'payments', label: 'Payouts', key: 'payouts' as const, page: null },
    { icon: 'settings', label: 'Settings', key: 'settings' as const, page: null },
  ];


  return (
    <div className="flex min-h-screen text-[#241910]" style={{ backgroundColor: '#fff8f5', backgroundImage: 'radial-gradient(at 0% 0%, #ffeadb 0px, transparent 50%), radial-gradient(at 100% 100%, #f4dfcf 0px, transparent 50%)', backgroundAttachment: 'fixed' }}>

      {/* Inline sidebar so we can control tab switching */}
      <aside className="hidden md:flex flex-col h-screen sticky top-0 p-4 bg-[#fff1e8] border-r border-[#e6beb2] w-64 shrink-0">
        <div className="mb-6 px-2">
          <button onClick={() => navigate('/')} className="text-[24px] font-semibold text-[#aa3000]" style={syne}>OffGrid</button>
          <p className="text-[12px] text-[#5c4037] opacity-70 uppercase tracking-widest font-medium mt-1" style={font}>Creator Studio</p>
        </div>
        <div className="mb-4 px-4">
          <div className="w-10 h-10 rounded-full bg-[#ffdbd0] flex items-center justify-center text-[#aa3000] font-bold text-sm mb-2">{initialInitials}</div>
          <p className="text-[14px] font-semibold text-[#241910]" style={font}>{displayName}</p>
          <p className="text-[10px] uppercase text-[#5c4037]" style={font}>Elite Partner</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {sidebarItems.map(item => {
            const isActive = item.key === tab;
            return (
              <button key={item.label}
                onClick={() => item.page ? navigate(item.page) : item.key && setTab(item.key)}
                className={`flex items-center gap-4 px-4 py-2 text-[14px] font-semibold rounded-lg transition-all ${isActive ? 'bg-[#aa3000] text-white translate-x-1' : 'text-[#5c4037] hover:bg-[#f4dfcf]'}`}
                style={{ ...font, ...(isActive ? { boxShadow: '4px 4px 0px 0px #aa3000' } : {}) }}
              >
                <Icon name={item.icon} size={20} fill={isActive ? 1 : 0} className={isActive ? 'text-white' : ''} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-[#e6beb2]/30">
          <button className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:bg-[#f4dfcf] rounded-lg" style={font}>
            <Icon name="help_outline" size={20} /> Help
          </button>
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-4 py-2 text-[14px] font-semibold text-[#5c4037] hover:text-[#ba1a1a] rounded-lg" style={font}>
            <Icon name="logout" size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <StudioHeader />
        <section className="max-w-7xl mx-auto px-4 md:px-12 py-10">
          {tab === 'overview' && <>
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
              <div>
                <h2 className="text-[#aa3000]" style={{ ...syne, fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>Creator Studio</h2>
                <p className="text-[18px] text-[#5c4037] max-w-xl pl-6 mt-2" style={{ ...font, lineHeight: 1.6, borderLeft: '4px solid #bdf200' }}>
                  {designerProducts.length > 0
                    ? `${designerProducts.length} product${designerProducts.length !== 1 ? 's' : ''} published · ${totalSold} units sold`
                    : 'Upload your first design to get started.'}
                </p>
              </div>
            </div>

            {/* Stats bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, subIcon: 'trending_up', bgIcon: 'payments', color: '#4f6600', sub: `${designerOrders.length} order${designerOrders.length !== 1 ? 's' : ''}` },
                { label: 'Active Designs', value: String(designerProducts.length), sub: `${designs.length} design${designs.length !== 1 ? 's' : ''} uploaded`, subIcon: null, bgIcon: 'auto_awesome', color: null },
                { label: 'Units Sold', value: String(totalSold), sub: 'across your products', subIcon: null, bgIcon: null, color: null },
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
              <h3 className="text-[24px] font-semibold text-[#241910]" style={{ ...syne, lineHeight: 1.3 }}>Your Active Products</h3>
              <button onClick={() => navigate('studio-upload')} className="text-[14px] font-semibold text-[#aa3000] flex items-center gap-1" style={font}>
                + Upload New <Icon name="arrow_forward" size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {!loading && designs.length === 0 && (
                <div className="col-span-4 flex flex-col items-center justify-center h-40 gap-3 border border-[#e6beb2] rounded-lg text-center p-8">
                  <Icon name="palette" size={36} className="text-[#e6beb2]" />
                  <p className="text-[14px] text-[#5c4037]" style={font}>No designs yet. Upload your first design!</p>
                  <button onClick={() => navigate('studio-upload')} className="bg-[#aa3000] text-white px-6 py-2 text-[13px] font-semibold rounded hover:bg-[#d43f00] transition-colors" style={font}>Upload Design</button>
                </div>
              )}
              {!loading && designs.map((d: any) => (
                <div key={d.id} className="group cursor-pointer" onClick={() => rNavigate('/shop')}>
                  <div className="relative rounded-lg overflow-hidden border border-[#e6beb2] mb-4" style={{ aspectRatio: '3/4' }}>
                    {d.image ? <img src={d.image} alt={d.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" /> : <GradientImg gradient={GRADIENTS.hoodie} className="h-full" />}
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-[#ffeadb] text-[#aa3000]" style={font}>{d.productType}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#241910] truncate max-w-[140px]" style={font}>{d.title}</h4>
                      <p className="text-[12px] text-[#5c4037]" style={font}>{d.totalSold ?? 0} sold · ₹{(d.baseCostINR + d.designerPriceINR).toLocaleString('en-IN')}</p>
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
                <h4 className="text-[#241910] font-semibold mb-1" style={syne}>New Release</h4>
                <p className="text-[14px] text-[#5c4037]" style={font}>Upload artwork and publish to the marketplace</p>
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2">
                <h3 className="text-[24px] font-semibold text-[#241910] mb-10" style={syne}>Recent Orders</h3>
                {orders.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center h-40 gap-3 border border-[#e6beb2] rounded-lg text-center p-8">
                    <Icon name="shopping_bag" size={36} className="text-[#e6beb2]" />
                    <p className="text-[14px] text-[#5c4037]" style={font}>No orders yet.</p>
                  </div>
                )}
                <div className="space-y-4">
                  {orders.slice(0, 5).map((o: any, idx: number) => (
                    <div key={o.id} className="flex items-center justify-between p-6 rounded-lg" style={{ opacity: 1 - idx * 0.15, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid #e6beb2' }}>
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded flex items-center justify-center bg-[#ffdbd0]">
                          <Icon name="shopping_bag" size={20} className="text-[#aa3000]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold" style={font}>{o.items?.[0]?.productTitle ?? 'Order'}</p>
                          <p className="text-[10px] uppercase text-[#5c4037]" style={font}>{o.status} · {o.consumerName}</p>
                        </div>
                      </div>
                      <p className="text-[20px] font-semibold text-[#aa3000]" style={syne}>₹{o.subtotalINR?.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-10">
                <div className="p-10 bg-[#241910] text-[#fff8f5] rounded-xl">
                  <h4 className="font-semibold mb-4" style={{ ...syne, fontSize: 20 }}>Upload Your Next Design</h4>
                  <p className="text-[14px] opacity-80 mb-6" style={{ ...font, lineHeight: 1.5 }}>Every design you upload becomes a live product available to shoppers globally.</p>
                  <button onClick={() => navigate('studio-upload')} className="w-full py-4 border border-[#fff8f5] text-[#fff8f5] text-[14px] font-semibold rounded-lg hover:bg-[#fff8f5] hover:text-[#241910] transition-all uppercase" style={font}>
                    Start Upload
                  </button>
                </div>
                <div className="p-10 border border-[#e6beb2] rounded-xl bg-[#fff1e8]">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5c4037]" style={font}>Platform Summary</span>
                  <div className="mt-4 space-y-3">
                    {[
                      [`${designs.length}`, 'Designs Uploaded'],
                      [`${products.length}`, 'Active Products'],
                      [`${orders.length}`, 'Orders Received'],
                    ].map(([v, l]) => (
                      <div key={l} className="flex items-center justify-between">
                        <span className="text-[14px] text-[#5c4037]" style={font}>{l}</span>
                        <span className="text-[24px] font-bold text-[#aa3000]" style={syne}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>}
        </section>

        {/* ── Analytics tab ── */}
        {tab === 'analytics' && (
          <section className="max-w-7xl mx-auto px-4 md:px-12 py-10">
            <h2 className="text-[32px] font-bold mb-8 text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {[['Total Views', '14,280', 'visibility'], ['Conversion Rate', '3.2%', 'percent'], ['Avg. Order Value', '$94.50', 'payments']].map(([l, v, ic]) => (
                <div key={l} className="p-8 rounded-xl bg-white border border-[#e6beb2] flex flex-col gap-3">
                  <Icon name={ic} size={24} className="text-[#aa3000]" />
                  <p className="text-[12px] uppercase tracking-widest text-[#5c4037] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</p>
                  <p className="text-[40px] font-bold text-[#241910]" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[#e6beb2] rounded-xl p-8">
              <p className="text-[14px] font-semibold text-[#5c4037] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Monthly Revenue (last 6 months)</p>
              <div className="flex items-end gap-4 h-40">
                {[60, 80, 45, 90, 70, 100].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full rounded-t" style={{ height: `${h}%`, background: i === 5 ? '#aa3000' : '#ffeadb', border: '1px solid #e6beb2' }} />
                    <span className="text-[10px] text-[#5c4037] font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Payouts tab ── */}
        {tab === 'payouts' && (
          <section className="max-w-7xl mx-auto px-4 md:px-12 py-10">
            <h2 className="text-[32px] font-bold mb-8 text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>Payouts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {[['Available Balance', '$2,450.00', '#aa3000'], ['Pending', '$380.00', '#5c4037'], ['Paid This Month', '$1,200.00', '#4f6600'], ['Total Lifetime', '$18,900.00', '#241910']].map(([l, v, c]) => (
                <div key={l} className="p-8 rounded-xl bg-white border border-[#e6beb2]">
                  <p className="text-[12px] uppercase tracking-widest text-[#5c4037] font-bold mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{l}</p>
                  <p className="text-[36px] font-bold" style={{ fontFamily: 'Syne, sans-serif', lineHeight: 1, color: c }}>{v}</p>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[#e6beb2] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#e6beb2] flex justify-between items-center">
                <p className="text-[14px] font-bold text-[#241910] uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Payout History</p>
                <button className="text-[13px] text-[#aa3000] font-semibold underline underline-offset-4" style={{ fontFamily: 'Inter, sans-serif' }}>Request Payout</button>
              </div>
              {[['Jun 1, 2026', '$1,200.00', 'Paid'], ['May 1, 2026', '$980.00', 'Paid'], ['Apr 1, 2026', '$1,540.00', 'Paid']].map(([d, a, s]) => (
                <div key={d} className="flex items-center justify-between px-6 py-4 border-b border-[#e6beb2]/50">
                  <span className="text-[14px] text-[#5c4037]" style={{ fontFamily: 'Inter, sans-serif' }}>{d}</span>
                  <span className="text-[14px] font-bold text-[#241910]" style={{ fontFamily: 'Inter, sans-serif' }}>{a}</span>
                  <span className="px-3 py-1 bg-[#bdf200] text-[#526b00] text-[11px] font-bold rounded uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>{s}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Settings tab ── */}
        {tab === 'settings' && (
          <section className="max-w-2xl mx-auto px-4 md:px-12 py-10">
            <h2 className="text-[32px] font-bold mb-8 text-[#241910]" style={{ fontFamily: 'Syne, sans-serif' }}>Settings</h2>
            <div className="bg-white border border-[#e6beb2] rounded-xl p-8 space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Display Name</label>
                <input defaultValue="Jane Doe" className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Email</label>
                <input defaultValue="jane@offgrid.io" type="email" className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded focus:outline-none focus:border-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-1 block tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Bio</label>
                <textarea rows={3} defaultValue="Independent streetwear creator. Berlin × Tokyo." className="w-full bg-[#fff1e8] border border-[#e6beb2] px-4 py-3 text-[14px] rounded resize-none focus:outline-none focus:border-[#aa3000]" style={{ fontFamily: 'Inter, sans-serif' }} />
              </div>
              <div className="pt-2 flex gap-3">
                <button className="px-8 py-3 bg-[#aa3000] text-white text-[14px] font-semibold rounded uppercase tracking-wide hover:bg-[#d43f00] transition-colors" style={{ boxShadow: '4px 4px 0px 0px #3a0b00', fontFamily: 'Inter, sans-serif' }}>Save Changes</button>
                <button onClick={() => navigate('home')} className="px-6 py-3 border border-[#e6beb2] text-[#5c4037] text-[14px] font-semibold rounded hover:bg-[#f4dfcf] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>Sign Out</button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#f4dfcf] border-t border-[#e6beb2] flex items-center justify-around px-4 z-50">
        {([['dashboard', 'Overview', 'overview'], ['palette', 'Designs', 'designs'], ['add', '', 'designs'], ['insights', 'Stats', 'analytics'], ['settings', 'Settings', 'settings']] as [string, string, string][]).map(([icon, label, t]) => (
          <button key={icon}
            onClick={() => t === 'designs' ? navigate('studio-upload') : setTab(t as any)}
            className={`flex flex-col items-center gap-1 transition-colors ${tab === t ? 'text-[#aa3000]' : 'text-[#5c4037]'}`}>
            {icon === 'add'
              ? <div className="-mt-8 w-14 h-14 bg-[#aa3000] rounded-full flex items-center justify-center shadow-lg"><Icon name="add" size={28} className="text-white" /></div>
              : <><Icon name={icon} size={22} /><span className="text-[10px] font-bold uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span></>
            }
          </button>
        ))}
      </nav>
    </div>
  );
};

const ProductMockup = ({ type, url }: { type: 'hoodie' | 'tshirt' | 'print'; url: string }) => {
  const [color, setColor] = useState(() => {
    if (type === 'hoodie') return '#1F1F1F'; // carbon black
    if (type === 'tshirt') return '#F4F1EA'; // off white
    return '#3D2612'; // dark oak
  });

  const bg = type === 'hoodie' ? GRADIENTS.hoodie : type === 'tshirt' ? GRADIENTS.tee : GRADIENTS.print;

  const colors = type === 'hoodie'
    ? [
      { name: 'Carbon Black', hex: '#1F1F1F' },
      { name: 'Oatmeal Heather', hex: '#E3DEC3' },
      { name: 'Sage Green', hex: '#4A5340' },
    ]
    : type === 'tshirt'
      ? [
        { name: 'Off-White', hex: '#F4F1EA' },
        { name: 'Vintage Black', hex: '#252525' },
        { name: 'Rust Crimson', hex: '#8B3D30' },
      ]
      : [
        { name: 'Dark Oak', hex: '#3D2612' },
        { name: 'Matte Black', hex: '#1C1C1C' },
        { name: 'Brushed Silver', hex: '#D1D1D1' },
      ];

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center p-4 shadow-inner" style={{ background: bg }}>
      {/* Subtle lighting overlay */}
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full h-full flex items-center justify-center min-h-[260px]">
        {type === 'print' ? (
          /* Framed Art Print */
          <div
            className="relative w-4/5 h-4/5 shadow-2xl flex items-center justify-center transition-transform duration-500 hover:scale-105 animate-fade-in"
            style={{
              border: `12px solid ${color}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            {/* Passepartout (Mat board) */}
            <div className="w-full h-full bg-[#FAF6EE] p-4 flex items-center justify-center shadow-inner relative">
              {url ? (
                <div className="relative w-full h-full flex items-center justify-center bg-white shadow-md border border-black/5 overflow-hidden">
                  <img src={url} alt="artwork print mockup" className="max-w-full max-h-full object-contain" />
                  {/* Glass sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none" />
                </div>
              ) : (
                <span className="text-[10px] uppercase font-bold text-[#5c4037]/40 tracking-wider">No Artwork</span>
              )}
            </div>
          </div>
        ) : type === 'tshirt' ? (
          /* Detailed T-Shirt Mockup */
          <div className="relative w-4/5 h-4/5 flex items-center justify-center transition-transform duration-500 hover:scale-105">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
              {/* Soft Drop Shadow */}
              <path
                d="M 50,15 C 44,15 36,12 32,8 C 30,10 24,14 18,17 L 8,30 L 19,40 L 25,36 L 25,92 C 25,94 27,96 29,96 L 71,96 C 73,96 75,94 75,92 L 75,36 L 81,40 L 92,30 L 82,17 C 76,14 70,10 68,8 C 64,12 56,15 50,15 Z"
                fill="rgba(0,0,0,0.18)"
                className="blur-[2px]"
                transform="translate(1, 2)"
              />

              {/* Shirt Fabric Base */}
              <path
                d="M 50,15 C 44,15 36,12 32,8 C 30,10 24,14 18,17 L 8,30 L 19,40 L 25,36 L 25,92 C 25,94 27,96 29,96 L 71,96 C 73,96 75,94 75,92 L 75,36 L 81,40 L 92,30 L 82,17 C 76,14 70,10 68,8 C 64,12 56,15 50,15 Z"
                fill={color}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth="1"
              />

              {/* Collar seam */}
              <path d="M 32,8 C 35,14 43,18 50,18 C 57,18 65,14 68,8" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
              <path d="M 32,8 C 35,12 43,14 50,14 C 57,14 65,12 68,8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />

              {/* Sleeve seams & hem details */}
              <path d="M 18,17 L 25,36" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
              <path d="M 82,17 L 75,36" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />

              {/* Bottom hemline double stitch */}
              <path d="M 26,92 L 74,92" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
              <path d="M 26,93.5 L 74,93.5" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.5" />
            </svg>

            {/* Design Container (chest area) */}
            {url && (
              <div
                className="absolute overflow-hidden flex items-center justify-center"
                style={{
                  left: '34%',
                  top: '24%',
                  width: '32%',
                  height: '36%',
                }}
              >
                <img
                  src={url}
                  alt="artwork tee mockup"
                  className="max-w-full max-h-full object-contain"
                  style={{ mixBlendMode: color === '#F4F1EA' ? 'multiply' : 'normal', opacity: color === '#F4F1EA' ? 0.95 : 0.9 }}
                />
              </div>
            )}

            {/* Crease Overlays to merge design with fabric folds */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
                {/* Sleeve folds */}
                <path d="M 18,22 C 22,25 21,29 20,32" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
                <path d="M 82,22 C 78,25 79,29 80,32" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
                {/* Chest wrinkles crossing the artwork */}
                <path d="M 33,35 C 44,38 52,28 67,36" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
                <path d="M 32,58 C 45,55 55,62 68,54" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
                <path d="M 30,75 C 45,72 55,78 70,72" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.8" />
              </svg>
            </div>

            {!url && (
              <span className="absolute text-[10px] uppercase font-bold text-black/40 tracking-wider">No Artwork</span>
            )}
          </div>
        ) : (
          /* Detailed Hoodie Mockup */
          <div className="relative w-4/5 h-4/5 flex items-center justify-center transition-transform duration-500 hover:scale-105">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
              {/* Soft Drop Shadow */}
              <path
                d="M 32,18 C 30,8 38,2 50,2 C 62,2 70,8 68,18 L 81,25 L 87,83 C 87,86 85,88 82,88 L 73,88 L 73,93 C 73,95 71,97 69,97 L 31,97 C 29,97 27,95 27,93 L 27,88 L 18,88 C 15,88 13,86 13,83 L 19,25 Z"
                fill="rgba(0,0,0,0.2)"
                className="blur-[2px]"
                transform="translate(1, 2)"
              />

              {/* Hood Back */}
              <path d="M 32,18 C 30,6 38,2 50,2 C 62,2 70,6 68,18 Z" fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
              <path d="M 35,16 C 36,8 42,5 50,5 C 58,5 64,8 65,16 Z" fill="rgba(0,0,0,0.16)" />

              {/* Body & Sleeves */}
              <path
                d="M 32,18 L 19,25 L 13,83 C 13,85 15,87 17,87 L 22,87 L 24,93 C 24,95 26,97 28,97 L 72,97 C 74,97 76,95 76,93 L 78,87 L 83,87 C 85,87 87,85 87,83 L 81,25 L 68,18"
                fill={color}
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="1"
              />

              {/* Underarm sleeve seam */}
              <path d="M 28,45 L 28,87" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
              <path d="M 72,45 L 72,87" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />

              {/* Shoulder seam */}
              <path d="M 19,25 C 22,35 25,40 28,45" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
              <path d="M 81,25 C 78,35 75,40 72,45" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />

              {/* Front Kangaroo Pocket */}
              <path
                d="M 33,65 C 33,62 35,60 38,60 L 62,60 C 65,60 67,62 67,65 L 71,80 C 71,83 69,85 66,85 L 34,85 C 31,85 29,83 29,80 Z"
                fill="none"
                stroke="rgba(0,0,0,0.22)"
                strokeWidth="1"
              />
              <path d="M 33,65 C 33,62 35,60 38,60 L 62,60 C 65,60 67,62 67,65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.2" />

              {/* Ribbed Hem & Cuffs */}
              <line x1="28" y1="90" x2="72" y2="90" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />

              {/* Drawstrings */}
              <path d="M 44,18 C 44,25 43,30 42,35" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M 56,18 C 56,26 57,28 58,33" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.2" strokeLinecap="round" />

              {/* Drawstring metal tips */}
              <rect x="41.5" y="35" width="1" height="3" rx="0.5" fill="#C0C0C0" />
              <rect x="57.5" y="33" width="1" height="3" rx="0.5" fill="#C0C0C0" />
            </svg>

            {/* Design Container (chest area above pocket) */}
            {url && (
              <div
                className="absolute overflow-hidden flex items-center justify-center"
                style={{
                  left: '35%',
                  top: '28%',
                  width: '30%',
                  height: '28%',
                }}
              >
                <img
                  src={url}
                  alt="artwork hoodie mockup"
                  className="max-w-full max-h-full object-contain"
                  style={{ mixBlendMode: color === '#E3DEC3' ? 'multiply' : 'normal', opacity: color === '#E3DEC3' ? 0.95 : 0.9 }}
                />
              </div>
            )}

            {/* Crease Overlays */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-45">
                {/* Heavy folds on sleeves */}
                <path d="M 16,30 C 14,45 20,55 22,65" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
                <path d="M 84,30 C 86,45 80,55 78,65" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
                {/* Upper chest folds over design */}
                <path d="M 34,32 C 45,35 55,27 66,33" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.8" />
                <path d="M 33,48 C 45,46 52,53 67,47" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
              </svg>
            </div>

            {!url && (
              <span className="absolute text-[10px] uppercase font-bold text-white/40 tracking-wider">No Artwork</span>
            )}
          </div>
        )}
      </div>

      {/* Interactive Color Picker row */}
      <div className="absolute bottom-2 right-2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1.5 rounded-full z-20">
        {colors.map(col => (
          <button
            key={col.hex}
            onClick={() => setColor(col.hex)}
            className={`w-4 h-4 rounded-full border transition-all duration-200 hover:scale-125 ${color === col.hex ? 'border-white scale-110 shadow-md' : 'border-white/25'}`}
            style={{ backgroundColor: col.hex }}
            title={col.name}
          />
        ))}
      </div>
    </div>
  );
};

const StudioPublishWizard = ({ onSignOut }: { onSignOut?: () => void }) => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const loggedUser = (() => { try { const r = localStorage.getItem('offgrid_user'); return r ? JSON.parse(r) : null; } catch { return null; } })();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedPublicId, setPublicId] = useState('');
  const [fileName, setFileName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['Cyberpunk', 'Minimalist', 'Digital Art']);
  const [newTag, setNewTag] = useState('');
  const [selectedProducts, setSelectedProducts] = useState({ hoodie: true, tshirt: true, print: false });
  const [margins, setMargins] = useState({ hoodie: 50, tshirt: 33, print: 200 });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [salesMultiplier, setSalesMultiplier] = useState(50); // simulator units sold
  const [dragOver, setDragOver] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const font = { fontFamily: 'Inter, sans-serif' };
  const syne = { fontFamily: 'Syne, sans-serif' };

  // Pricing setups in INR (₹)
  const productDefinitions = [
    { id: 'hoodie' as const, name: 'Oversized Hoodie', base: 2600, minM: 10, maxM: 150, step: 5, gradient: GRADIENTS.hoodie },
    { id: 'tshirt' as const, name: 'Essential Tee', base: 1400, minM: 10, maxM: 150, step: 5, gradient: GRADIENTS.tee },
    { id: 'print' as const, name: 'Gallery Print (12x18)', base: 950, minM: 10, maxM: 300, step: 10, gradient: GRADIENTS.print },
  ];

  const handleFile = async (file: File) => {
    setUploadError('');
    setSaved(false);
    const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'];
    if (!ALLOWED.includes(file.type)) { setUploadError('Invalid file type. Use PNG, JPG, WebP, SVG or PDF.'); return; }
    if (file.size > 50 * 1024 * 1024) { setUploadError('File too large. Max 50 MB.'); return; }
    setFileName(file.name);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch('/api/designs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: base64, fileName: file.name, fileType: file.type, fileSize: file.size }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadedUrl(data.secure_url);
      setPublicId(data.public_id ?? '');
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    const activeKeys = Object.entries(selectedProducts)
      .filter(([_, active]) => active)
      .map(([key]) => key as 'hoodie' | 'tshirt' | 'print');

    if (activeKeys.length === 0) {
      setUploadError('Please select at least one product type to publish.');
      return;
    }
    if (!uploadedUrl) {
      setUploadError('Please upload an artwork first.');
      return;
    }
    if (!title.trim()) {
      setUploadError('Please enter a design title.');
      return;
    }

    setSaving(true);
    setUploadError('');

    try {
      // 1. Publish the first active product (creates Design + Product)
      const firstType = activeKeys[0];
      const firstDef = productDefinitions.find(d => d.id === firstType)!;
      const firstMargin = margins[firstType];
      const firstBase = firstDef.base;
      const firstEarn = Math.round(firstBase * (firstMargin / 100));

      const res = await fetch('/api/designs/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cloudinaryUrl: uploadedUrl,
          publicId: uploadedPublicId,
          title: title.trim(),
          description: description.trim(),
          designerId: loggedUser?.id ?? 'dsg-guest',
          designerName: loggedUser?.name ?? 'Guest Designer',
          tags,
          productType: firstType,
          baseCostINR: firstBase,
          designerPriceINR: firstEarn,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish design');

      const designId = data.design.id;

      // 2. Publish other active products linked to this design ID
      for (let i = 1; i < activeKeys.length; i++) {
        const nextType = activeKeys[i];
        const nextDef = productDefinitions.find(d => d.id === nextType)!;
        const nextMargin = margins[nextType];
        const nextBase = nextDef.base;
        const nextEarn = Math.round(nextBase * (nextMargin / 100));

        const pRes = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designId,
            designerId: loggedUser?.id ?? 'dsg-guest',
            designerName: loggedUser?.name ?? 'Guest Designer',
            title: `${title.trim()} (${nextDef.name})`,
            description: description.trim(),
            productType: nextType,
            image: uploadedUrl,
            baseCostINR: nextBase,
            designerPriceINR: nextEarn,
          }),
        });

        if (!pRes.ok) {
          console.warn(`Failed to launch additional product: ${nextType}`);
        }
      }

      setSaved(true);
      setTimeout(() => rNavigate('/dashboard'), 1500);
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (percent: number) => {
    setMargins({
      hoodie: percent,
      tshirt: percent,
      print: percent * 2,
    });
  };

  const activeDefs = productDefinitions.filter(d => selectedProducts[d.id]);
  const averageProfit = activeDefs.length > 0
    ? Math.round(activeDefs.reduce((sum, d) => sum + (d.base * (margins[d.id] / 100)), 0) / activeDefs.length)
    : 0;

  const totalBundleProfit = activeDefs.reduce((sum, d) => sum + (d.base * (margins[d.id] / 100)), 0);

  return (
    <div className="flex text-[#241910] min-h-screen bg-[#fff8f5]" style={{ background: '#fff8f5' }}>
      <StudioSidebar activeItem="designs" onSignOut={onSignOut} />

      <main className="flex-1 min-h-screen relative flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 md:px-12 bg-[#fff8f5]/90 backdrop-blur-md border-b border-[#e6beb2] sticky top-0 z-50">
          <div className="flex items-center gap-10">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as any)} className="text-[#5c4037] hover:text-[#aa3000] transition-colors">
                <Icon name="arrow_back" size={22} />
              </button>
            )}
            <div>
              <h1 className="text-[24px] font-semibold text-[#aa3000] leading-none" style={syne}>
                {step === 1 && 'Step 1: Upload Artwork'}
                {step === 2 && 'Step 2: Dynamic Pricing'}
                {step === 3 && 'Step 3: Final Review & Publish'}
              </h1>
              <p className="text-[10px] text-[#5c4037] mt-1 uppercase font-bold tracking-wider" style={font}>
                {step === 1 && 'ARTWORK UPLOAD & INITIAL TITLE'}
                {step === 2 && 'CREATOR MARGIN & LIVE MOCKUPS'}
                {step === 3 && 'METADATA INGESTION & LAUNCH'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <div className={`w-12 h-1.5 transition-all duration-300 ${step >= 1 ? 'bg-[#aa3000]' : 'bg-[#f4dfcf]'}`} />
              <div className={`w-12 h-1.5 transition-all duration-300 ${step >= 2 ? 'bg-[#aa3000]' : 'bg-[#f4dfcf]'}`} />
              <div className={`w-12 h-1.5 transition-all duration-300 ${step >= 3 ? 'bg-[#aa3000]' : 'bg-[#f4dfcf]'}`} />
            </div>
            <span className="text-[10px] text-[#aa3000] uppercase tracking-widest font-bold" style={font}>
              Step 0{step}/03
            </span>
          </div>
        </header>

        {/* Perspective grid background */}
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #ede4d8 1px, transparent 1px), linear-gradient(to bottom, #ede4d8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full z-10">
          {uploadError && (
            <div className="mb-6 bg-[#ffdad6] border border-[#ba1a1a] text-[#93000a] px-6 py-4 rounded-lg text-[14px] flex items-center gap-3" style={font}>
              <Icon name="error" size={20} className="text-[#ba1a1a]" />
              {uploadError}
            </div>
          )}

          {/* ────────────────── STEP 1: UPLOAD ────────────────── */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div
                  className={`bg-white rounded-xl p-10 transition-all duration-300 flex flex-col items-center justify-center min-h-[420px] text-center cursor-pointer hover:border-[#aa3000]/60 ${dragOver ? 'border-[#aa3000] bg-[#fff1e8]' : ''}`}
                  style={{ border: `2px dashed ${dragOver ? '#aa3000' : '#EDE4D8'}`, boxShadow: '0px 10px 30px rgba(0,0,0,0.02)' }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp,.svg,.pdf" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

                  {uploading ? (
                    <>
                      <div className="w-12 h-12 border-4 border-[#aa3000] border-t-transparent rounded-full animate-spin mb-6" />
                      <p className="text-[16px] text-[#5c4037] font-semibold" style={font}>Uploading to Cloudinary…</p>
                    </>
                  ) : uploadedUrl ? (
                    <>
                      <img src={uploadedUrl} alt="Uploaded" className="max-h-56 rounded-lg mb-6 object-contain border border-[#e6beb2] shadow-sm bg-[#fff8f5]" />
                      <p className="text-[14px] font-semibold text-[#4f6600] flex items-center gap-1 mb-6" style={font}>
                        <Icon name="check_circle" size={18} className="text-[#4f6600]" /> {fileName} uploaded
                      </p>
                      <div className="w-full text-left" onClick={e => e.stopPropagation()}>
                        <label className="text-[10px] font-bold uppercase text-[#5c4037] mb-2 block tracking-wider" style={font}>Design Title *</label>
                        <input
                          type="text"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="e.g. Neon Samurai Graphic"
                          className="w-full bg-[#fff8f5] border border-[#e6beb2] px-4 py-4 text-[14px] rounded-lg focus:outline-none focus:border-[#aa3000] focus:ring-1 focus:ring-[#aa3000]"
                          style={font}
                        />
                      </div>
                      <button className="mt-6 text-[13px] text-[#aa3000] underline underline-offset-4 hover:text-[#d43f00] transition-colors" style={font} onClick={e => { e.stopPropagation(); setUploadedUrl(''); setFileName(''); setTitle(''); }}>
                        Upload different file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={`w-20 h-20 bg-[#ffdbd0] rounded-full flex items-center justify-center mb-6 transition-transform duration-300 ${dragOver ? 'scale-110' : ''}`}>
                        <Icon name="cloud_upload" size={36} className="text-[#aa3000]" />
                      </div>
                      <h2 className="text-[24px] font-bold mb-2" style={{ ...syne, lineHeight: 1.3 }}>Drag &amp; drop artwork</h2>
                      <p className="text-[14px] text-[#5c4037] max-w-sm mx-auto mb-8 leading-relaxed" style={font}>PNG, JPG, WebP, SVG or PDF · Max 50 MB</p>
                      <span className="bg-[#aa3000] text-white text-[13px] font-semibold px-8 py-4 rounded-lg uppercase tracking-wider hover:brightness-110 transition-all shadow-md" style={font}>
                        Browse Files
                      </span>
                    </>
                  )}
                </div>

                <div className="bg-[#fff1e8] p-6 rounded-lg border-l-4 border-[#bdf200]">
                  <p className="text-[15px] text-[#241910] italic leading-relaxed" style={font}>
                    "Ensure your vectors are clean and raster images are at 300 DPI for the best physical reproduction."
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="bg-[#bdf200] text-[#526b00] px-2 py-1 text-[10px] font-bold rounded uppercase" style={font}>Quality Guide</span>
                    <span className="bg-[#bdf200] text-[#526b00] px-2 py-1 text-[10px] font-bold rounded uppercase" style={font}>SVG Tips</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 sticky top-28">
                <div className="bg-[#ffeadb] rounded-xl overflow-hidden border border-[#EDE4D8] relative shadow-sm" style={{ aspectRatio: '4/5' }}>
                  {uploadedUrl ? (
                    <div className="w-full h-full p-10 bg-white flex items-center justify-center">
                      <img src={uploadedUrl} alt="preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <GradientImg gradient={GRADIENTS.hoodie} className="h-full w-full" />
                  )}
                  {!uploadedUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
                      <div className="border-2 border-[#aa3000] border-dashed w-48 h-64 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-[#aa3000] uppercase" style={font}>Artwork Area</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 bg-[#fff8f5]/90 backdrop-blur-md p-4 rounded border border-[#e6beb2] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[#5c4037] uppercase" style={font}>Live Canvas Preview</p>
                      <p className="text-[14px] font-semibold truncate max-w-[200px]" style={font}>{fileName || 'Heavyweight Hoodie Template'}</p>
                    </div>
                    <div className="flex -space-x-2">
                      {['#1A1410', '#EDE4D8', '#FF4D00'].map(c => <div key={c} className="w-6 h-6 rounded-full border border-white" style={{ background: c }} />)}
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => uploadedUrl ? setStep(2) : setUploadError('Please upload your artwork first.')}
                    className={`w-full text-center py-5 rounded-lg text-[14px] font-bold uppercase tracking-wider transition-all ${uploadedUrl ? 'bg-[#aa3000] text-white hover:brightness-110' : 'bg-[#f4dfcf] text-[#5c4037] cursor-not-allowed'}`}
                    style={uploadedUrl ? { boxShadow: '4px 4px 0px 0px #3a0b00', ...font } : font}
                  >
                    Continue to Step 2 <Icon name="arrow_forward" size={16} className="align-middle ml-2 text-inherit" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────── STEP 2: PRICING ────────────────── */}
          {step === 2 && (
            <div className="space-y-10 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#e6beb2] pb-6">
                <div className="pl-6 border-l-4 border-[#bdf200]">
                  <p className="text-[18px] md:text-[22px] font-bold text-[#5c4037] italic" style={syne}>
                    "Balance your reach and royalty. Choose high-impact margins for your custom drops."
                  </p>
                </div>
                {/* Presets */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] font-bold text-[#5c4037] uppercase mr-2" style={font}>Margin Presets:</span>
                  {[
                    { label: 'Volume (25%)', val: 25 },
                    { label: 'Sweet Spot (50%)', val: 50 },
                    { label: 'Premium (100%)', val: 100 }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset.val)}
                      className="px-4 py-2 bg-white border border-[#e6beb2] rounded-full text-[12px] font-bold hover:bg-[#aa3000] hover:text-white hover:border-[#aa3000] transition-colors"
                      style={font}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {productDefinitions.map(p => {
                  const isActive = selectedProducts[p.id];
                  const margin = margins[p.id];
                  const earn = Math.round(p.base * (margin / 100));
                  const total = p.base + earn;
                  const earnPct = (earn / total) * 100;
                  const basePct = (p.base / total) * 100;

                  return (
                    <div
                      key={p.id}
                      className={`bg-white border rounded-xl p-6 transition-all duration-300 relative flex flex-col justify-between ${isActive ? 'border-[#aa3000] shadow-[0px_10px_30px_rgba(170,48,0,0.04)]' : 'border-[#e6beb2] opacity-60'}`}
                    >
                      {/* Top Bar: Name & Toggle */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-[18px] font-bold" style={syne}>{p.name}</h3>
                          <span className="text-[10px] font-bold text-[#5c4037] uppercase tracking-wider" style={font}>Base: ₹{p.base.toLocaleString('en-IN')}</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isActive}
                            onChange={() => setSelectedProducts(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                          />
                          <div className="w-11 h-6 bg-[#f4dfcf] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#aa3000]" />
                        </label>
                      </div>

                      {/* Mockup Box */}
                      <div className="aspect-square w-full rounded-lg overflow-hidden border border-[#ede4d8] mb-6">
                        <ProductMockup type={p.id} url={uploadedUrl} />
                      </div>

                      {/* Controls */}
                      {isActive ? (
                        <div className="space-y-6">
                          {/* Split profit visualizer bar */}
                          <div>
                            <div className="flex h-3 w-full bg-[#f4dfcf] rounded-full overflow-hidden mb-2">
                              <div className="bg-[#5c4037]" style={{ width: `${basePct}%` }} />
                              <div className="bg-[#bdf200]" style={{ width: `${earnPct}%` }} />
                            </div>
                            <div className="flex justify-between text-[9px] font-bold text-[#5c4037] uppercase" style={font}>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#5c4037]" /> Base: ₹{p.base.toLocaleString('en-IN')}</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#bdf200]" /> Margin: {margin}%</span>
                            </div>
                          </div>

                          {/* Slider */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[11px] font-bold text-[#5c4037] uppercase" style={font}>Adjust Margin</span>
                              <span className="text-[20px] font-bold text-[#aa3000]" style={syne}>+₹{earn.toLocaleString('en-IN')}</span>
                            </div>
                            <input
                              type="range"
                              min={p.minM}
                              max={p.maxM}
                              step={p.step}
                              value={margin}
                              onChange={e => setMargins(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                              className="w-full h-2 bg-[#f4dfcf] rounded-full appearance-none cursor-pointer"
                              style={{ accentColor: '#aa3000' }}
                            />
                            <div className="flex justify-between text-[9px] font-bold text-[#5c4037]" style={font}>
                              <span>Min Margin ({p.minM}%)</span>
                              <span>Max Margin ({p.maxM}%)</span>
                            </div>
                          </div>

                          {/* Listing Retail Price */}
                          <div className="pt-4 border-t border-[#ede4d8] flex justify-between items-center">
                            <span className="text-[12px] font-bold text-[#5c4037] uppercase" style={font}>Listing Price:</span>
                            <span className="text-[26px] font-black text-[#aa3000]" style={syne}>₹{total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[200px] border border-dashed border-[#ede4d8] rounded bg-[#fff8f5]/40">
                          <p className="text-[13px] text-[#5c4037] italic" style={font}>Product Inactive</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Projections Simulator Dashboard */}
              <div className="bg-white border border-[#e6beb2] rounded-xl p-8 shadow-sm">
                <h4 className="text-[16px] font-bold uppercase tracking-wider mb-6 flex items-center gap-2" style={syne}>
                  <Icon name="calculate" size={20} className="text-[#aa3000]" /> Projected Earnings Calculator
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[14px] font-semibold" style={font}>Simulated Sales Count:</span>
                      <span className="text-[24px] font-bold text-[#aa3000]" style={syne}>{salesMultiplier} units</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={salesMultiplier}
                      onChange={e => setSalesMultiplier(Number(e.target.value))}
                      className="w-full h-3 bg-[#f4dfcf] rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#aa3000' }}
                    />
                    <p className="text-[13px] text-[#5c4037] italic" style={font}>
                      Adjust the slider to simulate total sales across all active merchandise packages.
                    </p>
                  </div>

                  {/* Dynamic Earnings readout */}
                  <div className="lg:col-span-4 bg-[#fff1e8] p-6 border-l-4 border-[#bdf200] rounded-r-lg text-center lg:text-left">
                    <span className="text-[10px] font-bold text-[#5c4037] uppercase tracking-widest" style={font}>Estimated Creator Payout</span>
                    <h5 className="text-[36px] font-black text-[#aa3000] my-1 leading-none" style={syne}>
                      ₹{(totalBundleProfit * salesMultiplier).toLocaleString('en-IN')}
                    </h5>
                    <p className="text-[11px] text-[#5c4037] mt-1" style={font}>
                      Based on bundle sales profit of ₹{totalBundleProfit.toLocaleString('en-IN')} per order
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-6 border-t border-[#e6beb2] flex justify-between items-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-4 bg-transparent border border-[#241910] text-[#241910] text-[13px] font-bold uppercase tracking-wider hover:bg-[#fff1e8] transition-colors rounded"
                  style={font}
                >
                  Back to Step 1
                </button>
                <button
                  onClick={() => activeDefs.length > 0 ? setStep(3) : setUploadError('Please enable at least one active product.')}
                  className={`px-10 py-4 text-[13px] font-bold uppercase tracking-wider rounded transition-all ${activeDefs.length > 0 ? 'bg-[#aa3000] text-white hover:brightness-110' : 'bg-[#f4dfcf] text-[#5c4037] cursor-not-allowed'}`}
                  style={activeDefs.length > 0 ? { boxShadow: '4px 4px 0px 0px #3a0b00', ...font } : font}
                >
                  Continue to Step 3 <Icon name="arrow_forward" size={16} className="align-middle ml-2 text-inherit" />
                </button>
              </div>
            </div>
          )}

          {/* ────────────────── STEP 3: FINAL REVIEW ────────────────── */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              {/* Left Column: Form & Mockup Grids */}
              <div className="lg:col-span-8 space-y-6">

                {/* Artwork Hero Summary */}
                <section className="bg-white border border-[#e6beb2] rounded-xl p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-32 h-32 bg-[#fff1e8] border border-[#ede4d8] rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-2">
                      {uploadedUrl ? (
                        <img src={uploadedUrl} alt="Design summary" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <GradientImg gradient={GRADIENTS.art1} className="h-full" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#aa3000] uppercase tracking-widest" style={font}>Selected Artwork Drop</span>
                      <h2 className="text-[28px] font-black text-[#241910] leading-tight mt-1" style={syne}>{title || 'Untitled Drop'}</h2>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {productDefinitions.map(d => {
                          const isActive = selectedProducts[d.id];
                          if (!isActive) return null;
                          const earn = Math.round(d.base * (margins[d.id] / 100));
                          return (
                            <span key={d.id} className="px-3 py-1 bg-[#ffeadb] border border-[#e6beb2] text-[11px] font-bold rounded-full uppercase" style={font}>
                              {d.name} · ₹{(d.base + earn).toLocaleString('en-IN')}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Editable Metadata Forms */}
                <section className="bg-white border border-[#e6beb2] rounded-xl p-8 shadow-sm space-y-6">
                  <h3 className="text-[20px] font-bold border-b border-[#ede4d8] pb-4" style={syne}>Ingest Metadata</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-[#5c4037] uppercase tracking-wider mb-2 block" style={font}>Modify Title</label>
                      <input
                        className="w-full bg-[#fff8f5] border border-[#e6beb2] p-4 text-[14px] focus:outline-none focus:border-[#aa3000] transition-colors rounded-lg"
                        style={font}
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5c4037] uppercase tracking-wider mb-2 block" style={font}>Design Narrative/Description</label>
                      <textarea
                        className="w-full bg-[#fff8f5] border border-[#e6beb2] p-4 text-[14px] focus:outline-none focus:border-[#aa3000] transition-colors rounded-lg resize-none"
                        style={{ ...font, lineHeight: 1.6 }}
                        rows={4}
                        placeholder="Write an artistic narrative describing the design, colors, and inspiration..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5c4037] uppercase tracking-wider mb-2 block" style={font}>Artwork Tags (Separated by enters/commas)</label>
                      <div className="flex flex-wrap gap-2 items-center p-3 bg-[#fff8f5] border border-[#e6beb2] rounded-lg">
                        {tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-[#bdf200] text-[#526b00] text-[12px] font-bold rounded-full flex items-center gap-1" style={font}>
                            {tag}
                            <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="text-[#526b00] hover:text-[#aa3000] ml-1">
                              <Icon name="close" size={14} />
                            </button>
                          </span>
                        ))}
                        <input
                          className="bg-transparent border-none focus:outline-none text-[14px] p-1 flex-1 min-w-[120px]"
                          placeholder="Type tag & hit Enter"
                          type="text"
                          style={font}
                          value={newTag}
                          onChange={e => setNewTag(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              const trimmed = newTag.trim();
                              if (trimmed && !tags.includes(trimmed)) {
                                setTags(prev => [...prev, trimmed]);
                                setNewTag('');
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Earnings Summary & One-Click Launch */}
              <div className="lg:col-span-4 space-y-6 sticky top-28">
                {/* Visual Invoice Summary */}
                <section className="bg-white border border-[#e6beb2] rounded-xl p-8 shadow-sm">
                  <h3 className="text-[18px] font-bold border-b border-[#ede4d8] pb-4 mb-4" style={syne}>Active Royalty Rates</h3>
                  <div className="space-y-4">
                    {activeDefs.map(d => {
                      const earn = Math.round(d.base * (margins[d.id] / 100));
                      const retail = d.base + earn;
                      return (
                        <div key={d.id} className="flex justify-between items-center py-2 border-b border-[#e6beb2]/20">
                          <div>
                            <p className="text-[14px] font-semibold" style={font}>{d.name}</p>
                            <p className="text-[10px] text-[#5c4037]" style={font}>Base: ₹{d.base.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[14px] font-bold text-[#aa3000]" style={font}>₹{retail.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-[#4f6600] font-bold" style={font}>+₹{earn.toLocaleString('en-IN')} Profit</p>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-4 flex justify-between items-center">
                      <span className="text-[14px] font-bold uppercase tracking-wider" style={font}>Average Profit per Item:</span>
                      <span className="text-[20px] font-black text-[#4f6600]" style={syne}>₹{averageProfit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </section>

                {/* Final Launch actions */}
                <section className="space-y-4">
                  {saved ? (
                    <div className="bg-[#e6f4ea] border border-[#34a853] text-[#137333] px-6 py-5 rounded-lg text-center font-bold" style={font}>
                      <Icon name="check_circle" size={24} className="align-middle mr-2 text-inherit" />
                      Drop Launched Successfully! Returning to Dashboard...
                    </div>
                  ) : (
                    <button
                      className="w-full py-6 bg-[#aa3000] text-white text-[20px] font-bold rounded-lg flex items-center justify-center gap-3 transition-all hover:scale-95 disabled:opacity-50"
                      style={{ boxShadow: '4px 4px 0px 0px #3a0b00', fontFamily: 'Syne, sans-serif' }}
                      disabled={saving}
                      onClick={handlePublish}
                    >
                      {saving ? 'Launching Drop...' : 'Publish to Shop'}
                      <Icon name="rocket_launch" size={22} className="text-white" />
                    </button>
                  )}

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-4 text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#fff1e8] transition-colors border border-[#241910] rounded"
                    style={font}
                  >
                    <Icon name="arrow_back" size={16} /> Back to Pricing Selection
                  </button>

                  <p className="text-center text-[10px] font-bold text-[#5c4037]/60 uppercase tracking-widest px-6 leading-relaxed" style={font}>
                    By publishing, you agree to the <a href="#" className="underline hover:text-[#aa3000]">Creator Terms</a> and confirm you own the rights to this artwork.
                  </p>
                </section>

                {/* Pro Creator Tip */}
                <div className="p-6 bg-[#fff1e8] rounded-xl border-l-4 border-[#bdf200]" style={{ boxShadow: '0px 10px 30px rgba(0,0,0,0.01)' }}>
                  <p className="text-[10px] font-bold text-[#aa3000] uppercase mb-1" style={font}>Pro Creator Tip</p>
                  <blockquote className="text-[14px] italic text-[#5c4037] leading-relaxed" style={font}>
                    "Using tags like 'streetwear' and 'techwear' increases shop filter discoverability by up to 45%."
                  </blockquote>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-auto p-4 border-t border-[#e6beb2] bg-[#fff1e8] flex justify-between items-center">
          <p className="text-[9px] font-bold text-[#5c4037] uppercase tracking-wider" style={font}>OFFGRID WIZARD ENGINE V.5.0</p>
          <div className="flex gap-6">
            <a href="#" className="text-[9px] font-bold text-[#5c4037] hover:text-[#aa3000] underline uppercase tracking-wider" style={font}>HELP CENTER</a>
            <a href="#" className="text-[9px] font-bold text-[#5c4037] hover:text-[#aa3000] underline uppercase tracking-wider" style={font}>TERMS</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// ROOT LAYOUT (wraps all routes via <Outlet />)
// ─────────────────────────────────────────────
export default function RootLayout() {
  const rNavigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('offgrid_user');
      return raw ? JSON.parse(raw) as AuthUser : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (u: AuthUser) => {
    setUser(u);
    try { localStorage.setItem('offgrid_user', JSON.stringify(u)); } catch { }
  };

  const handleLogout = () => {
    setUser(null);
    try { localStorage.removeItem('offgrid_user'); } catch { }
    setAuthOpen(false);
    setCartOpen(false);
    rNavigate('/');
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

  const isConsumerPage = !window.location.pathname.startsWith('/studio') && !window.location.pathname.startsWith('/dashboard');

  const ctx: AppCtx = {
    user, cartItems, cartOpen, authOpen, searchOpen,
    setCartOpen, setAuthOpen, setSearchOpen,
    handleLogin, handleLogout,
    addToCart, removeCartItem, changeCartQty,
  };

  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        <style>{`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-\\[ticker_30s_linear_infinite\\] {
            animation: ticker 30s linear infinite;
          }
          input[type='range'] {
            -webkit-appearance: none;
            appearance: none;
            background: transparent;
            cursor: pointer;
          }
          /* Webkit browsers */
          input[type='range']::-webkit-slider-runnable-track {
            height: 6px;
            background: #f4dfcf;
            border-radius: 3px;
          }
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            background: #aa3000;
            border: 3px solid #ffffff;
            box-shadow: 0px 4px 10px rgba(170, 48, 0, 0.4);
            border-radius: 50%;
            margin-top: -6px; /* centers the thumb on track */
            cursor: pointer;
            transition: transform 0.1s ease;
          }
          input[type='range']::-webkit-slider-thumb:hover {
            transform: scale(1.15);
          }
          /* Mozilla browsers */
          input[type='range']::-moz-range-track {
            height: 6px;
            background: #f4dfcf;
            border-radius: 3px;
          }
          input[type='range']::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #aa3000;
            border: 3px solid #ffffff;
            box-shadow: 0px 4px 10px rgba(170, 48, 0, 0.4);
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.1s ease;
          }
          input[type='range']::-moz-range-thumb:hover {
            transform: scale(1.15);
          }
        `}</style>

        {isConsumerPage && (
          <TopNav
            cartCount={cartItems.reduce((s, i) => s + i.qty, 0)}
            onCartClick={() => setCartOpen(true)}
            onAuthClick={() => user ? rNavigate('/dashboard') : setAuthOpen(true)}
            onSearchClick={() => setSearchOpen(true)}
          />
        )}

        {/* All page components are rendered here by react-router */}
        <Outlet context={ctx} />

        {/* Overlays */}
        {cartOpen && (
          <CartDrawer
            items={cartItems}
            onClose={() => setCartOpen(false)}
            onRemove={removeCartItem}
            onQtyChange={changeCartQty}
          />
        )}
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={handleLogin} />}
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </div>
    </AppContext.Provider>
  );
}

export {
  RootLayout as ReferenceApp,
  HomePage,
  ShopPage,
  ProductPage,
  DashboardPage,
  StudioPublishWizard,
  CreatorPage,
};
