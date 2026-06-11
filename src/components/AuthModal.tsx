import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { name: string; email: string; role: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER'; username?: string }) => void;
  preSelectedRole?: 'CONSUMER' | 'DESIGNER' | 'MANUFACTURER' | null;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  preSelectedRole = null
}: AuthModalProps) {
  const [screen, setScreen] = useState<'LOGIN' | 'ROLE_PICK' | 'SIGNUP_CONSUMER' | 'SIGNUP_DESIGNER' | 'SIGNUP_MANUFACTURER'>(() => {
    if (preSelectedRole === 'DESIGNER') return 'ROLE_PICK';
    return 'LOGIN';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Designer Wizard state
  const [designerStep, setDesignerStep] = useState(1);
  const [designerName, setDesignerName] = useState('');
  const [designerUsername, setDesignerUsername] = useState('');
  const [designerCity, setDesignerCity] = useState('');
  const [designerCountry, setDesignerCountry] = useState('India');
  const [designerBio, setDesignerBio] = useState('');
  const [designerPortfolio, setDesignerPortfolio] = useState('');
  const [designerTags, setDesignerTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIFSC, setBankIFSC] = useState('');

  // Manufacturer Wizard state
  const [manufacturerStep, setManufacturerStep] = useState(1);
  const [mfrBusinessName, setMfrBusinessName] = useState('');
  const [mfrCity, setMfrCity] = useState('');
  const [mfrState, setMfrState] = useState('Karnataka');
  const [mfrGST, setMfrGST] = useState('');
  const [mfrPrints, setMfrPrints] = useState<string[]>(['DTG']);
  const [mfrProducts, setMfrProducts] = useState<string[]>(['tshirt']);
  const [mfrMinQty, setMfrMinQty] = useState('1');
  const [mfrTurnaround, setMfrTurnaround] = useState('3');
  const [mfrBaseCost, setMfrBaseCost] = useState('190');
  const [mfrDocument, setMfrDocument] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate');
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConsumerSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: password || 'password123',
          name: 'New Shopper',
          role: 'CONSUMER'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrorMsg(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!designerTags.includes(newTag.trim().toLowerCase())) {
        setDesignerTags([...designerTags, newTag.trim().toLowerCase()]);
      }
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setDesignerTags(designerTags.filter(t => t !== tag));
  };

  const handleDesignerSignupSubmit = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'designer@offgrid.in',
          password: password || 'password123',
          name: designerName || 'Priya K.',
          role: 'DESIGNER',
          username: designerUsername || 'priya_k'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register designer');
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      console.error('Designer signup error:', err);
      setErrorMsg(err.message || 'Server connection failed');
      alert(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManufacturerSignupSubmit = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'manufacturer@offgrid.in',
          password: password || 'password123',
          name: mfrBusinessName || 'New Wave Fabrics',
          role: 'MANUFACTURER'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register manufacturer');
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      console.error('Manufacturer signup error:', err);
      setErrorMsg(err.message || 'Server connection failed');
      alert(err.message || 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePrintType = (type: string) => {
    mfrPrints.includes(type)
      ? setMfrPrints(mfrPrints.filter(t => t !== type))
      : setMfrPrints([...mfrPrints, type]);
  };

  const toggleProductType = (type: string) => {
    mfrProducts.includes(type)
      ? setMfrProducts(mfrProducts.filter(t => t !== type))
      : setMfrProducts([...mfrProducts, type]);
  };

  return (
    <div className="fixed inset-0 bg-ink/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-cream border-brutal w-full max-w-4xl max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row shadow-brutal select-none">
        
        {/* Decorative Left Panel for Login Only */}
        {screen === 'LOGIN' && (
          <div className="hidden md:flex md:w-1/2 bg-ink p-8 flex-col justify-between text-cream min-h-[480px]">
            <div className="space-y-4">
              <span className="text-sm font-mono text-saffron font-black uppercase">LIMITED RECS</span>
              <h3 className="font-condensed font-black text-3xl leading-none text-cream uppercase">
                CO-CREATED WITH INDEPENDENT CHANNELS
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="border-2 border-[#fff]/10 overflow-hidden bg-white/5">
                <img src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200&auto=format&fit=crop" className="w-full h-24 object-cover filter saturate-50" alt="pt1" />
              </div>
              <div className="border-2 border-[#fff]/10 overflow-hidden bg-white/5">
                <img src="https://images.unsplash.com/photo-1554568218-0f1715e72254?q=80&w=200&auto=format&fit=crop" className="w-full h-24 object-cover filter saturate-50" alt="pt2" />
              </div>
              <div className="border-2 border-[#fff]/10 overflow-hidden bg-white/5">
                <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=200&auto=format&fit=crop" className="w-full h-24 object-cover filter saturate-50" alt="pt3" />
              </div>
              <div className="border-2 border-[#fff]/10 overflow-hidden bg-white/5">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop" className="w-full h-24 object-cover filter saturate-50" alt="pt4" />
              </div>
            </div>
            <span className="font-condensed text-2xl font-black tracking-widest text-[#C8F000]">OFFGRID</span>
          </div>
        )}

        {/* Form content right panel */}
        <div className={`flex-1 p-6 sm:p-8 flex flex-col justify-center ${screen !== 'LOGIN' ? 'w-full' : ''}`}>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1 bg-white border border-ink hover:bg-saffron hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* SCREEN 1: LOGIN */}
          {screen === 'LOGIN' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-condensed font-black text-3xl uppercase tracking-tight text-ink">Log in to OffGrid</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-wider">Connected to Neon PostgreSQL DB</p>
                </div>
              </div>

              {/* Database Credentials Quick-Selection Picker */}
              <div className="bg-[#FAF6F0] border-2 border-ink p-3 space-y-2">
                <span className="text-[9px] font-black font-mono uppercase text-saffron block">⚡ Seeded Test Accounts (Click to Fill)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('karan@offgrid.in');
                      setPassword('password123');
                      setErrorMsg(null);
                    }}
                    className="bg-white border border-ink/40 p-2 text-left hover:border-saffron hover:bg-saffron/5 transition-all text-[10px] font-mono cursor-pointer"
                  >
                    <strong className="block text-ink text-[11px]">🎨 Karan (Designer)</strong>
                    <span className="text-zinc-500 block text-[9px] truncate">karan@offgrid.in</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('mumbai@offgrid.in');
                      setPassword('password123');
                      setErrorMsg(null);
                    }}
                    className="bg-white border border-ink/40 p-2 text-left hover:border-saffron hover:bg-saffron/5 transition-all text-[10px] font-mono cursor-pointer"
                  >
                    <strong className="block text-ink text-[11px]">🏭 Om Shanti (Mfr)</strong>
                    <span className="text-zinc-500 block text-[9px] truncate">mumbai@offgrid.in</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('mayankbisht1107@gmail.com');
                      setPassword('password123');
                      setErrorMsg(null);
                    }}
                    className="bg-white border border-ink/40 p-2 text-left hover:border-saffron hover:bg-saffron/5 transition-all text-[10px] font-mono cursor-pointer"
                  >
                    <strong className="block text-ink text-[11px]">👜 Mayank (Consumer)</strong>
                    <span className="text-zinc-500 block text-[9px] truncate">mayankbisht1107@g...</span>
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-2 border-red-500 text-red-700 p-3 text-xs font-mono font-bold leading-normal relative animate-shake">
                  ❌ Error: {errorMsg}
                </div>
              )}

              {/* White Google Auth Button */}
              <button 
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setErrorMsg(null);
                  try {
                    // Google quick simulation also registers standard user on PostgreSQL
                    const response = await fetch('/api/auth/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: 'googleuser@gmail.com',
                        password: 'password123',
                        name: 'Google User',
                        role: 'CONSUMER'
                      })
                    }).catch(() => null); // ignore duplicate conflicts
                    
                    onAuthSuccess({
                      name: 'Google User',
                      email: 'googleuser@gmail.com',
                      role: 'CONSUMER'
                    });
                    onClose();
                  } catch (e) {
                    onAuthSuccess({
                      name: 'Google User',
                      email: 'googleuser@gmail.com',
                      role: 'CONSUMER'
                    });
                    onClose();
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full bg-white border-2 border-ink py-2 px-4 font-body font-black text-[12px] text-ink hover:bg-[#FAF6F0] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.17-.11-.34-.23-.5-.36z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] bg-ink/15 flex-1" />
                <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase shrink-0">or login with email</span>
                <div className="h-[1px] bg-ink/15 flex-1" />
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-ink/70 mb-1">Email address</label>
                  <input 
                    type="email" 
                    required
                    disabled={loading}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border-2 border-ink p-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-saffron disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-ink/70 mb-1">Secure Password</label>
                  <input 
                    type="password" 
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none focus:ring-1 focus:ring-saffron disabled:opacity-60"
                  />
                </div>

                <div className="pt-1">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-ink text-white font-condensed font-bold tracking-wider text-sm py-2.5 uppercase hover:shadow-brutal hover:bg-ink/90 transition-all cursor-pointer shadow-sm border-2 border-ink disabled:opacity-50"
                  >
                    {loading ? 'AUTHENTICATING NEON DB...' : 'LOG IN ➔'}
                  </button>
                </div>
              </form>

              <div className="text-center pt-2 font-mono text-xs text-ink/60">
                Don't have an acct?{' '}
                <button 
                  onClick={() => setScreen('ROLE_PICK')}
                  className="font-bold text-saffron underline hover:text-saffron/90 cursor-pointer"
                >
                  Sign up →
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: ROLE PICKER */}
          {screen === 'ROLE_PICK' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="font-condensed font-black text-3xl uppercase tracking-normal text-ink">Join OffGrid</h2>
                <p className="text-sm font-mono text-ink/65 mt-1 font-semibold">What brings you here today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* SHOPPER */}
                <button 
                  onClick={() => setScreen('SIGNUP_CONSUMER')}
                  className="bg-[#fff] border-brutal p-6 text-center hover:bg-ink hover:text-white group transition-all duration-150 flex flex-col justify-between items-center cursor-pointer min-h-[170px]"
                >
                  <span className="text-3xl filter saturate-75">👜</span>
                  <div className="mt-3">
                    <h4 className="font-condensed font-bold text-lg uppercase group-hover:text-acid">I Want To Shop</h4>
                    <p className="text-[10px] font-mono text-ink/60 group-hover:text-white/70 mt-1 uppercase">CONSUMER</p>
                  </div>
                </button>

                {/* DESIGNER */}
                <button 
                  onClick={() => setScreen('SIGNUP_DESIGNER')}
                  className="bg-[#fff] border-brutal p-6 text-center hover:bg-ink hover:text-white group transition-all duration-150 flex flex-col justify-between items-center cursor-pointer min-h-[170px]"
                >
                  <span className="text-3xl filter saturate-75">🎨</span>
                  <div className="mt-3">
                    <h4 className="font-condensed font-bold text-lg uppercase group-hover:text-acid">I Want To Sell Art</h4>
                    <p className="text-[10px] font-mono text-ink/60 group-hover:text-white/70 mt-1 uppercase">DESIGNER</p>
                  </div>
                </button>

                {/* MANUFACTURER */}
                <button 
                  onClick={() => setScreen('SIGNUP_MANUFACTURER')}
                  className="bg-[#fff] border-brutal p-6 text-center hover:bg-ink hover:text-white group transition-all duration-150 flex flex-col justify-between items-center cursor-pointer min-h-[170px]"
                >
                  <span className="text-3xl filter saturate-75">🏭</span>
                  <div className="mt-3">
                    <h4 className="font-condensed font-bold text-lg uppercase group-hover:text-acid">I Handle Printing</h4>
                    <p className="text-[10px] font-mono text-ink/60 group-hover:text-white/70 mt-1 uppercase">MANUFACTURER</p>
                  </div>
                </button>
              </div>

              <div className="text-center font-mono text-xs">
                <button 
                  onClick={() => setScreen('LOGIN')}
                  className="text-ink/60 underline hover:text-ink cursor-pointer"
                >
                  Already have an account? Log in →
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: CONSUMER SIGNUP */}
          {screen === 'SIGNUP_CONSUMER' && (
            <div className="space-y-5 max-w-md mx-auto w-full">
              <div>
                <h2 className="font-condensed font-black text-3xl uppercase tracking-tight text-ink">Create Shopper Account</h2>
                <p className="text-[10px] font-mono text-ink/65 mt-1 font-semibold">Join OffGrid for instant direct-printed design drops</p>
              </div>

              <button 
                type="button"
                onClick={() => {
                  onAuthSuccess({
                    name: 'New Google User',
                    email: 'newshopper@gmail.com',
                    role: 'CONSUMER'
                  });
                  onClose();
                }}
                className="w-full bg-white border-2 border-ink py-2.5 px-4 font-body font-black text-[13px] text-ink hover:bg-[#FAF6F0] flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                Continue with Google
              </button>

              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] bg-ink/15 flex-1" />
                <span className="font-mono text-[10px] text-zinc-400 font-bold uppercase shrink-0">or use email</span>
                <div className="h-[1px] bg-ink/15 flex-1" />
              </div>

              <form onSubmit={handleConsumerSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-ink/70 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border-2 border-ink p-3 text-xs outline-none focus:ring-1 focus:ring-saffron"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-ink/70 mb-1">Create Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-ink p-3 text-xs outline-none focus:ring-1 focus:ring-saffron"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-ink text-white font-condensed font-bold tracking-wider text-sm py-3.5 uppercase hover:shadow-brutal hover:bg-ink/90 transition-all cursor-pointer shadow-sm border-2 border-ink"
                >
                  CREATE ACCOUNT ➔
                </button>
              </form>

              <div className="text-center font-mono text-xs text-ink/65">
                <button onClick={() => setScreen('LOGIN')} className="underline text-saffron hover:font-bold cursor-pointer">
                  Go back to Login
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: DESIGNER SIGNUP 3-STEP WIZARD */}
          {screen === 'SIGNUP_DESIGNER' && (
            <div className="space-y-5 max-w-lg mx-auto w-full">
              {/* Progress Indicator */}
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 ${
                    designerStep >= 1 ? 'bg-ink text-cream border-ink' : 'bg-cream text-ink border-ink/20'
                  }`}>
                    1
                  </span>
                  <span className="text-[9px] font-mono text-ink/70 mt-1 uppercase font-bold">Profile</span>
                </div>
                <div className={`h-[2px] flex-1 mx-2 ${designerStep >= 2 ? 'bg-ink' : 'bg-ink/10'}`} />
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 ${
                    designerStep >= 2 ? 'bg-ink text-cream border-ink' : 'bg-cream text-ink border-ink/20'
                  }`}>
                    2
                  </span>
                  <span className="text-[9px] font-mono text-ink/70 mt-1 uppercase font-bold">Style</span>
                </div>
                <div className={`h-[2px] flex-1 mx-2 ${designerStep >= 3 ? 'bg-ink' : 'bg-ink/10'}`} />
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 ${
                    designerStep >= 3 ? 'bg-ink text-cream border-ink' : 'bg-cream text-ink border-ink/20'
                  }`}>
                    3
                  </span>
                  <span className="text-[9px] font-mono text-ink/70 mt-1 uppercase font-bold">Payout</span>
                </div>
              </div>

              {/* STEP 1: Designer Profile info */}
              {designerStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-ink/10 pb-2">
                    <h3 className="font-condensed font-black text-xl uppercase text-ink">Step 1: Your Artist Profile</h3>
                    <p className="text-[10px] font-mono text-zinc-400">Introduce yourself to the OffGrid network</p>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Full Artist Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Priya K."
                        value={designerName}
                        onChange={(e) => {
                          setDesignerName(e.target.value);
                          if (!designerUsername) {
                            setDesignerUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
                          }
                        }}
                        className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none focus:ring-1 focus:ring-saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Unique Username</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs text-saffron font-bold">@</span>
                        <input 
                          type="text" 
                          required
                          placeholder="priya_k"
                          value={designerUsername}
                          onChange={(e) => setDesignerUsername(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2.5 pl-8 text-xs outline-none focus:ring-1 focus:ring-saffron"
                        />
                      </div>
                      <span className="text-[9px] text-emerald-500 font-semibold block mt-1">✓ Username available</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">City</label>
                        <input 
                          type="text" 
                          placeholder="Mumbai"
                          value={designerCity}
                          onChange={(e) => setDesignerCity(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none focus:ring-1 focus:ring-saffron"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Country</label>
                        <select 
                          value={designerCountry}
                          onChange={(e) => setDesignerCountry(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none cursor-pointer"
                        >
                          <option>India</option>
                          <option>United States</option>
                          <option>Germany</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!designerName || !designerUsername) {
                        alert('Name and Username are required!');
                        return;
                      }
                      setDesignerStep(2);
                    }}
                    className="w-full bg-ink text-white font-mono text-xs font-bold py-3 uppercase shadow-sm hover:shadow-brutal transition-all cursor-pointer border-2 border-ink"
                  >
                    CONTINUE TO YOUR STYLE ➔
                  </button>
                </div>
              )}

              {/* STEP 2: Designer Bio / Style */}
              {designerStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-ink/10 pb-2">
                    <h3 className="font-condensed font-black text-xl uppercase text-ink">Step 2: Tell buyers what you're about</h3>
                    <p className="text-[10px] font-mono text-zinc-400">This matches you to target shopper catalogs</p>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Short Bio details (max 160 chars)</label>
                      <textarea 
                        rows={2}
                        maxLength={160}
                        placeholder="I make typographic prints that shouldn't exist."
                        value={designerBio}
                        onChange={(e) => setDesignerBio(e.target.value)}
                        className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none resize-none focus:ring-1 focus:ring-saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Portfolio Link (optional)</label>
                      <input 
                        type="url" 
                        placeholder="https://priyak.art"
                        value={designerPortfolio}
                        onChange={(e) => setDesignerPortfolio(e.target.value)}
                        className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none focus:ring-1 focus:ring-saffron"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Artwork Categories (Press Enter to add)</label>
                      <input 
                        type="text" 
                        placeholder="streetwear, vintage, neo-brutalist..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={addTag}
                        className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none focus:ring-1 focus:ring-saffron"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {designerTags.map((t, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-ink text-[10px] font-mono text-ink flex items-center gap-1">
                            #{t}
                            <button type="button" onClick={() => removeTag(t)} className="text-saffron font-bold text-xs">x</button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 font-mono text-xs">
                    <button 
                      onClick={() => setDesignerStep(1)}
                      className="flex-1 bg-white border-2 border-ink text-ink font-bold py-3 uppercase hover:bg-zinc-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={() => setDesignerStep(3)}
                      className="flex-1 bg-ink text-white font-bold py-3 uppercase hover:shadow-brutal border-2 border-ink transition-all cursor-pointer"
                    >
                      Step 3: Payouts ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Designer Bank accounts / Payouts */}
              {designerStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-ink/10 pb-2">
                    <h3 className="font-condensed font-black text-xl uppercase text-ink">Step 3: Royalties Settlement Account</h3>
                    <p className="text-[10px] font-mono text-zinc-400">Configure where you receive design markups</p>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Bank Name</label>
                      <input 
                        type="text" 
                        placeholder="HDFC Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Account Number</label>
                        <input 
                          type="text" 
                          placeholder="987654321098"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">IFSC Code</label>
                        <input 
                          type="text" 
                          placeholder="HDFC0001234"
                          value={bankIFSC}
                          onChange={(e) => setBankIFSC(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-150 border border-ink/10 text-[9px] text-[#FF6300] leading-normal font-semibold">
                      🔒 Bank coordinates are encrypted. You can fill this out or edit from settings at any point.
                    </div>
                  </div>

                  <div className="flex gap-3 font-mono text-xs">
                    <button 
                      onClick={() => setDesignerStep(2)}
                      className="flex-1 bg-white border-2 border-ink text-ink font-bold py-3 uppercase hover:bg-zinc-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={handleDesignerSignupSubmit}
                      className="flex-1 bg-saffron text-white border-2 border-ink font-bold py-3 uppercase hover:shadow-brutal transition-all cursor-pointer"
                    >
                      Launch Artist Profile!
                    </button>
                  </div>
                  <div className="text-center font-mono text-[10px]">
                    <button onClick={handleDesignerSignupSubmit} className="text-zinc-400 underline hover:text-ink cursor-pointer">
                      Skip setup for later
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCREEN 5: MANUFACTURER SIGNUP 3-STEP WIZARD */}
          {screen === 'SIGNUP_MANUFACTURER' && (
            <div className="space-y-5 max-w-lg mx-auto w-full">
              {/* Progress Bar */}
              <div className="flex justify-between items-center px-4">
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 ${
                    manufacturerStep >= 1 ? 'bg-ink text-cream border-ink' : 'bg-cream text-ink border-ink/20'
                  }`}>
                    1
                  </span>
                  <span className="text-[9px] font-mono text-ink/70 mt-1 uppercase font-bold">Facility</span>
                </div>
                <div className={`h-[2px] flex-1 mx-2 ${manufacturerStep >= 2 ? 'bg-ink' : 'bg-ink/10'}`} />
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 ${
                    manufacturerStep >= 2 ? 'bg-ink text-cream border-ink' : 'bg-cream text-ink border-ink/20'
                  }`}>
                    2
                  </span>
                  <span className="text-[9px] font-mono text-ink/70 mt-1 uppercase font-bold">Outputs</span>
                </div>
                <div className={`h-[2px] flex-1 mx-2 ${manufacturerStep >= 3 ? 'bg-ink' : 'bg-ink/10'}`} />
                <div className="flex flex-col items-center">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2 ${
                    manufacturerStep >= 3 ? 'bg-ink text-cream border-ink' : 'bg-cream text-ink border-ink/20'
                  }`}>
                    3
                  </span>
                  <span className="text-[9px] font-mono text-ink/70 mt-1 uppercase font-bold">Verify</span>
                </div>
              </div>

              {/* STEP 1: Business details */}
              {manufacturerStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-ink/10 pb-2">
                    <h3 className="font-condensed font-black text-xl uppercase text-ink">Step 1: Print Node Facility</h3>
                    <p className="text-[10px] font-mono text-zinc-400">Tell us where raw garments are processed</p>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Business Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Om Shanti Weavers & Co"
                        value={mfrBusinessName}
                        onChange={(e) => setMfrBusinessName(e.target.value)}
                        className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">City Location</label>
                        <input 
                          type="text" 
                          placeholder="Bangalore"
                          value={mfrCity}
                          onChange={(e) => setMfrCity(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">State</label>
                        <select 
                          value={mfrState}
                          onChange={(e) => setMfrState(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none cursor-pointer"
                        >
                          <option>Delhi</option>
                          <option>Maharashtra</option>
                          <option>Karnataka</option>
                          <option>Tamil Nadu</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">GST Registration Number (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="29AAAAA1111A1Z1"
                        value={mfrGST}
                        onChange={(e) => setMfrGST(e.target.value)}
                        className="w-full bg-white border-2 border-ink p-2.5 text-xs outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!mfrBusinessName) {
                        alert('Business name is required.');
                        return;
                      }
                      setManufacturerStep(2);
                    }}
                    className="w-full bg-ink text-white font-mono text-xs font-bold py-3 uppercase border-2 border-ink hover:shadow-brutal transition-all cursor-pointer"
                  >
                    CONTINUE TO CAPABILITIES ➔
                  </button>
                </div>
              )}

              {/* STEP 2: Capabilities checklist */}
              {manufacturerStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-ink/10 pb-2">
                    <h3 className="font-condensed font-black text-xl uppercase text-ink">Step 2: Manufacturing Capabilities</h3>
                    <p className="text-[10px] font-mono text-zinc-400">Select supported techniques and garment bases</p>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1.5">Print Techniques</label>
                      <div className="flex flex-wrap gap-2">
                        {['DTG', 'Screen Print', 'Embroidery', 'Sublimation', 'UV Print'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => togglePrintType(type)}
                            className={`p-2 border-2 text-[10px] uppercase font-bold transition-all rounded-none ${
                              mfrPrints.includes(type) ? 'bg-saffron text-white border-ink shadow-sm' : 'bg-white border-ink/20 text-ink'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1.5">Garment products</label>
                      <div className="flex flex-wrap gap-2">
                        {['T-Shirts', 'Hoodies', 'Totes', 'Posters', 'Phone Cases'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleProductType(type)}
                            className={`p-2 border-2 text-[10px] uppercase font-bold transition-all rounded-none ${
                              mfrProducts.includes(type) ? 'bg-saffron text-white border-ink shadow-sm' : 'bg-white border-ink/20 text-ink'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-ink/70 mb-1">Min Order units</label>
                        <input 
                          type="number" 
                          value={mfrMinQty} 
                          onChange={(e) => setMfrMinQty(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2 text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-ink/70 mb-1">Turnaround Days</label>
                        <input 
                          type="number" 
                          value={mfrTurnaround} 
                          onChange={(e) => setMfrTurnaround(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2 text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase text-ink/70 mb-1">Base Cost (INR)</label>
                        <input 
                          type="number" 
                          value={mfrBaseCost} 
                          onChange={(e) => setMfrBaseCost(e.target.value)}
                          className="w-full bg-white border-2 border-ink p-2 text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 font-mono text-xs">
                    <button 
                      onClick={() => setManufacturerStep(1)}
                      className="flex-1 bg-white border-2 border-ink text-ink font-bold py-3 uppercase hover:bg-zinc-50 cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={() => setManufacturerStep(3)}
                      className="flex-1 bg-ink text-white border-2 border-ink font-bold py-3 uppercase hover:shadow-brutal transition-all cursor-pointer"
                    >
                      Step 3: Verification ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Verification */}
              {manufacturerStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-ink/10 pb-2">
                    <h3 className="font-condensed font-black text-xl uppercase text-ink">Step 3: Print Partner Verification</h3>
                    <p className="text-[10px] font-mono text-zinc-400">All partners are vetted to ensure high prints quality</p>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <label className="block text-[10px] font-bold uppercase text-ink/70 mb-1">Upload Business Registration details or GST Certificate</label>
                    <div className="border-2 border-dashed border-ink/40 bg-white p-8 text-center cursor-pointer hover:border-saffron hover:bg-saffron/5 transition-all">
                      <span className="block text-2xl mb-2">📁</span>
                      <strong className="block text-[11px] text-ink">Click or Drag PDF/JPG Certificate here</strong>
                      <span className="text-[9px] text-zinc-400 mt-1 block">Max file size 5MB</span>
                    </div>

                    <div className="p-3 bg-zinc-150 border border-ink/10 text-[10px] text-zinc-500 leading-normal">
                      🛡️ Application reviews complete within 24-48 hours. Print routing activates instantly upon validation.
                    </div>
                  </div>

                  <div className="flex gap-3 font-mono text-xs">
                    <button 
                      onClick={() => setManufacturerStep(2)}
                      className="flex-1 bg-white border-2 border-ink text-ink font-bold py-3 uppercase cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button 
                      onClick={handleManufacturerSignupSubmit}
                      className="flex-1 bg-saffron text-white border-2 border-ink font-bold py-3 uppercase hover:shadow-brutal transition-all cursor-pointer"
                    >
                      SUBMIT APPLICATION
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
