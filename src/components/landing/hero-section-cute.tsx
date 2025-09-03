'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Countdown } from './countdown';
import { cuteFeatures, baseStats, FeatureItem, StatItem } from './hero-data';

/***************************
 * Tiny Decorative Icons   *
 ***************************/
const Star = (props: { className?: string; style?: any }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={props.className} style={props.style}>
    <path d="M12 3.5l2.4 4.86 5.36.78-3.88 3.78.92 5.35L12 15.9 7.2 18.27l.92-5.35L4.24 9.14l5.36-.78L12 3.5z" />
  </svg>
);

/***************************
 * Cute Hero Variant       *
 ***************************/
export function HeroSectionCute() {
  return (
    <section className="relative w-full h-[92dvh] min-h-[640px] flex items-center justify-center overflow-hidden bg-primary text-white">
      {/* Soft gradient field */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,hsl(var(--accent)/0.32),transparent_65%),radial-gradient(circle_at_82%_72%,hsl(var(--accent)/0.28),transparent_60%),linear-gradient(140deg,hsl(var(--primary)/0.92)_0%,hsl(var(--primary)/0.55)_55%,hsl(var(--primary)/0.92)_100%)]" />
        {/* Soft clouds */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] opacity-[0.08] bg-[conic-gradient(from_45deg,hsl(var(--accent)/0.5),transparent_60%)] animate-[spin_40s_linear_infinite]" />
        <div className="absolute inset-0 opacity-[0.18] mix-blend-screen [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.25)_0px,rgba(255,255,255,0.25)_1px,transparent_1px,transparent_70px),repeating-linear-gradient(90deg,rgba(255,255,255,0.25)_0px,rgba(255,255,255,0.25)_1px,transparent_1px,transparent_70px)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,hsl(var(--accent)/0.5)_1px,transparent_0)] bg-[size:26px_26px]" />
      </div>

      {/* Floating pastel blobs */}
      {['-top-20 -left-10','top-1/3 -right-10','bottom-0 left-1/4','bottom-10 right-1/3'].map((pos, i) => (
        <div key={i} className={`pointer-events-none absolute ${pos} w-[28rem] h-[28rem] blur-[70px] opacity-40 rounded-full`} style={{ background: 'radial-gradient(circle at 30% 30%, hsl(var(--accent)/0.55), transparent 70%)', animation: `float${i} 18s ease-in-out infinite`, animationDelay: `${i * 3}s` }} />
      ))}

      {/* Stars */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <Star key={i} className="absolute text-accent/70 drop-shadow" style={{ top: `${(i * 37) % 95}%`, left: `${(i * 53) % 100}%`, width: 10 + (i % 4) * 4, height: 10 + (i % 4) * 4, animation: `twinkle 6s ${(i * 0.7)}s ease-in-out infinite` }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 sm:px-10 lg:px-14">
        <style jsx>{`
          @keyframes float0 { 0%,100% { transform:translateY(0) scale(1);} 50% { transform:translateY(-40px) scale(1.08);} }
          @keyframes float1 { 0%,100% { transform:translateY(0) scale(1);} 50% { transform:translateY(-55px) scale(0.95);} }
          @keyframes float2 { 0%,100% { transform:translateY(0) scale(1);} 50% { transform:translateY(-30px) scale(1.07);} }
          @keyframes float3 { 0%,100% { transform:translateY(0) scale(1);} 50% { transform:translateY(-45px) scale(0.93);} }
          @keyframes twinkle { 0%,100% { opacity:0; transform:scale(.2) rotate(0deg);} 10% { opacity:.9; transform:scale(1) rotate(15deg);} 40% { opacity:.4; transform:scale(.6) rotate(45deg);} 70% { opacity:0; transform:scale(.2) rotate(90deg);} }
          .kawaii-title { position:relative; }
          .kawaii-title:after { content:''; position:absolute; left:0; bottom:-10px; width:100%; height:10px; background:radial-gradient(circle at 10% 50%,hsl(var(--accent)) 0%,transparent 70%),radial-gradient(circle at 40% 50%,hsl(var(--accent)/0.7) 0%,transparent 70%),radial-gradient(circle at 70% 50%,hsl(var(--accent)/0.6) 0%,transparent 70%),radial-gradient(circle at 95% 50%,hsl(var(--accent)/0.5) 0%,transparent 70%); mix-blend-lighten; opacity:.55; filter:blur(4px); }
          .soft-card { position:relative; }
          .soft-card:before { content:''; position:absolute; inset:0; background:linear-gradient(140deg,hsl(var(--accent)/0.35),transparent 65%); opacity:.4; mix-blend-overlay; }
          .soft-bubble { animation: bubble 14s ease-in-out infinite; }
          @keyframes bubble { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-16px);} }
          .reveal { animation: reveal 1.3s ease .15s both; }
          @keyframes reveal { from { opacity:0; filter:blur(8px) brightness(.5); transform:translateY(28px);} to { opacity:1; filter:blur(0) brightness(1); transform:translateY(0);} }
          .tag-chip { background:linear-gradient(120deg,hsl(var(--accent)/0.4),hsl(var(--accent)/0.2)); }
          @media (prefers-reduced-motion: reduce) { .soft-bubble, [class*='float'], .reveal, [class*='twinkle'] { animation: none !important; } }
        `}</style>

        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          {/* Left content */}
          <div className="flex-1 w-full text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full tag-chip px-5 py-2 backdrop-blur-md border border-accent/40 shadow-[0_4px_18px_-6px_hsl(var(--accent)/0.6)] mb-8 reveal">
              <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse shadow-[0_0_0_3px_hsl(var(--accent)/0.35)]" />
              <span className="text-[11px] tracking-[0.3em] font-semibold uppercase text-white/90">LIVE BUILD MODE</span>
            </div>
            <h1 className="kawaii-title text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-headline font-bold tracking-tight leading-[1.05] reveal">
              <span className="bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent drop-shadow-[0_4px_18px_rgba(0,0,0,0.25)]">
                SOS-ADE
              </span>
              <span className="block mt-6 text-lg sm:text-xl md:text-2xl font-normal text-white/85 max-w-2xl mx-auto lg:mx-0">
                A playful engineering habitat where creative curiosity, code & community sparkle together.
              </span>
            </h1>
            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-6 reveal">
              <Button asChild size="lg" className="relative rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-10 py-6 shadow-[0_10px_34px_-10px_hsl(var(--accent)/0.85)] transition-all hover:scale-[1.04] active:scale-95">
                <Link href="#">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    Request Help
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="relative rounded-full border-2 border-accent/70 text-accent hover:bg-accent hover:text-accent-foreground font-semibold px-10 py-6 backdrop-blur-md bg-white/10 transition-all hover:scale-[1.05] active:scale-95">
                <Link href="#featured-courses">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Explore Courses
                  </span>
                </Link>
              </Button>
            </div>
            <div className="mt-14 reveal">
              <Countdown variant="cute" />
            </div>
            <div className="mt-14 grid grid-cols-3 gap-5 max-w-xl mx-auto lg:mx-0 reveal">
              {cuteFeatures().map((item: FeatureItem) => (
                <div key={item.title} className="group relative soft-card rounded-2xl border border-accent/30 bg-white/6 backdrop-blur-xl px-4 py-5 overflow-hidden shadow-[0_4px_22px_-8px_rgba(0,0,0,0.55)] hover:border-accent/55 transition-colors">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--accent)/0.4),transparent_70%)]" />
                  <div className="mb-2 relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out">{item.icon}</div>
                  <p className="text-xs font-semibold tracking-wide text-accent relative z-10">{item.title}</p>
                  <p className="text-[11px] text-gray-300 relative z-10">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right playful panel */}
          <div className="w-full max-w-md relative reveal">
            <div className="relative rounded-[2.2rem] border border-accent/35 bg-white/[0.07] backdrop-blur-2xl shadow-[0_14px_60px_-18px_rgba(0,0,0,0.55)] overflow-hidden px-7 pt-10 pb-14">
              <div className="absolute -top-16 -right-12 w-56 h-56 rounded-full bg-accent/30 blur-[90px]" />
              <div className="absolute -bottom-10 -left-8 w-60 h-60 rounded-full bg-accent/20 blur-[90px]" />
              <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[linear-gradient(145deg,hsl(var(--accent)/0.6),transparent_60%)]" />
              <div className="absolute inset-0 [mask:linear-gradient(to_bottom,black,transparent_90%)] opacity-40 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.15)_0px,rgba(255,255,255,0.15)_2px,transparent_2px,transparent_6px)]" />
              <div className="relative z-10 space-y-7">
                <div className="space-y-3 text-center">
                  <p className="text-[11px] font-medium tracking-[0.35em] uppercase text-accent/80">Milestone</p>
                  <h2 className="text-2xl font-headline font-semibold bg-gradient-to-r from-accent to-white/80 bg-clip-text text-transparent">Launch Countdown</h2>
                  <p className="text-sm text-gray-300 leading-relaxed max-w-xs mx-auto">Iterating playful knowledge flows & peer-led creation loops.</p>
                </div>
                <Countdown variant="cute" />
                <div className="grid gap-4 pt-2">
                  {baseStats.map((stat: StatItem) => (
                    <div key={stat.k} className="flex items-center justify-between text-[11px] tracking-wide">
                      <span className="text-gray-300/90">{stat.k}</span>
                      <span className="font-semibold text-accent">{stat.v}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 text-left">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-accent/70 mb-3">Build Notes</p>
                  <div className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-4 text-[12px] leading-relaxed text-gray-100/95 shadow-inner">
                    Tuning adaptive pathways, layering semantic indexing & designing micro-collab sprints.
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 w-10 h-10 rounded-lg border border-accent/40 flex items-center justify-center text-accent/80 text-[10px] tracking-wide font-mono bg-white/5 backdrop-blur-md">v1.0</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSectionCute;
