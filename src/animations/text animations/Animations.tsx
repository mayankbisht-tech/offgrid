import React, { useRef, useEffect, useState, ReactNode } from 'react';
import { motion, useInView, useMotionValue, useTransform, useSpring, AnimatePresence } from 'motion/react';

/* ─── FadeUp ─── */
export const FadeUp = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── SlideIn ─── */
export const SlideIn = ({ children, direction = 'left', delay = 0, className = '' }: { children: ReactNode; direction?: 'left' | 'right'; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const x = direction === 'left' ? -60 : 60;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── ScaleIn ─── */
export const ScaleIn = ({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── AnimatedCounter ─── */
export const AnimatedCounter = ({ value, suffix = '', prefix = '', className = '', style = {} }: { value: number; suffix?: string; prefix?: string; className?: string; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{display.toLocaleString('en-IN')}{suffix}
    </span>
  );
};

/* ─── HoverLift ─── */
export const HoverLift = ({ children, className = '', glowColor = 'rgba(209,0,0,0.15)' }: { children: ReactNode; className?: string; glowColor?: string }) => (
  <motion.div
    className={className}
    whileHover={{
      y: -6,
      boxShadow: `0 12px 40px ${glowColor}`,
      transition: { duration: 0.3, ease: 'easeOut' }
    }}
    style={{ willChange: 'transform' }}
  >
    {children}
  </motion.div>
);

/* ─── MagneticButton ─── */
export const MagneticButton = ({ children, className = '', style = {}, onClick, type = 'button', disabled = false }: { children: ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.15);
    y.set((e.clientY - cy) * 0.15);
  };

  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      className={className}
      style={{ ...style, x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};

/* ─── TiltCard ─── */
export const TiltCard = ({ children, className = '', maxTilt = 12 }: { children: ReactNode; className?: string; maxTilt?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 25 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 25 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateX.set((py - 0.5) * -maxTilt);
    rotateY.set((px - 0.5) * maxTilt);
  };

  const reset = () => { rotateX.set(0); rotateY.set(0); };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
};

/* ─── InfiniteMarquee ─── */
export const InfiniteMarquee = ({ children, speed = 30, pauseOnHover = true, className = '' }: { children: ReactNode; speed?: number; pauseOnHover?: boolean; className?: string }) => {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className="inline-flex"
        style={{
          animation: `ticker ${speed}s linear infinite`,
          ...(pauseOnHover ? {} : {})
        }}
        onMouseEnter={pauseOnHover ? (e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'; } : undefined}
        onMouseLeave={pauseOnHover ? (e) => { (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'; } : undefined}
      >
        {children}
        {children}
      </div>
    </div>
  );
};

/* ─── HoverReveal ─── */
export const HoverReveal = ({ children, overlay, className = '' }: { children: ReactNode; overlay: ReactNode; className?: string }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div animate={{ scale: hovered ? 1.08 : 1 }} transition={{ duration: 0.5 }}>
        {children}
      </motion.div>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-end justify-start p-6"
            style={{ background: 'linear-gradient(to top, rgba(21,21,21,0.8) 0%, transparent 60%)' }}
          >
            {overlay}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── StaggerChildren ─── */
export const StaggerChildren = ({ children, staggerDelay = 0.08, className = '' }: { children: ReactNode; staggerDelay?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} className={className}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * staggerDelay, ease: [0.22, 1, 0.36, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
