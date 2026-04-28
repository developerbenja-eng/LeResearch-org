'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// ─── Custom SVG Icons (stroke-based, 24x24 viewBox) ───

function BookSparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 4C2 4 5 3 8 3C10 3 12 4 12 4L12 20C12 20 10 19 8 19C5 19 2 20 2 20L2 4Z" />
      <path d="M12 4C12 4 14 3 16 3C19 3 22 4 22 4L22 20C22 20 19 19 16 19C14 19 12 20 12 20" />
      <path d="M7 8L7 12" opacity="0.85" />
      <path d="M5 10L9 10" opacity="0.85" />
      <path d="M5.6 8.6L8.4 11.4" opacity="0.7" />
      <path d="M8.4 8.6L5.6 11.4" opacity="0.7" />
      <path d="M4.5 15L9.5 15" opacity="0.6" />
      <path d="M14.5 9L20 9" opacity="0.85" />
      <path d="M14.5 12L20 12" opacity="0.7" />
      <path d="M14.5 15L18.5 15" opacity="0.6" />
    </svg>
  );
}

function MusicNoteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18V5L21 3V16" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function CharacterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21C6 17.686 8.686 15 12 15C15.314 15 18 17.686 18 21" />
      <path d="M16 4L18 3" opacity="0.5" />
    </svg>
  );
}

function ResearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2A7.5 7.5 0 0 0 4.5 9.5C4.5 13 7 14.5 8 16L16 16C17 14.5 19.5 13 19.5 9.5A7.5 7.5 0 0 0 12 2Z" />
      <path d="M9 19L15 19" />
      <path d="M9.5 21.5L14.5 21.5" />
      <path d="M12 6L12 11M9 8.5L12 11L15 8.5" opacity="0.6" />
    </svg>
  );
}

function PrintedBookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 3H17C18.1 3 19 3.9 19 5V21L14.5 18.5L12 20L9.5 18.5L5 21V5C5 3.9 5.9 3 7 3H5Z" />
      <path d="M8 8L16 8" opacity="0.7" />
      <path d="M8 11L14 11" opacity="0.6" />
    </svg>
  );
}

function HandcraftedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="6" cy="17" r="2.5" />
      <path d="M8 8L20 20" />
      <path d="M8 16L20 4" />
      <path d="M14 10L20 4" opacity="0.5" />
    </svg>
  );
}

function VoiceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="8" y="3" width="8" height="13" rx="4" />
      <path d="M5 11C5 14.866 8.134 18 12 18C15.866 18 19 14.866 19 11" />
      <path d="M12 18L12 22" />
      <path d="M9 22L15 22" />
    </svg>
  );
}

function PathIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 20C4 16 8 15 8 11C8 7 12 6 12 6" />
      <path d="M20 20C20 16 16 15 16 11C16 7 12 6 12 6" />
      <circle cx="12" cy="4" r="2" />
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9C9.5 7.6 10.6 6.5 12 6.5C13.4 6.5 14.5 7.6 14.5 9C14.5 10.4 12 11 12 13" />
      <circle cx="12" cy="16.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

// ─── Animated Background ───

function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      const dpr = devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const particles: { x: number; y: number; vx: number; vy: number; s: number; o: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.1,
        s: 1 + Math.random() * 2,
        o: 0.1 + Math.random() * 0.2,
      });
    }

    const draw = () => {
      const w = innerWidth, h = innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.fillStyle = `rgba(167, 139, 250, ${p.o})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(167, 139, 250, ${p.o * 0.15})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineWidth = 0.3;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.06 * (1 - d / 120)})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    addEventListener('resize', resize);
    raf = requestAnimationFrame(draw);
    return () => { removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" />;
}

// ─── Feature Card ───

function FeatureCard({ icon, title, description, color, delay, href, badge }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
  href?: string;
  badge?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const inner = (
    <div className={`relative rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/[0.1] group-hover:translate-y-[-2px] h-full`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {badge && (
          <span className="text-[9px] font-mono tracking-[0.2em] uppercase px-2 py-1 rounded-full bg-white/[0.04] text-white/40 border border-white/[0.06]">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-base font-medium text-white/90 mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
    </div>
  );

  return (
    <div
      ref={ref}
      className="group relative"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      {href ? <Link href={href} className="block h-full">{inner}</Link> : inner}
    </div>
  );
}

// ─── Path Card (Research section) ───

function PathCard({ icon, eyebrow, title, description, cta, href, accent, delay }: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  accent: string;
  delay: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Link
      href={href}
      ref={ref}
      className="group relative block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      }}
    >
      <div className="relative rounded-2xl p-8 sm:p-10 border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-500 group-hover:bg-white/[0.04] group-hover:border-white/[0.12] h-full flex flex-col">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${accent}`}>
          {icon}
        </div>
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3">{eyebrow}</p>
        <h3 className="text-xl sm:text-2xl font-light text-white/90 mb-4 leading-snug">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed mb-8 flex-1">{description}</p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/70 group-hover:text-white/95 transition-colors">
          {cta}
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

