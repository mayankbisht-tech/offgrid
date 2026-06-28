import React from 'react';

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, #EDE4DB 25%, #F7F3EF 50%, #EDE4DB 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.8s ease-in-out infinite',
  borderRadius: '6px',
};

export const SkeletonBox = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div className={className} style={{ ...shimmerStyle, ...style }} />
);

export const SkeletonText = ({ lines = 3, className = '' }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div
        key={i}
        style={{
          ...shimmerStyle,
          height: '12px',
          width: i === lines - 1 ? '60%' : '100%',
        }}
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 48, className = '' }: { size?: number; className?: string }) => (
  <div
    className={className}
    style={{ ...shimmerStyle, width: size, height: size, borderRadius: '50%' }}
  />
);

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-lg overflow-hidden border ${className}`} style={{ borderColor: 'rgba(109,15,49,0.12)' }}>
    <SkeletonBox style={{ height: '240px', borderRadius: 0 }} />
    <div className="p-4 space-y-3">
      <SkeletonBox style={{ height: '10px', width: '40%' }} />
      <SkeletonBox style={{ height: '14px', width: '75%' }} />
      <div className="flex items-center justify-between pt-2">
        <SkeletonBox style={{ height: '14px', width: '25%' }} />
        <SkeletonBox style={{ height: '32px', width: '80px', borderRadius: '4px' }} />
      </div>
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 8, cols = 4, className = '' }: { count?: number; cols?: number; className?: string }) => (
  <div className={`grid gap-5 ${className}`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
    {[...Array(count)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
