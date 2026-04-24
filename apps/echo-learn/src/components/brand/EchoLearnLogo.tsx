'use client';

import { motion } from 'framer-motion';

interface EchoLearnLogoProps {
  size?: number;
  className?: string;
}

export function EchoLearnLogo({ size = 40, className }: EchoLearnLogoProps) {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      initial="hidden"
      animate="visible"
    >
      <defs>
        <linearGradient id="ell-bulb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="ell-filament" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
        <radialGradient id="ell-glow" cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft glow behind the bulb */}
      <circle cx="24" cy="19" r="14" fill="url(#ell-glow)" />

      {/* Bulb outline — matches appIcons.ts echo-learn path at 2x scale */}
      <motion.path
        d="M24 4 A15 15 0 0 0 9 19 C9 26 14 29 16 32 L32 32 C34 29 39 26 39 19 A15 15 0 0 0 24 4 Z"
        stroke="url(#ell-bulb)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(129, 140, 248, 0.08)"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } },
        }}
      />

      {/* Base lines */}
      <motion.path
        d="M18 38 L30 38 M19 43 L29 43"
        stroke="url(#ell-bulb)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.4, delay: 0.6 } },
        }}
      />

      {/* Filament — downward arrow into the bulb */}
      <motion.path
        d="M24 12 L24 22 M18 17 L24 22 L30 17"
        stroke="url(#ell-filament)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1, transition: { duration: 0.7, delay: 0.4, ease: 'easeOut' } },
        }}
      />

      {/* Sparkle accents */}
      <motion.circle
        cx="38" cy="10" r="0.9" fill="#c7d2fe"
        animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.3, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="10" cy="9" r="0.7" fill="#a5b4fc"
        animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, delay: 0.6, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
