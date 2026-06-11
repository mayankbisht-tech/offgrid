/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  ArrowRight, 
  User, 
  Info, 
  Settings, 
  Globe, 
  Calculator, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface DesignerLandingProps {
  onJoinDesigner: () => void;
}

export default function DesignerLanding({ onJoinDesigner }: DesignerLandingProps) {
  // Locale switch state (en-IN vs en-US)
  const [langLocale, setLangLocale] = useState<'en-IN' | 'en-US'>('en-IN');
  
  // Casio Calculator states
  const [productType, setProductType] = useState<'tshirt' | 'hoodie' | 'tote' | 'poster'>('tshirt');
  const [markupProfit, setMarkupProfit] = useState<number>(350); // custom profit per item in INR
  const [monthlySales, setMonthlySales] = useState<number>(120); // estimated sales bulk
  
  // Reset calculator variables
  const resetCalculator = () => {
    setProductType('tshirt');
    setMarkupProfit(350);
    setMonthlySales(120);
  };

  // Profit multipliers corresponding to garment base configurations
  const getProductBaseCost = () => {
    switch (productType) {
      case 'tshirt': return 350;
      case 'hoodie': return 750;
      case 'tote': return 190;
      case 'poster': return 120;
    }
  };

  const calculateMonthlyCommission = () => {
    return markupProfit * monthlySales;
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      langLocale === 'en-IN' 
        ? 'bg-parchment text-indigo' 
        : 'bg-zinc-950 text-white'
    }`}>
      
      {/* Locale Selector Switch Header */}
      <header className={`p-4 border-b-2 flex items-center justify-between flex-wrap gap-4 ${
        langLocale === 'en-IN' ? 'border-indigo/25' : 'border-zinc-800'
      }`}>
        <div className="flex items-center gap-3">
          <span className="p-1.5 rounded-lg bg-saffron text-white shadow-sm font-mono text-xs font-bold leading-none">
            OffGrid Sell Hub
          </span>
          <span className={`text-xs font-mono font-bold ${
            langLocale === 'en-IN' ? 'text-indigo/60' : 'text-zinc-500'
          }`}>
            Creator Studio Landing
          </span>
        </div>

        {/* Dynamic Theme switcher button */}
        <div className="flex items-center gap-2 bg-white/10 p-1.5 border border-transparent rounded-lg">
          <span className="text-[10px] font-mono font-bold uppercase mr-1 flex items-center gap-1">
            <Globe size={11} /> Toggle Experience:
          </span>
          <button
            onClick={() => setLangLocale('en-IN')}
            className={`px-3 py-1 font-mono text-[10px] font-extrabold uppercase transition-all rounded-sm cursor-pointer ${
              langLocale === 'en-IN' 
                ? 'bg-indigo text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            🇮🇳 Indian Craft (Skeuomorphic)
          </button>
          <button
            onClick={() => setLangLocale('en-US')}
            className={`px-3 py-1 font-mono text-[10px] font-extrabold uppercase transition-all rounded-sm cursor-pointer ${
              langLocale === 'en-US' 
                ? 'bg-saffron text-white shadow-sm' 
                : 'text-zinc-400 hover:text-indigo'
            }`}
          >
            🌐 Global (Editorial Brutalist)
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------------- */}
      {/* LOCAL 1: Indian Designer Craft Theme (locale: en-IN)                       */}
      {/* ---------------------------------------------------------------------- */}
      {langLocale === 'en-IN' && (
        <main className="font-display">
          
          {/* Parchment Hero */}
          <section className="relative py-12 sm:py-20 px-6 max-w-6xl mx-auto text-center border-b border-indigo/15">
            {/* Decors */}
            <div className="absolute top-2 left-2 text-3xl opacity-30 select-none">✦</div>
            <div className="absolute top-2 right-2 text-3xl opacity-30 select-none">✦</div>
            
            <span className="text-sm font-mono uppercase bg-indigo text-white px-3 py-1 rounded-full font-black select-none inline-block mb-4 shadow-sm">
              NO INVENTORY ✦ SECURE ROYALTIES
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-indigo leading-none font-display">
              Unleash Your Artwork.<br />
              <span className="italic font-normal text-saffron">We Print & Fulfill.</span>
            </h1>
            
            <p className="font-body text-xs sm:text-sm text-indigo/85 max-w-xl mx-auto mt-6 leading-relaxed font-bold">
              Join thousands of Indian painters, illustrators, and meme creators hosting custom print apparel lines. Keep 100% of your markup profits, processed through national UPI checkouts.
            </p>

            <div className="mt-8 flex justify-center gap-4 flex-wrap">
              <button
                onClick={onJoinDesigner}
                className="px-8 py-4 bg-indigo hover:bg-indigo/90 text-white font-mono font-bold text-xs uppercase border-2 border-indigo shadow-md active:translate-y-[2px] transition-all cursor-pointer"
              >
                Join Indian Creator Studio <ArrowRight size={14} className="inline ml-1" />
              </button>
            </div>
            
            {/* Social Proof handwritten Ticker */}
            <div className="mt-12 bg-white/30 border border-indigo/10 p-3 rounded-none overflow-hidden select-none">
              <div className="flex justify-around items-center gap-6 font-mono text-[10px] sm:text-xs font-black text-indigo/70">
                <span className="italic">★ Karan S. earned ₹74,200 last month</span>
                <span className="hidden sm:inline">•</span>
                <span className="italic">★ Visualist Anusha earned ₹1,12,000 via Matchbox Tees</span>
                <span className="hidden md:inline">•</span>
                <span className="italic">★ 4,200+ Indian artists are active on OffGrid</span>
              </div>
            </div>
          </section>

          {/* Three Steps Corkboard Widget */}
          <section className="py-12 px-6 max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-indigo flex justify-center items-center gap-2">
              <BookOpen size={20} className="text-saffron" />
              Three Steps To Passive Creator Royalties
            </h2>
            
            {/* The Pins Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 font-body">
              {[
                { step: "01", title: "Upload High-Res Art", body: "Drag your PNG, SVG, or AI artwork files into our Studio Wizard. We generate absolute Mock layouts on fine-combed cotton structures automatically.", skew: "-rotate-[2.5deg]" },
                { step: "02", title: "Set Margin Markup", body: "Decide your retail royalty. If base production cost is ₹350 and you allocate ₹450 markup, the final product sells for ₹800. You pocket ₹450 per sale!", skew: "rotate-[3deg]" },
                { step: "03", title: "Collect Safe Payouts", body: "Direct electronic bank transfers initiated automatically twice every month once orders enter successful delivery states. Zero manual processing required.", skew: "-rotate-[1.5deg]" }
              ].map((card, i) => (
                <div 
                  key={i}
                  className={`bg-[#fdfbf7] p-6 border-brutal border-indigo/40 shadow-md ${card.skew} transition-transform hover:rotate-0 hover:z-10`}
                >
                  <div className="flex justify-between items-center border-b border-indigo/10 pb-3 mb-4 select-none">
                    <span className="font-mono text-xs text-saffron font-black uppercase">Phase {card.step}</span>
                  </div>
                  <h3 className="font-display font-black text-indigo text-lg uppercase leading-none">{card.title}</h3>
                  <p className="text-[11px] text-indigo/80 mt-3 leading-relaxed font-bold">{card.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SKEUOMORPHIC CASIO-STYLE REVENUE CALCULATOR */}
          <section className="py-12 bg-white/20 border-t border-b border-indigo/10">
            <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Product selector sliders */}
              <div className="lg:col-span-5 space-y-5 font-body">
                <div>
                  <span className="font-mono text-[9px] uppercase font-bold tracking-widest bg-saffron text-white px-2 py-0.5 rounded-sm inline-block mb-1 shadow-sm font-semibold select-none">
                    Interactive Spec Sheet
                  </span>
                  <h3 className="font-display text-2xl font-black text-indigo uppercase">Estimator Panel</h3>
                  <p className="text-[11px] leading-relaxed mt-2 text-indigo/70 font-semibold">
                    Simulate your passive revenues by picking apparel materials, setting royalty markups, and shifting monthly delivery projections.
                  </p>
                </div>

                {/* apparel list selection */}
                <div>
                  <span className="block text-xs font-mono font-bold uppercase mb-2">Configure Garment base</span>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    {[
                      { type: 'tshirt', label: 'Boxy Tee (base: ₹350)' },
                      { type: 'hoodie', label: 'Heavy Hoodie (base: ₹750)' },
                      { type: 'tote', label: 'Canvas Tote (base: ₹190)' },
                      { type: 'poster', label: 'Art Poster (base: ₹120)' }
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => setProductType(opt.type as any)}
                        className={`p-2 border font-bold capitalize transition-all cursor-pointer text-[11px] ${
                          productType === opt.type 
                            ? 'bg-indigo text-white border-indigo shadow-sm' 
                            : 'bg-white hover:bg-[#FAF6F0] text-indigo border-indigo/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Markup Range slider */}
                <div>
                  <div className="flex justify-between font-mono text-[11px] font-bold mb-1.5">
                    <span>Royalties Per Sale (₹)</span>
                    <span className="text-saffron">₹{markupProfit}</span>
                  </div>
                  <input 
                    id="markup-calc"
                    type="range" 
                    min="100" 
                    max="1500" 
                    step="25"
                    value={markupProfit}
                    onChange={(e) => setMarkupProfit(parseInt(e.target.value))}
                    className="w-full accent-indigo h-1.5 bg-[#EFECE6]"
                  />
                </div>

                {/* Bulk volume sales count slider */}
                <div>
                  <div className="flex justify-between font-mono text-[11px] font-bold mb-1.5">
                    <span>Monthly Sales volume</span>
                    <span className="text-saffron">{monthlySales} items</span>
                  </div>
                  <input 
                    id="sales-calc"
                    type="range" 
                    min="10" 
                    max="1000" 
                    step="10"
                    value={monthlySales}
                    onChange={(e) => setMonthlySales(parseInt(e.target.value))}
                    className="w-full accent-indigo h-1.5 bg-[#EFECE6]"
                  />
                </div>
              </div>

              {/* SKEUOMORPHIC CALCULATOR COMPONENT VIEW (Casio Beveled LED display) */}
              <div className="lg:col-span-7 flex justify-center">
                <div className="w-full max-w-sm bg-[#322F2D] border-[6px] border-[#1C1A19] p-4 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] text-white">
                  
                  {/* Solar panel mockup */}
                  <div className="flex justify-between items-center bg-[#1B1918] p-2.5 rounded-lg border border-zinc-800 mb-4 select-none">
                    <span className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase font-bold">CASIO-POD SG-900</span>
                    <div className="grid grid-cols-4 gap-0.5 w-12 h-3.5 bg-amber-950 border border-zinc-900 rounded-sm overflow-hidden opacity-85">
                      <div className="bg-amber-900/60 border-r border-zinc-950" />
                      <div className="bg-amber-900/60 border-r border-zinc-950" />
                      <div className="bg-amber-900/50 border-r border-zinc-950" />
                      <div className="bg-amber-900/40" />
                    </div>
                  </div>

                  {/* LCD Calculator display panel */}
                  <div className="bg-[#B0BCA4] p-4 text-emerald-950 font-mono rounded border-2 border-zinc-950 shadow-inner flex flex-col justify-between h-20 select-none relative overflow-hidden">
                    {/* Retro shadows */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/5 pointer-events-none" />
                    <div className="flex justify-between text-[9px] font-bold tracking-tight opacity-75">
                      <span>POD ESTIMATOR</span>
                      <span>M+ SIGN ACTIVE</span>
                    </div>
                    {/* The digital result */}
                    <span className="text-right text-3xl font-black font-mono tracking-tight text-emerald-950/90 led-glow">
                      ₹{calculateMonthlyCommission().toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  {/* Detailed Specs summary of calculation */}
                  <div className="grid grid-cols-2 gap-2 mt-4 font-mono text-[10px] text-zinc-400">
                    <div className="p-1.5 bg-[#1B1918] rounded border border-zinc-805/40">
                      <span className="block text-[8px] text-zinc-500">BASE COST:</span>
                      <strong className="text-white">₹{getProductBaseCost()}</strong>
                    </div>
                    <div className="p-1.5 bg-[#1B1918] rounded border border-zinc-805/40">
                      <span className="block text-[8px] text-zinc-500">ESTIMATED RETAIL:</span>
                      <strong className="text-white">₹{getProductBaseCost() + markupProfit}</strong>
                    </div>
                  </div>

                  {/* Physical Style Calculator Keyboard Buttons Grid corresponding to Section 5B */}
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono font-bold text-xs select-none">
                    <button className="p-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-b-2 border-zinc-950 active:translate-y-[1px] cursor-pointer" onClick={() => setMarkupProfit(350)}>AC</button>
                    <button className="p-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-b-2 border-zinc-950 active:translate-y-[1px] cursor-pointer" onClick={() => setMonthlySales(Math.max(10, monthlySales - 10))}>-10</button>
                    <button className="p-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border-b-2 border-zinc-950 active:translate-y-[1px] cursor-pointer" onClick={() => setMonthlySales(monthlySales + 10)}>+10</button>
                    <button className="p-2.5 bg-[#4F3635] text-red-200 border-b-2 border-zinc-950 hover:bg-red-950/80 active:translate-y-[1px] cursor-pointer" onClick={resetCalculator}>RESET</button>
                    
                    <button className="p-2.5 bg-zinc-700 hover:bg-zinc-650 text-white border-b-2 border-zinc-950 cursor-pointer" onClick={() => setProductType('tshirt')}>T-SHIRT</button>
                    <button className="p-2.5 bg-zinc-700 hover:bg-zinc-650 text-white border-b-2 border-zinc-950 cursor-pointer" onClick={() => setProductType('hoodie')}>HOODIE</button>
                    <button className="p-2.5 bg-zinc-700 hover:bg-zinc-650 text-white border-b-2 border-zinc-950 cursor-pointer" onClick={() => setProductType('tote')}>TOTE</button>
                    <button className="p-2.5 bg-zinc-700 hover:bg-zinc-650 text-white border-b-2 border-zinc-950 cursor-pointer" onClick={() => setProductType('poster')}>POSTER</button>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* Custom Fabric Swatches Section */}
          <section className="py-12 px-6 max-w-5xl mx-auto font-body">
            <h3 className="text-xl sm:text-2xl font-bold font-display text-indigo text-center uppercase tracking-wide">Supported Apparel Fabrics</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-center text-xs">
              {[
                { name: "Heavy Combed Cotton", desc: "240GSM bio-washed combed pre-shrunk cotton splits", cost: "₹350 based" },
                { name: "Premium Fleece Blend", desc: "320GSM ultra-cozy cotton-poly lining builds", cost: "₹750 based" },
                { name: "Natural Organic Canvas", desc: "Reusable thick eco-friendly coarse materials", cost: "₹190 based" },
                { name: "300GSM Matte Board", desc: "Rigid fade-resistant textured paper canvases", cost: "₹120 based" }
              ].map((swatch, i) => (
                <div key={i} className="p-4 border-2 border-indigo/25 bg-white/50 hover:bg-white transition-all flex flex-col justify-between">
                  <div>
                    <h4 className="font-mono font-bold uppercase text-indigo tracking-tight border-b-2 border-indigo/15 pb-2">{swatch.name}</h4>
                    <p className="text-[10px] text-indigo/70 mt-3 leading-normal font-semibold">{swatch.desc}</p>
                  </div>
                  <span className="font-mono text-saffron text-[10px] font-black uppercase mt-4 block">{swatch.cost}</span>
                </div>
              ))}
            </div>
          </section>

        </main>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* LOCAL 2: global Editorial Brutalist Theme (locale: en-US)                 */}
      {/* ---------------------------------------------------------------------- */}
      {langLocale === 'en-US' && (
        <main className="font-condensed max-w-6xl mx-auto px-6 py-12 md:py-20">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Bold headline columns */}
            <div className="lg:col-span-7">
              <span className="font-mono text-xs uppercase bg-saffron text-white px-2 py-0.5 font-bold mb-3 inline-block select-none">
                THE INDEPENDENT APPAREL ENGINE
              </span>
              <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tighter leading-none uppercase">
                WE HOST BRANDS.<br />
                YOU DRAW IMAGES.<br />
                <span className="text-cobalt">NO RISK OVERHEAD.</span>
              </h1>
              
              <p className="font-body text-xs sm:text-sm text-zinc-400 mt-6 max-w-lg leading-relaxed font-semibold">
                OffGrid leverages automated print matching algorithms to bind independent artist shops with highly rated garment facilities in real-time. Direct international courier configurations integrated.
              </p>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={onJoinDesigner}
                  className="px-8 py-4 bg-cobalt hover:bg-cobalt/95 text-white font-mono font-bold text-xs uppercase shadow-sm cursor-pointer"
                >
                  Create Custom Profile
                </button>
              </div>
            </div>

            {/* Monochrome spotlight list placeholder as standard */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4 select-none">
              <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest block border-b border-zinc-800 pb-2">COMMISSIONS COMPARATIVE BILLING</span>
              
              <div className="space-y-3">
                {[
                  { title: "Boxy Tee Splits", raw: "Client pays ₹999", earn: "Designer keeps ₹649" },
                  { title: "Drop Shoulder Sweater", raw: "Client pays ₹1,899", earn: "Designer keeps ₹1,149" },
                  { title: "Modular Tote Carry", raw: "Client pays ₹499", earn: "Designer keeps ₹309" }
                ].map((item, id) => (
                  <div key={id} className="flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="font-bold text-white block">{item.title}</span>
                      <span className="text-[10px] text-zinc-500 leading-none">{item.raw}</span>
                    </div>
                    <span className="text-saffron font-bold">{item.earn}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Brutalist Margins table corresponding to Section 5C */}
          <section className="mt-20">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-8">BRUTALIST PRODUCTION PRICING SCALE</h2>
            
            <div className="overflow-x-auto border border-zinc-800 font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                    <th className="p-4">APPAREL SEED</th>
                    <th className="p-4">BASE MANUFACTURING COST</th>
                    <th className="p-4">SUGGESTED PROFITS</th>
                    <th className="p-4">FINAL RETAIL (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {[
                    { seed: "Standard Combed Boxy T-shirt", base: "₹350", profit: "₹649", final: "₹999" },
                    { seed: "Heavy Pullover winter Hoodie", base: "₹750", profit: "₹1,149", final: "₹1,899" },
                    { seed: "Heavy-Rib Canvas Tote Carry", base: "₹190", profit: "₹309", final: "₹499" },
                    { seed: "Fine Matte Traditional Poster Frame", base: "₹120", profit: "₹279", final: "₹399" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40">
                      <td className="p-4 font-bold text-white">{row.seed}</td>
                      <td className="p-4">{row.base}</td>
                      <td className="p-4 text-saffron font-bold">{row.profit}</td>
                      <td className="p-4 text-emerald-400 font-bold">{row.final}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      )}

    </div>
  );
}
