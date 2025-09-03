'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Countdown } from './countdown';
import { baseFeatures, extendedStats, FeatureItem, StatItem } from './hero-data';

/*****************************************
 * Hyper Creative Signature Hero Variant  *
 * Concept: "Parametric Neuro‑Blueprint"  *
 * - Layered isometric lattice
 * - Animated helix & signal pulses
 * - Parallax shards + liquid blobs
 * - Glass data slab + kinetic headline
 *****************************************/

/* Countdown reused (self-contained) */
// Removed local countdown; using shared component instead.

/* Procedural static points for lattice (SSR safe) */
const latticePoints = (() => {
  const pts: { x:number; y:number; d:number }[] = [];
  for (let y = 0; y < 14; y++) {
    for (let x = 0; x < 24; x++) {
      if ((x + y) % 2 === 0) pts.push({ x, y, d: ((x * 37 + y * 17) % 9) });
    }
  }
  return pts;
})();

export function HeroSectionSignature() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setParallax({ x: dx, y: dy });
    };
    window.addEventListener('pointermove', handler, { passive: true });
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  return (
    <section ref={wrapRef} className="relative w-full h-[95dvh] min-h-[760px] overflow-hidden flex items-center justify-center bg-primary/95 text-white">
      {/* BACKGROUND CORE */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient field */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,hsl(var(--accent)/0.38),transparent_60%),radial-gradient(circle_at_80%_70%,hsl(var(--accent)/0.32),transparent_55%),linear-gradient(125deg,hsl(var(--primary)/0.9)_0%,hsl(var(--primary)/0.45)_55%,hsl(var(--primary)/0.9)_100%)]" />
        {/* Isometric lattice */}
        <svg aria-hidden className="absolute inset-0 w-full h-full opacity-[0.18] mix-blend-screen" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="lat-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {latticePoints.map(p => (
            <circle key={`${p.x}-${p.y}`} cx={50 + p.x * 45} cy={60 + p.y * 48} r={p.d < 3 ? 2.2 : 1.2} fill="hsl(var(--accent))" opacity={p.d < 4 ? 0.9 : 0.4} />
          ))}
          {/* subtle connecting lines */}
          {latticePoints.filter(p=>p.d%3===0).map(p => (
            <line key={`l-${p.x}-${p.y}`} x1={50+p.x*45} y1={60+p.y*48} x2={50+(p.x+1)*45} y2={60+(p.y+1)*48} stroke="url(#lat-g)" strokeWidth={1} />
          ))}
        </svg>
        {/* Animated helix */}
        <svg aria-hidden className="absolute inset-0 w-full h-full opacity-50">
          {Array.from({ length: 42 }).map((_, i) => {
            const t = i / 42;
            const x = 50 + Math.sin(t * Math.PI * 4) * 24;
            const y = t * 100;
            return (
              <circle key={i} cx={`${x}%`} cy={`${y}%`} r={i % 6 === 0 ? 6 : 3} className="fill-accent animate-[pulse_6s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.12}s` }} />
            );
          })}
        </svg>
        {/* Liquid blobs */}
        {[0,1,2].map(i => (
          <div key={i} className="absolute w-[38rem] h-[38rem] rounded-full blur-[95px] opacity-40" style={{
            top: i===0 ? '-12%' : i===1 ? '55%' : '15%',
            left: i===0 ? '-10%' : i===1 ? '60%' : '72%',
            background: 'radial-gradient(circle at 30% 30%, hsl(var(--accent)/0.6), transparent 65%)',
            animation: `blobFloat${i} 26s ease-in-out infinite`,
            animationDelay: `${i*4}s`
          }} />
        ))}
      </div>

      {/* PARALLAX SHARDS */}
      <div className="pointer-events-none absolute inset-0 -z-[5]">
        {Array.from({ length: 14 }).map((_, i) => {
          const depth = (i % 5) + 2;
          const baseX = (i * 73) % 100; const baseY = (i * 41) % 100;
          const translateX = parallax.x * depth * 12; const translateY = parallax.y * depth * 12;
          return (
            <div
              key={i}
              className="absolute w-40 h-40 rounded-[28px] border border-accent/25 bg-accent/10 backdrop-blur-md shadow-[0_4px_30px_-10px_hsl(var(--accent)/0.5)] rotate-45"
              style={{
                top: `${baseY}%`, left: `${baseX}%`,
                transform: `translate(-50%,-50%) translate3d(${translateX}px,${translateY}px,0) scale(${0.35 + (depth/10)}) rotate(45deg)`,
                animation: `shardPulse 8s ${(i*0.6)}s ease-in-out infinite`,
                opacity: 0.25
              }}
            />
          );
        })}
      </div>

      <div className="relative z-10 w-full max-w-[1500px] px-6 lg:px-12 flex flex-col xl:flex-row items-center gap-20">
        <style jsx>{`
          @media (prefers-reduced-motion: reduce) { [class*='blobFloat'], .headline-text span, .glow-ring, .scan-line, .reveal, [class*='shard'] { animation: none !important; } }
          @keyframes blobFloat0 { 0%,100% { transform:translate3d(0,0,0) scale(1);} 50% { transform:translate3d(8%,6%,0) scale(1.12);} }
          @keyframes blobFloat1 { 0%,100% { transform:translate3d(0,0,0) scale(1);} 50% { transform:translate3d(-6%,-4%,0) scale(0.9);} }
          @keyframes blobFloat2 { 0%,100% { transform:translate3d(0,0,0) scale(1);} 50% { transform:translate3d(-4%,5%,0) scale(1.07);} }
          @keyframes shardPulse { 0%,100% { filter:brightness(.9) blur(0); } 50% { filter:brightness(1.4) blur(2px); } }
          .headline-core { position:relative; }
          .headline-core .stroke { position:absolute; inset:0; background:linear-gradient(90deg,hsl(var(--accent)) 0%,transparent 70%); mix-blend-overlay; filter:blur(18px) opacity(.6); }
          .headline-text { background:linear-gradient(95deg,#fff 0%,hsl(var(--accent)) 55%,hsl(var(--accent)/0.6) 100%); -webkit-background-clip:text; color:transparent; }
          .kinetic-word span { display:inline-block; animation: riseWords 1.1s ease forwards; opacity:0; transform:translateY(30px) scale(.95); }
          .kinetic-word span:nth-child(odd){ animation-delay:.05s; } .kinetic-word span:nth-child(even){ animation-delay:.18s; }
          @keyframes riseWords { to { opacity:1; transform:translateY(0) scale(1);} }
          .data-slab { position:relative; }
          .data-slab:before { content:''; position:absolute; inset:0; background:linear-gradient(140deg,hsl(var(--accent)/0.65),transparent 60%); mix-blend-overlay; opacity:.35; }
          .glow-ring { background:conic-gradient(from_0deg,hsl(var(--accent))_0deg,hsl(var(--accent)/0.1)_300deg); animation: spin 12s linear infinite; }
          @keyframes scan { 0%,100% { transform:translateY(-100%);} 50% { transform:translateY(100%);} }
          .scan-line { animation: scan 9s linear infinite; }
          @keyframes fadeSlide { from { opacity:0; transform:translateY(34px) skewY(2deg); } to { opacity:1; transform:translateY(0) skewY(0); } }
          .reveal { animation: fadeSlide 1.2s ease .2s both; }
        `}</style>

        {/* LEFT: Headline cluster */}
        <div className="flex-1 w-full relative">
          <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute left-20 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-accent/30 blur-2xl" />
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/40 px-6 py-2 backdrop-blur-md mb-10 shadow-[0_4px_20px_-6px_hsl(var(--accent)/0.55)] reveal">
            <span className="h-2.5 w-2.5 rounded-full bg-accent animate-ping" />
            <span className="text-[11px] tracking-[0.3em] font-semibold text-accent uppercase">Experimental Stack</span>
          </div>
          <div className="headline-core mb-8">
            <div className="stroke" />
            <h1 className="headline-text text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-headline font-bold leading-[1.04] tracking-tight kinetic-word">
              {Array.from('SOS-ADE').map((ch,i)=>(<span key={i}>{ch}</span>))}
            </h1>
            <p className="mt-6 text-lg sm:text-xl md:text-2xl max-w-xl text-white/80 font-normal reveal">
              A neuro‑inspired engineering realm where aesthetic systems, learning flows & collaborative logic sculpt the future.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 items-center reveal">
            <Button asChild size="lg" className="relative bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-10 py-6 tracking-wide shadow-[0_8px_32px_-10px_hsl(var(--accent)/0.85)] transition-all hover:scale-[1.04] active:scale-95">
              <Link href="#"><span className="flex items-center gap-2"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>Request Help</span></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="relative border-2 border-accent/60 text-accent hover:bg-accent hover:text-accent-foreground font-semibold rounded-full px-10 py-6 backdrop-blur-md bg-white/5 tracking-wide transition-all hover:scale-[1.05] active:scale-95">
              <Link href="#featured-courses"><span className="flex items-center gap-2"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Explore Courses</span></Link>
            </Button>
          </div>
          <div className="mt-14 flex items-center gap-10 reveal flex-wrap">
            <div className="flex flex-col items-start gap-4">
              <Countdown variant="signature" />
              <p className="text-[11px] tracking-[0.35em] uppercase text-accent/70 font-medium ml-1">Launch T‑Minus</p>
            </div>
            <div className="grid grid-cols-3 gap-5 max-w-sm">
              {baseFeatures().map((card:FeatureItem) => (
                <div key={card.title} className="group relative rounded-2xl border border-accent/30 bg-white/5 backdrop-blur-xl px-4 py-5 overflow-hidden shadow-[0_4px_26px_-10px_rgba(0,0,0,0.55)] hover:border-accent/60 transition-colors">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_68%_28%,hsl(var(--accent)/0.4),transparent_70%)]" />
                  <div className="mb-2 relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out">{card.icon}</div>
                  <p className="text-[11px] font-semibold tracking-wide text-accent relative z-10">{card.title}</p>
                  <p className="text-[10px] text-gray-300 relative z-10">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Data Slab */}
        <div className="w-full max-w-md xl:max-w-lg relative data-slab reveal">
          <div className="relative rounded-[2.4rem] border border-accent/40 bg-white/[0.06] backdrop-blur-2xl shadow-[0_14px_70px_-20px_rgba(0,0,0,0.6)] overflow-hidden px-8 pt-12 pb-16">
            {/* ambient overlays */}
            <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[linear-gradient(150deg,hsl(var(--accent)/0.65),transparent_65%)]" />
            <div className="absolute inset-0 [mask:linear-gradient(to_bottom,black,transparent_92%)] opacity-45 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.12)_0px,rgba(255,255,255,0.12)_2px,transparent_2px,transparent_6px)]" />
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent/25 blur-[110px]" />
            <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-accent/15 blur-[120px]" />

            {/* scanning line */}
            <div className="scan-line absolute inset-x-0 top-0 h-1/2 pointer-events-none [background:linear-gradient(to_bottom,rgba(255,255,255,0.4),transparent)] mix-blend-overlay" />

            <div className="relative z-10 space-y-10">
              <div className="space-y-3 text-left">
                <p className="text-[11px] font-medium tracking-[0.35em] uppercase text-accent/80">Launch Vector</p>
                <h2 className="text-2xl font-headline font-semibold bg-gradient-to-r from-accent to-white/80 bg-clip-text text-transparent">Evolution Panel</h2>
                <p className="text-sm text-gray-300 leading-relaxed max-w-sm">Evolving adaptive knowledge graphs, generative learning loops & synchronized build rituals.</p>
              </div>
              <Countdown variant="signature" />
              <div className="grid gap-5 text-left pt-2">
                {extendedStats.map((row:StatItem) => (
                  <div key={row.k} className="flex items-center justify-between text-[11px] tracking-wide">
                    <span className="text-gray-300/85">{row.k}</span>
                    <span className="font-semibold text-accent">{row.v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-[11px] tracking-[0.3em] uppercase text-accent/70">Blueprint Notes</p>
                <div className="rounded-xl border border-accent/25 bg-accent/10 px-5 py-5 text-[12px] leading-relaxed text-gray-100/95 shadow-inner">
                  Building semantic substrate, layering intent inference & orchestrating micro‑mentorship swarms.
                </div>
              </div>
              {/* circular kinetic ring */}
              <div className="relative flex items-center justify-center pt-4">
                <div className="relative w-40 h-40">
                  <div className="absolute inset-0 rounded-full glow-ring opacity-30" />
                  <div className="absolute inset-4 rounded-full border-2 border-accent/50 backdrop-blur-md flex items-center justify-center">
                    <span className="text-accent font-semibold tracking-widest text-[11px]">v1.0</span>
                  </div>
                  <div className="absolute inset-0 animate-spin [animation-duration:18s] origin-center">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <span key={i} className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-accent shadow-[0_0_0_4px_hsl(var(--accent)/0.15)]" style={{ transform: `rotate(${i*45}deg) translateY(-20px)` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSectionSignature;
