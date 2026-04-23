'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/**
 * "For parents" entry block. The non-academic parent reviewer flagged the
 * landing as written for other theorists. This block exists to give them a
 * plain-English path in before the jargon starts.
 */
export function ForParentsBlock() {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      className="relative px-6 py-16"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="max-w-3xl mx-auto rounded-xl p-7 sm:p-9 border backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(244,114,182,0.06) 0%, rgba(10,14,22,0.9) 55%, rgba(8,11,18,0.95) 100%)',
          borderColor: 'rgba(244,114,182,0.22)',
        }}
      >
        <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-pink-300/70 mb-4">
          If you are a parent
        </p>
        <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white/90 mb-5 leading-snug">
          Tuesday night, homework, a kid who says &ldquo;I&rsquo;m dumb.&rdquo;
        </h3>
        <div className="space-y-4 text-sm sm:text-base text-white/65 font-light leading-[1.8]">
          <p>
            You don&rsquo;t need to have read Sapolsky or Gramsci. You need one idea,
            in plain words: when a kid can&rsquo;t do math tonight, the honest answer
            is almost never that they are lazy, stupid, or broken. The honest answer
            is that something in their conditions — how they slept, how full their body
            is, how the room is set up, how the instruction found them, what got said
            in class today, how safe they feel — is not matching what a brain needs
            right now to grow through this problem. This is not a finger-wag at your
            parenting; it is the list good teachers quietly run through all day.
          </p>
          <p>
            That doesn&rsquo;t mean nothing is your job. It means your job is the one
            thing you can actually change: <span className="text-white/85">the conditions</span>.
            Not the outcome. Which is the hardest and also the kindest thing to
            know as a parent, because it takes off the table the thought that the
            kid is failing at being a kid.
          </p>
          <p>
            Everything in this page — the thinkers, the research, the podcast,
            the paper — is trying to build tools that treat your family that way.
            Tools that try to make the conditions better, the way a good teacher
            would if they had time for one kid.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link
            href="/rethinking/framework#foundation"
            className="text-[11px] font-mono tracking-[0.25em] uppercase text-pink-300/80 hover:text-pink-200 transition-colors"
          >
            The one idea, in more detail →
          </Link>
          <Link
            href="https://echo-tales.ledesign.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono tracking-[0.25em] uppercase text-white/40 hover:text-white/70 transition-colors"
          >
            What we are building for families ↗
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Named-teacher vignette. The skeptical-teacher reviewer said the one change
 * that would move them from "another theorist" to "these people get it" is a
 * real classroom paragraph. This is a composite sketch — the kind of small
 * realistic moment the framework has to survive, honestly labeled as a
 * sketch rather than a case study we did not conduct.
 */
export function TeacherVignette() {
  const { ref, visible } = useReveal();
  return (
    <section
      ref={ref}
      className="relative px-6 py-16"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="max-w-3xl mx-auto rounded-xl p-7 sm:p-9 border backdrop-blur-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(96,165,250,0.06) 0%, rgba(10,14,22,0.9) 55%, rgba(8,11,18,0.95) 100%)',
          borderColor: 'rgba(96,165,250,0.22)',
        }}
      >
        <p className="text-[10px] font-mono tracking-[0.4em] uppercase text-blue-300/70 mb-4">
          A sketch · 10:47 on a Tuesday
        </p>
        <h3 className="text-2xl sm:text-3xl font-extralight tracking-tight text-white/90 mb-5 leading-snug">
          What Principle 3 looks like in a room of 31.
        </h3>
        <div className="space-y-4 text-sm sm:text-base text-white/65 font-light leading-[1.8]">
          <p>
            Second period, eighth-grade algebra. A teacher we will call Marta
            has 31 kids, three IEPs, and a curriculum pacing guide that wants
            her on linear equations by Friday. At 10:47 she notices Jamie —
            who has not passed a standardized math test since fourth grade —
            tapping out the warm-up on his desk as a rhythm — the intervals
            worked out as a beat pattern, not as numbers. He is getting it
            right. Just not in the way the worksheet asks.
          </p>
          <p>
            Principle 3 says his intelligence is real, different, and
            currently being sorted into &ldquo;deficient.&rdquo; The principle does
            not tell Marta what to do at 10:48. It tells her what to watch
            for: a mind doing the work in its own register, likely invisible
            to the rubric. What she does next — call on him and embarrass
            him, ignore it, quietly hand him the same problem asked as a
            pattern, talk to him at lunch — is a judgment call she makes
            with her hands full.
          </p>
          <p className="text-white/80">
            This framework is not for replacing that judgment. It is for
            making sure that, when Marta makes it, she is not also fighting
            a system that told her Jamie was bad at math all along.
          </p>
        </div>
        <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/25 mt-6">
          Composite sketch · not an interview · open to correction from real
          classrooms
        </p>
      </div>
    </section>
  );
}