// ─── Main Landing Page ───

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 50);
    addEventListener('scroll', onScroll);
    return () => removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0a12]/80 backdrop-blur-xl border-b border-white/[0.05]' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookSparkIcon className="w-6 h-6 text-purple-400" />
            <span className="text-sm font-medium text-white/80">Echo Tales</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tales/login" className="text-xs font-mono tracking-wider uppercase text-white/50 hover:text-white/70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              Sign in
            </Link>
            <Link href="/tales/register" className="text-xs font-mono tracking-wider uppercase px-4 py-2 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20 hover:bg-purple-500/25 transition-all">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <HeroBackground />

        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07]" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.05]" style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/[0.06] mb-8"
               style={{ animation: 'fadeIn 0.8s ease-out forwards' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-purple-300/70">For parents</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extralight tracking-tight mb-8">
            <span className="block text-white/90" style={{ animation: 'slideUp 0.8s ease-out forwards' }}>
              Learn what matters.
            </span>
            <span className="block mt-1"
              style={{
                animation: 'slideUp 0.8s ease-out 0.1s forwards', opacity: 0,
                background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
              Share it in their language.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/55 font-light leading-relaxed max-w-xl mx-auto mb-10"
             style={{ animation: 'fadeIn 1s ease-out 0.3s forwards', opacity: 0 }}>
            Echo Tales helps you explore what&apos;s on your mind as a parent — sleep, big emotions, new siblings, hard questions —
            and turn what you learn into books, songs, and objects your child actually lives with.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4"
               style={{ animation: 'fadeIn 1s ease-out 0.5s forwards', opacity: 0 }}>
            <Link href="/research" className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:translate-y-[-1px]">
              Start researching
            </Link>
            <Link href="#tools" className="px-8 py-3 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:border-white/20 hover:text-white/80 transition-all">
              See what&apos;s possible
            </Link>
          </div>

          <div className="mt-20 flex flex-col items-center gap-2" style={{ animation: 'fadeIn 1.5s ease-out 1.5s forwards', opacity: 0 }}>
            <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-white/15">Start where you are</span>
            <svg className="w-4 h-4 text-white/10" style={{ animation: 'float 2.5s ease-in-out infinite' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Two paths (Research-led) ── */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-400/40 mb-3">Two ways in</p>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/85 mb-4">
              Start where you are.
            </h2>
            <p className="text-sm text-white/45 max-w-lg mx-auto leading-relaxed">
              Some parents know exactly what they want to say. Others are still figuring out the question.
              Echo Tales works for both.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PathCard
              icon={<QuestionIcon className="w-6 h-6 text-cyan-300" />}
              eyebrow="I&rsquo;m not sure yet"
              title="Explore what&rsquo;s on your mind."
              description="Browse a parenting research library built on consolidated, evidence-based sources. Sleep, tantrums, grief, friendships, screens, milestones — find language for what you&rsquo;ve been feeling."
              cta="Open the research room"
              href="/research"
              accent="bg-cyan-500/10"
              delay={0}
            />
            <PathCard
              icon={<PathIcon className="w-6 h-6 text-purple-300" />}
              eyebrow="I know what I want to say"
              title="Skip ahead and create."
              description="Jump straight to the expression tools. Turn a lesson, a feeling, or a memory into a personalized book, song, coloring page, printed keepsake, or bedtime story on Alexa."
              cta="Start creating"
              href="/tales/register"
              accent="bg-purple-500/10"
              delay={0.1}
            />
          </div>
        </div>
      </section>

      {/* ── Expression tools ── */}
      <section id="tools" className="relative px-6 py-24 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-purple-400/40 mb-3">Then bring it home</p>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/85 mb-4">
              Turn insight into something they can hold.
            </h2>
            <p className="text-sm text-white/45 max-w-md mx-auto">
              Once you know what you want to share, Echo Tales gives you many ways to say it — on a screen, in print, or out loud in the room.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<BookSparkIcon className="w-5 h-5 text-purple-300" />}
              title="Personalized books"
              description="AI-generated stories where your child is the hero. Choose the theme, the lesson, the characters."
              color="bg-purple-500/10"
              href="/play"
              delay={0}
            />
            <FeatureCard
              icon={<MusicNoteIcon className="w-5 h-5 text-pink-300" />}
              title="Songs"
              description="Any story becomes an original song — lullaby, adventure, or learning track. Made from your narrative."
              color="bg-pink-500/10"
              href="/music"
              delay={0.08}
            />
            <FeatureCard
              icon={<CharacterIcon className="w-5 h-5 text-rose-300" />}
              title="Characters"
              description="Design with AI or upload a photo. Your characters show up across books, songs, and coloring pages."
              color="bg-rose-500/10"
              href="/play?tab=characters"
              delay={0.16}
            />
            <FeatureCard
              icon={<PrintedBookIcon className="w-5 h-5 text-amber-300" />}
              title="Printed books"
              description="Ship the story you made as a real hardcover. An object that lives on a shelf, not just a screen."
              color="bg-amber-500/10"
              href="/play"
              delay={0.24}
            />
            <FeatureCard
              icon={<HandcraftedIcon className="w-5 h-5 text-emerald-300" />}
              title="Handcrafted"
              description="For the stories that deserve it — we make each one by hand. Fabric, thread, paper, care."
              color="bg-emerald-500/10"
              href="/play"
              delay={0.32}
            />
            <FeatureCard
              icon={<VoiceIcon className="w-5 h-5 text-sky-300" />}
              title="Alexa & voice"
              description="Story-at-bedtime, songs on request — lives in the room, not on a screen. No phone needed."
              color="bg-sky-500/10"
              badge="Soon"
              delay={0.4}
            />
          </div>

          <div className="mt-12 text-center">
            <Link href="/tales/register" className="inline-flex text-sm text-purple-400/60 hover:text-purple-400/80 transition-colors font-mono tracking-wider">
              Start creating for free &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="relative px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.04]">
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.04) 0%, rgba(15,15,25,0.8) 50%, rgba(236,72,153,0.03) 100%)',
            }} />

            <div className="relative px-8 sm:px-16 py-16">
              <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/15 mb-6">Philosophy</p>

              <h2 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white/80 mb-6 leading-relaxed">
                Not every parent arrives with the words.
              </h2>

              <p className="text-sm text-white/50 leading-relaxed mb-4 max-w-2xl">
                Parenting asks us to speak about things we&rsquo;re still learning ourselves — loss, change, fear, wonder.
                Some of us have the words ready. Many of us don&rsquo;t.
              </p>

              <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-2xl">
                Echo Tales is a research room when you need to learn first, and a creative studio when you&rsquo;re ready to share.
                The same thought can become a bedtime book, a song in the car, a coloring page on the fridge, or a voice in the room at bedtime.
              </p>

              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-purple-500/20 to-transparent" />
                <Link href="https://ledesign.ai" className="text-[10px] font-mono tracking-[0.3em] uppercase text-purple-400/40 hover:text-purple-400/60 transition-colors whitespace-nowrap">
                  Part of LeDesign
                </Link>
                <div className="h-px flex-1 bg-gradient-to-l from-pink-500/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/25 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/85">
              From curiosity to keepsake.
            </h2>
          </div>

          <div className="space-y-0">
            {[
              { step: '01', title: 'Notice something', description: 'A question. A tough night. A milestone. A conversation you don\u2019t quite know how to start.', stepColor: 'rgba(103,232,249,0.5)' },
              { step: '02', title: 'Learn from validated sources', description: 'Browse the research room — evidence-based, consolidated, parent-first. Over 1,000 topics, without the noise.', stepColor: 'rgba(167,139,250,0.4)' },
              { step: '03', title: 'Express what you\u2019ve learned', description: 'Turn the insight into a personalized book, a song, a character, a coloring page, or a printed keepsake.', stepColor: 'rgba(236,72,153,0.4)' },
              { step: '04', title: 'Live with it', description: 'Reads at bedtime. Plays in the car. Sits on the shelf. Answers back on Alexa. It becomes part of how your family talks.', stepColor: 'rgba(251,191,36,0.4)' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 sm:gap-10 py-8 border-t border-white/[0.04] first:border-t-0">
                <div className="flex-shrink-0">
                  <span className="text-xs font-mono" style={{ color: item.stepColor }}>{item.step}</span>
                </div>
                <div>
                  <h3 className="text-lg font-light text-white/85 mb-2">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed max-w-lg">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-6 py-32">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white/85 mb-6">
            Start with a question.
          </h2>
          <p className="text-sm text-white/40 mb-10">
            Free to start. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/research" className="inline-flex px-10 py-3.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all hover:translate-y-[-1px]">
              Open the research room
            </Link>
            <Link href="/tales/register" className="inline-flex px-10 py-3.5 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:border-white/20 hover:text-white/80 transition-all">
              Skip to creating
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-12 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookSparkIcon className="w-4 h-4 text-purple-400/40" />
            <span className="text-xs text-white/20">Echo Tales</span>
            <span className="text-white/10">·</span>
            <Link href="https://ledesign.ai" className="text-xs text-white/30 hover:text-white/50 transition-colors">
              LeDesign
            </Link>
          </div>
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/10">
            Learn what matters. Share it in their language.
          </p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
      `}</style>
    </div>
  );
}
