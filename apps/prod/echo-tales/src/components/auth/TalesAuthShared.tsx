'use client';

import Link from 'next/link';
import { EchoTalesLogo } from '@/components/brand/EchoTalesLogo';

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function TalesAuthBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e1145_0%,#0f0a1e_50%,#0a0612_100%)]" />

      <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[10%] right-[15%] w-[400px] h-[400px] bg-pink-500/8 rounded-full blur-[130px]" />
      <div className="absolute top-[60%] left-[60%] w-[300px] h-[300px] bg-violet-400/6 rounded-full blur-[100px]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M-60 850 C80 780, 180 620, 340 640 S540 760, 680 580 S860 420, 1020 500" stroke="url(#auth-arc1)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M-30 900 C140 840, 240 700, 400 720 S600 830, 740 650 S900 490, 1080 560" stroke="url(#auth-arc2)" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
        <path d="M1500 50 C1320 110, 1200 280, 1060 250 S840 120, 720 300 S560 420, 400 340" stroke="url(#auth-arc3)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M1480 -10 C1260 60, 1140 200, 1000 180 S800 70, 660 230 S480 360, 340 280" stroke="url(#auth-arc4)" strokeWidth="0.8" strokeLinecap="round" opacity="0.35" />

        <path d="M200 450 C280 380, 380 420, 350 500 S240 540, 200 450" stroke="rgba(168,130,255,0.12)" strokeWidth="0.8" fill="none" />
        <path d="M1200 400 C1140 340, 1060 380, 1080 440 S1170 470, 1200 400" stroke="rgba(220,160,255,0.1)" strokeWidth="0.8" fill="none" />

        <path d="M0 450 C200 430, 400 470, 600 440 S900 410, 1100 450 S1300 480, 1440 440" stroke="rgba(168,130,255,0.06)" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M0 460 C180 480, 360 440, 540 470 S820 500, 1000 460 S1200 430, 1440 470" stroke="rgba(200,150,240,0.04)" strokeWidth="0.6" strokeLinecap="round" />

        {[
          { cx: 120, cy: 140, r: 2, o: 0.7 }, { cx: 280, cy: 80, r: 1.2, o: 0.5 },
          { cx: 380, cy: 200, r: 1.5, o: 0.6 }, { cx: 520, cy: 120, r: 1, o: 0.4 },
          { cx: 660, cy: 60, r: 2.2, o: 0.7 }, { cx: 820, cy: 160, r: 1, o: 0.35 },
          { cx: 960, cy: 90, r: 1.8, o: 0.6 }, { cx: 1100, cy: 180, r: 1.2, o: 0.5 },
          { cx: 1240, cy: 100, r: 1.5, o: 0.55 }, { cx: 1360, cy: 200, r: 1, o: 0.4 },
          { cx: 100, cy: 700, r: 1.2, o: 0.35 }, { cx: 300, cy: 780, r: 1, o: 0.3 },
          { cx: 1140, cy: 720, r: 1.3, o: 0.35 }, { cx: 1340, cy: 760, r: 1, o: 0.3 },
          { cx: 200, cy: 400, r: 0.8, o: 0.25 }, { cx: 1260, cy: 380, r: 0.8, o: 0.25 },
          { cx: 450, cy: 320, r: 1, o: 0.3 }, { cx: 1000, cy: 300, r: 1, o: 0.3 },
          { cx: 720, cy: 180, r: 1.5, o: 0.4 },
        ].map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="rgba(220,200,255,1)" opacity={s.o} />
        ))}

        <path d="M120 140 L280 80 L380 200" stroke="rgba(200,180,255,0.07)" strokeWidth="0.6" fill="none" />
        <path d="M960 90 L1100 180 L1240 100" stroke="rgba(200,180,255,0.07)" strokeWidth="0.6" fill="none" />
        <path d="M520 120 L660 60 L720 180" stroke="rgba(200,180,255,0.05)" strokeWidth="0.5" fill="none" />

        <g opacity="0.15">
          <line x1="720" y1="780" x2="720" y2="850" stroke="rgba(192,160,255,1)" strokeWidth="1.5" />
          <path d="M720 785 Q680 780, 640 795 Q600 810, 580 835 L720 850 Z" fill="rgba(168,130,255,0.4)" stroke="rgba(192,160,255,0.5)" strokeWidth="0.5" />
          <path d="M720 785 Q760 780, 800 795 Q840 810, 860 835 L720 850 Z" fill="rgba(200,150,255,0.4)" stroke="rgba(192,160,255,0.5)" strokeWidth="0.5" />
          <path d="M700 780 C690 740, 660 700, 640 660" stroke="rgba(200,170,255,0.6)" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M720 775 C720 735, 720 700, 720 660" stroke="rgba(220,180,255,0.5)" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          <path d="M740 780 C750 740, 780 700, 800 660" stroke="rgba(200,170,255,0.6)" strokeWidth="0.8" strokeLinecap="round" fill="none" />
        </g>

        <defs>
          <linearGradient id="auth-arc1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168,85,247,0.4)" />
            <stop offset="40%" stopColor="rgba(217,130,250,0.25)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
          </linearGradient>
          <linearGradient id="auth-arc2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(192,132,252,0.3)" />
            <stop offset="100%" stopColor="rgba(192,132,252,0)" />
          </linearGradient>
          <linearGradient id="auth-arc3" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(236,140,200,0.35)" />
            <stop offset="40%" stopColor="rgba(200,140,240,0.2)" />
            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
          </linearGradient>
          <linearGradient id="auth-arc4" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(220,160,240,0.25)" />
            <stop offset="100%" stopColor="rgba(220,160,240,0)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export function TalesAuthLogo() {
  return (
    <Link href="/tales" className="flex items-center justify-center gap-3 mb-8">
      <EchoTalesLogo size={44} className="drop-shadow-lg" />
      <span className="text-3xl font-bold text-white tracking-tight">Echo Tales</span>
    </Link>
  );
}

export function TalesAuthLoadingFallback() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e1145_0%,#0f0a1e_50%,#0a0612_100%)]" />
      <div className="relative w-full max-w-md text-center text-white/50">Loading...</div>
    </div>
  );
}

/** Dark glass input styling props for use with the shared Input component */
export const talesInputClassName = "border-white/10 bg-white/[0.06] text-white placeholder:text-white/30";
export const talesIconClassName = "w-5 h-5 text-white/30";
