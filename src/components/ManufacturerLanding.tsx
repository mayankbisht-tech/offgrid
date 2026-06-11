/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Printer, 
  Settings, 
  TrendingUp, 
  Layers, 
  Truck, 
  ShieldCheck, 
  Cpu, 
  Info,
  Clock
} from 'lucide-react';

interface ManufacturerLandingProps {
  onJoinManufacturer: () => void;
}

export default function ManufacturerLanding({ onJoinManufacturer }: ManufacturerLandingProps) {
  // Configured beveled LED metric counts
  const [mockActiveOrders] = useState<number>(142);
  const [mockTotalPrinted] = useState<number>(14902);
  const [capacityPct] = useState<number>(74); // capacity gauge metric

  return (
    <div className="bg-steel text-[#E2E8F0] min-h-screen font-body relative overflow-x-hidden pb-12">
      
      {/* Industrial Accent Header Bar */}
      <header className="bg-[#111A24] border-b-4 border-zinc-950 p-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-saffron animate-pulse" />
          <h1 className="font-mono text-sm uppercase tracking-wider font-extrabold text-white">
            OffGrid Industrial Ingress
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 px-3 py-1.5 border border-zinc-800 rounded-md font-mono text-[10px] text-saffron select-none">
          <Clock size={11} /> FACTORY CORE ONLINE
        </div>
      </header>

      {/* Industrial Hero Section */}
      <section className="py-12 sm:py-20 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Industrial descriptive details */}
        <div className="lg:col-span-6 space-y-6">
          <span className="font-mono text-xs uppercase bg-[#2A3F55] text-saffron border border-saffron/20 px-2.5 py-1 font-bold rounded-sm inline-block shadow-sm">
            Fulfillment Node Integration
          </span>
          <h2 className="text-4xl sm:text-5xl font-black uppercase text-white leading-none tracking-tight">
            CONNECT YOUR PRESS.<br />
            PRINT ORDERS ON-DEMAND.<br />
            <span className="text-saffron">FILL IDLE CAPACITY.</span>
          </h2>
          <p className="text-xs sm:text-sm text-iron leading-relaxed font-bold">
            OffGrid links verified Indian printing houses and embroidery units directly with massive daily independent designer queues. Accept single-unit orders, compile print vectors automatically, and get paid within 15 days of dispatch.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={onJoinManufacturer}
              className="px-6 py-4 bg-saffron hover:bg-saffron/90 text-white font-mono font-bold text-xs uppercase border-brutal border-zinc-950 shadow-md active:translate-y-[2px] transition-all cursor-pointer"
            >
              Apply as Print Partner <Printer size={13} className="inline ml-1" />
            </button>
          </div>
        </div>

        {/* Right Column: OrderDashboardMockup with beveled border and LED display Section 5D */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-sm bg-[#1E2D42] border-[6px] border-zinc-950 p-5 rounded-sm shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
            
            <div className="flex justify-between items-center border-b-2 border-zinc-950 pb-3 mb-4 select-none">
              <span className="font-mono text-[9px] font-bold text-[#A0AEC0] tracking-widest">
                MOCK INDUSTRIAL PANEL 100-F
              </span>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* LED segmented status center screen corresponding to Section 5D */}
            <div className="bg-[#090D14] p-4 rounded text-center border border-zinc-950 shadow-inner relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10" />
              <span className="block text-[8px] font-mono text-zinc-500 font-bold uppercase text-left">ACTIVE SESSIONS SUMMARY</span>
              
              <div className="grid grid-cols-2 gap-2 mt-4 select-none">
                <div className="text-left border-r border-zinc-800/80 pr-2">
                  <span className="text-[8px] font-mono text-zinc-500 block">TOTAL PRINTED</span>
                  <span className="font-mono text-xl font-black text-saffron led-glow select-all">
                    {mockTotalPrinted.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right pl-2">
                  <span className="text-[8px] font-mono text-zinc-500 block">QUEUE ALLOCATED</span>
                  <span className="font-mono text-xl font-black text-acid green-led-glow">
                    {mockActiveOrders} items
                  </span>
                </div>
              </div>

              {/* simulated flickering line */}
              <div className="h-0.5 bg-white/5 w-full mt-3 animate-pulse" />
            </div>

            {/* Metric Status boxes */}
            <div className="grid grid-cols-3 gap-2.5 mt-4 select-none">
              <div className="p-2 bg-[#141E2E] border border-zinc-950 text-center rounded-sm">
                <span className="text-[7.5px] font-mono text-zinc-500 uppercase block">Active Node</span>
                <strong className="text-white font-mono text-xs font-black">99.8%</strong>
              </div>
              <div className="p-2 bg-[#141E2E] border border-zinc-950 text-center rounded-sm">
                <span className="text-[7.5px] font-mono text-zinc-500 uppercase block">CAPACITY GAUGE</span>
                <strong className="text-saffron font-mono text-xs font-black">{capacityPct}%</strong>
              </div>
              <div className="p-2 bg-[#141E2E] border border-zinc-950 text-center rounded-sm">
                <span className="text-[7.5px] font-mono text-zinc-500 uppercase block">QUALITY TARGET</span>
                <strong className="text-acid font-mono text-xs font-black">99.92%</strong>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Conveyor Timeline Sections correspond to Section 5D */}
      <section className="py-12 bg-[#111A24] border-t-4 border-b-4 border-zinc-950">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="text-xl sm:text-2xl font-black uppercase text-center text-white text-display tracking-wide">
            Automated Conveyor Production Timeline
          </h3>
          <p className="text-xs text-center text-iron max-w-sm mx-auto mt-2 font-semibold">
            How print-runs stream transparently from a customers smartphone down to your factory dispatch docks.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12 font-body text-xs relative">
            {/* station 1 */}
            {[
              { id: "01", icon: <Layers size={16} />, title: "Automated Allocation", desc: "Our server matches the order with the closest certified factory carrying matching fabric capabilities." },
              { id: "02", icon: <Printer size={16} />, title: "File Rasterization", desc: "Factory downloads direct designer vectors optimized and split across standard garment scale bounds." },
              { id: "03", icon: <ShieldCheck size={16} />, title: "Triple-Point QC", desc: "Inspected rigorously for fabric durability, seam stability, and high print vibrancy indexes." },
              { id: "04", icon: <Truck size={16} />, title: "Express Dispatch", desc: "Packed in eco-friendly wraps and handed over directly to integrated national courier channels." }
            ].map((station, i) => (
              <div key={i} className="p-5 bg-steel rounded-sm border border-[#2D3F54] relative">
                <div className="absolute top-3 right-3 font-mono text-xs text-saffron/40 font-black">STATION {station.id}</div>
                <div className="p-2 bg-[#111A24] text-saffron inline-block rounded border border-zinc-950 mb-3">
                  {station.icon}
                </div>
                <h4 className="font-mono text-xs font-bold text-white uppercase">{station.title}</h4>
                <p className="text-[10px] text-iron mt-2 leading-relaxed font-semibold">{station.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* capability Grid technical specs table Section 5D */}
      <section className="py-12 max-w-5xl mx-auto px-6 font-mono text-xs">
        <h3 className="text-xl font-bold uppercase text-white mb-6 text-center">STANDARD OFFGRID BASE VALUE MATRIX</h3>
        
        <div className="overflow-x-auto border border-[#2D3F54] rounded-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111A24] text-[#A0AEC0] border-b-2 border-zinc-950 uppercase tracking-widest font-black">
                <th className="p-4">PRINT TECHNIQUE</th>
                <th className="p-4">CAPABLE MATRICES</th>
                <th className="p-4">MOQ</th>
                <th className="p-4">STANDARD BASE RATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2B3D]/80 text-[#CBD5E0]">
              {[
                { tech: "DTG (Direct-to-Garment)", mat: "100% Combed Cotton blends", moq: "1 unit", rate: "₹190 base / unit" },
                { tech: "Embroidery Suture", mat: "Polyester, Canvas heavyweight hoodie bases", moq: "1 unit", rate: "₹230 base / unit" },
                { tech: "Direct Screen Printing", mat: "Standard Cotton garments, Totes", moq: "5 units bulk", rate: "₹120 base / unit" },
                { tech: "Dye Sublimation", mat: "Polyester fabrics, plastics", moq: "1 unit", rate: "₹140 base / unit" }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#1D2B3D]/40">
                  <td className="p-4 font-bold text-white">{row.tech}</td>
                  <td className="p-4">{row.mat}</td>
                  <td className="p-4 text-saffron font-bold">{row.moq}</td>
                  <td className="p-4 text-acid font-bold">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
