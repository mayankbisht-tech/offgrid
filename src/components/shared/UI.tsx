import React, { ReactNode } from 'react';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Shared helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const Icon = ({ name, fill = 0, size = 24, className = '', style = {} }: { name: string; fill?: number; size?: number; className?: string; style?: React.CSSProperties; key?: number | string }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`, fontSize: size, ...style }}
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
  parka: 'linear-gradient(135deg, #1A1A1A 0%, #950606 60%, #950606 100%)',
  hoodie: 'linear-gradient(135deg, #1A1A1A 0%, #5C5C5C 50%, #950606 100%)',
  tee: 'linear-gradient(135deg, #F7F3EF 0%, #F1E7DE 50%, #ffb59e 100%)',
  sneakers: 'linear-gradient(135deg, #950606 0%, #950606 50%, #ff6b35 100%)',
  frames: 'linear-gradient(135deg, #1A1A1A 0%, #3a2e24 50%, #5C5C5C 100%)',
  print: 'linear-gradient(135deg, #C6FF00 0%, #3D5A00 50%, #1A1A1A 100%)',
  vessel: 'linear-gradient(135deg, #1A1A1A 0%, #3a2e24 70%, #5C5C5C 100%)',
  cap: 'linear-gradient(135deg, #F1E7DE 0%, #F1E7DE 50%, #ffa07a 100%)',
  pants: 'linear-gradient(135deg, #C6FF00 0%, #3D5A00 100%)',
  wallet: 'linear-gradient(135deg, #1A1A1A 0%, #5C5C5C 100%)',
  hero: 'linear-gradient(135deg, #950606 0%, #950606 30%, #ffa07a 70%, #F7F3EF 100%)',
  portrait: 'linear-gradient(180deg, #F1E7DE 0%, #ffb59e 50%, #950606 100%)',
  art1: 'linear-gradient(135deg, #1A1A1A 0%, #950606 40%, #C6FF00 100%)',
  art2: 'linear-gradient(135deg, #C6FF00 0%, #3D5A00 40%, #1A1A1A 100%)',
  art3: 'linear-gradient(135deg, #ffb59e 0%, #950606 50%, #1A1A1A 100%)',
  workspace: 'linear-gradient(135deg, #F7F3EF 0%, #F1E7DE 50%, #E8DFD6 100%)',
};
