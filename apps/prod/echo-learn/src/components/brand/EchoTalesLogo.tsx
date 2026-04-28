'use client';

import { motion } from 'framer-motion';

interface EchoTalesLogoProps {
  size?: number;
  className?: string;
}

export function EchoTalesLogo({ size = 48, className }: EchoTalesLogoProps) {
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
        <linearGradient id="etl-g1" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="etl-g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="etl-g3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Book – left page */}
      <motion.path
        d="M24 18 C20 16.5, 12 15, 8 17 L8 38 C12 36, 20 37, 24 38.5 Z"
        fill="url(#etl-g1)"
        variants={{
          hidden: { opacity: 0, x: -4 },
          visible: { opacity: 0.9, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
        }}
      />

      {/* Book – right page */}
      <motion.path
        d="M24 18 C28 16.5, 36 15, 40 17 L40 38 C36 36, 28 37, 24 38.5 Z"
        fill="url(#etl-g2)"
        variants={{
          hidden: { opacity: 0, x: 4 },
          visible: { opacity: 0.9, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
        }}
      />

      {/* Spine */}
      <motion.line
        x1="24" y1="17" x2="24" y2="39"
        stroke="white" strokeWidth="0.5"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 0.3, transition: { duration: 0.4, delay: 0.3 } },
        }}
      />

      {/* Story wisps – animated draw + continuous float */}
      <motion.path
        d="M19 17 C17 12, 14 9, 12 5"
        stroke="url(#etl-g1)" strokeWidth="1.5" strokeLinecap="round" fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1, opacity: 0.8,
            transition: { duration: 0.8, delay: 0.4, ease: 'easeOut' },
          },
        }}
      />
      <motion.path
        d="M24 16 C24 11, 24 8, 24 3"
        stroke="url(#etl-g2)" strokeWidth="1.5" strokeLinecap="round" fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1, opacity: 0.7,
            transition: { duration: 0.8, delay: 0.55, ease: 'easeOut' },
          },
        }}
      />
      <motion.path
        d="M29 17 C31 12, 34 9, 36 5"
        stroke="url(#etl-g1)" strokeWidth="1.5" strokeLinecap="round" fill="none"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1, opacity: 0.8,
            transition: { duration: 0.8, delay: 0.7, ease: 'easeOut' },
          },
        }}
      />

      {/* Stars at wisp tips – pop in + continuous twinkle */}
      <motion.circle
        cx="12" cy="5" r="2"
        fill="url(#etl-g3)" filter="url(#glow)"
        variants={{
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 1, scale: 1,
            transition: { duration: 0.3, delay: 1.1, type: 'spring', stiffness: 300 },
          },
        }}
        animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1.4, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="24" cy="3" r="2.2"
        fill="#c084fc" filter="url(#glow)"
        variants={{
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 1, scale: 1,
            transition: { duration: 0.3, delay: 1.25, type: 'spring', stiffness: 300 },
          },
        }}
        animate={{ opacity: [0.9, 0.4, 0.9], scale: [1, 1.25, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 1.8, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="36" cy="5" r="2"
        fill="#f472b6" filter="url(#glow)"
        variants={{
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 1, scale: 1,
            transition: { duration: 0.3, delay: 1.4, type: 'spring', stiffness: 300 },
          },
        }}
        animate={{ opacity: [1, 0.5, 1], scale: [1, 1.15, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, delay: 2.1, ease: 'easeInOut' }}
      />

      {/* Tiny floating accent particles */}
      <motion.circle
        cx="9" cy="10" r="0.7" fill="white"
        animate={{ opacity: [0.2, 0.6, 0.2], y: [0, -1.5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="39" cy="10" r="0.7" fill="white"
        animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -1, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.8, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="17" cy="8" r="0.5" fill="white"
        animate={{ opacity: [0, 0.4, 0], y: [0, -2, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1.5, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="31" cy="8" r="0.5" fill="white"
        animate={{ opacity: [0, 0.4, 0], y: [0, -2, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, delay: 2, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
}
