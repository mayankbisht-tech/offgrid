import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, toPath } from '../../context/AppContext';
import { apiJson } from '../../lib/api';
import { Icon, GradientImg, GRADIENTS } from '../shared/UI';
import { StudioSidebar } from './StudioSidebar';
import { ProductMockup } from './ProductMockup';

export const StudioPublishWizard = ({ onSignOut }: { onSignOut?: () => void }) => {
  const rNavigate = useNavigate();
  const navigate = (p: string) => rNavigate(toPath(p));
  const { setMobileMenuOpen, user } = useContext(AppContext);
  const loggedUser = user;

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
      const res = await apiJson<{ secure_url: string; public_id?: string }>('/api/designs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: base64, fileName: file.name, fileType: file.type, fileSize: file.size }),
      });
      setUploadedUrl(res.secure_url);
      setPublicId(res.public_id ?? '');
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
      const firstType = activeKeys[0];
      const firstDef = productDefinitions.find(d => d.id === firstType)!;
      const firstMargin = margins[firstType];
      const firstBase = firstDef.base;
      const firstEarn = Math.round(firstBase * (firstMargin / 100));

      await apiJson<{ design: { id: string } }>('/api/designs/publish', {
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
          <div className="flex items-center gap-4 md:gap-10">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as any)} className="text-[#5c4037] hover:text-[#aa3000] transition-colors">
                <Icon name="arrow_back" size={22} />
              </button>
            )}
            <div>
              <h1 className="text-[18px] md:text-[24px] font-semibold text-[#aa3000] leading-none" style={syne}>
                {step === 1 && 'Step 1: Upload Artwork'}
                {step === 2 && 'Step 2: Dynamic Pricing'}
                {step === 3 && 'Step 3: Final Review & Publish'}
              </h1>
              <p className="text-[9px] md:text-[10px] text-[#5c4037] mt-1 uppercase font-bold tracking-wider" style={font}>
                {step === 1 && 'ARTWORK UPLOAD & INITIAL TITLE'}
                {step === 2 && 'CREATOR MARGIN & LIVE MOCKUPS'}
                {step === 3 && 'METADATA INGESTION & LAUNCH'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-1.5">
                <div className={`w-8 h-1 transition-all duration-300 ${step >= 1 ? 'bg-[#aa3000]' : 'bg-[#f4dfcf]'}`} />
                <div className={`w-8 h-1 transition-all duration-300 ${step >= 2 ? 'bg-[#aa3000]' : 'bg-[#f4dfcf]'}`} />
                <div className={`w-8 h-1 transition-all duration-300 ${step >= 3 ? 'bg-[#aa3000]' : 'bg-[#f4dfcf]'}`} />
              </div>
              <span className="text-[9px] text-[#aa3000] uppercase tracking-widest font-bold" style={font}>
                Step 0{step}/03
              </span>
            </div>
            <button onClick={() => setMobileMenuOpen(true)} className="grid md:hidden h-9 w-9 place-items-center rounded-full text-[#aa3000] hover:bg-[#ffeadb] transition-colors" aria-label="Menu">
              <Icon name="menu" size={24} />
            </button>
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
                      <p className="text-[16px] text-[#5c4037] font-semibold" style={font}>Uploading artwork…</p>
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
