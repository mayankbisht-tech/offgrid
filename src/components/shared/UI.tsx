import React, { ReactNode } from 'react';

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────
export const Icon = ({ name, fill = 0, size = 24, className = '' }: { name: string; fill?: number; size?: number; className?: string; key?: number | string }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`, fontSize: size }}
  >
    {name}
  </span>
);

// Gradient placeholder for product images
export const GradientImg = ({ gradient, className = '', children }: { gradient: string; className?: string; children?: ReactNode }) => (
  <div className={`w-full h-full flex items-end justify-center ${className}`} style={{ background: gradient }}>
    {children}
  </div>
);

export const GRADIENTS = {
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
