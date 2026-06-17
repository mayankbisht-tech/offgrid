import React, { useState } from 'react';
import { GRADIENTS } from '../shared/UI';

export const ProductMockup = ({ type, url }: { type: 'hoodie' | 'tshirt' | 'print'; url: string }) => {
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
