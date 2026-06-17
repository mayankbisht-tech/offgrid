import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthUser } from '../../hooks/useAuth';
import { apiJson } from '../../lib/api';
import { AuthMode, UserRole, toPath, writeAuthStorage } from '../../context/AppContext';
import { Icon } from './UI';

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

export const AuthModal = ({ onClose, onLogin }: { onClose: () => void; onLogin?: (u: AuthUser) => void }) => {
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
      const data = await apiJson<{ user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: siEmail, password: siPass }),
      });
      // Persist login to caller
      onLogin?.(data.user);
      writeAuthStorage(data.user);
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

      const data = await apiJson<{ user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      onLogin?.(data.user);
      writeAuthStorage(data.user);
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
