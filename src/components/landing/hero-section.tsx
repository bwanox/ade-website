'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/***************************
 * Countdown (kept logic)  *
 ***************************/
const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const targetDate = new Date('2024-09-01T00:00:00');
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-3">
        {([
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Min', value: timeLeft.minutes },
          { label: 'Sec', value: timeLeft.seconds },
        ] as const).map((item) => (
          <div key={item.label} className="relative group">
            <div className="rounded-xl border border-accent/40 bg-gradient-to-br from-accent/15 to-transparent backdrop-blur-md px-3 py-4 flex flex-col items-center shadow-[0_4px_18px_-6px_hsl(var(--accent)/0.4)] transition-all duration-300 group-hover:border-accent/70">
              <span className="text-3xl font-headline font-bold tracking-tight bg-gradient-to-b from-accent to-white/80 bg-clip-text text-transparent">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] tracking-[0.15em] uppercase text-gray-300/90 mt-1">{item.label}</span>
            </div>
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen pointer-events-none bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent)/0.7),transparent_70%)]" />
          </div>
        ))}
      </div>
      <div className="absolute -inset-[2px] rounded-2xl border border-accent/30 pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
    </div>
  );
};

/***************************
 * Decorative Layers       *
 ***************************/
const SchematicPaths = () => (
  <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 1600 900" fill="none" aria-hidden>
    <defs>
      <linearGradient id="grad-line" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g stroke="url(#grad-line)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke">
      <path className="schematic-path" d="M100 120 H600 Q640 120 660 140 L720 200 Q740 220 780 220 H1500" />
      <path className="schematic-path" d="M80 340 H560 Q600 340 630 360 L700 410 Q720 430 760 430 H1540" />
      <path className="schematic-path" d="M120 560 H640 Q690 560 730 600 L800 660 Q820 680 860 680 H1500" />
      <circle cx="720" cy="200" r="6" className="node" />
      <circle cx="700" cy="410" r="6" className="node" />
      <circle cx="800" cy="660" r="6" className="node" />
      <circle cx="1080" cy="220" r="4" className="node-sm" />
      <circle cx="1180" cy="430" r="4" className="node-sm" />
      <circle cx="980" cy="680" r="4" className="node-sm" />
    </g>
  </svg>
);

const GearAssembly = () => (
  <div className="absolute right-[-180px] top-1/2 -translate-y-1/2 hidden xl:block pointer-events-none select-none">
    <svg viewBox="0 0 600 600" className="w-[620px] h-[620px] opacity-[0.22]" fill="none" aria-hidden>
      <g className="gear-large" stroke="hsl(var(--accent))" strokeWidth="10" strokeLinecap="round">
        <circle cx="300" cy="300" r="160" strokeOpacity="0.5" />
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1="300" y1="140" x2="300" y2="110" transform={`rotate(${(360 / 24) * i} 300 300)`} strokeOpacity="0.35" />
        ))}
        <circle cx="300" cy="300" r="40" strokeOpacity="0.8" />
      </g>
      <g className="gear-medium" stroke="hsl(var(--accent))" strokeWidth="6" strokeLinecap="round">
        <circle cx="170" cy="390" r="90" strokeOpacity="0.45" />
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1="170" y1="300" x2="170" y2="270" transform={`rotate(${(360 / 16) * i} 170 390)`} strokeOpacity="0.35" />
        ))}
        <circle cx="170" cy="390" r="28" strokeOpacity="0.7" />
      </g>
      <g className="gear-small" stroke="hsl(var(--accent))" strokeWidth="4" strokeLinecap="round">
        <circle cx="450" cy="420" r="60" strokeOpacity="0.4" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="450" y1="360" x2="450" y2="340" transform={`rotate(${(360 / 12) * i} 450 420)`} strokeOpacity="0.3" />
        ))}
        <circle cx="450" cy="420" r="20" strokeOpacity="0.6" />
      </g>
    </svg>
  </div>
);

/***************************
 * Hero Section            *
 ***************************/
export function HeroSection() {
  return (
    <section className="relative w-full h-[94dvh] min-h-[720px] flex items-stretch overflow-hidden bg-primary/95 text-white">
      {/* Base Layer: gradient mesh + blueprint grid */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,hsl(var(--accent)/0.32),transparent_55%),radial-gradient(circle_at_80%_70%,hsl(var(--accent)/0.28),transparent_60%),linear-gradient(125deg,hsl(var(--primary)/0.9)_0%,hsl(var(--primary)/0.4)_70%,hsl(var(--primary)/0.9)_100%)]" />
        <div className="absolute inset-0 opacity-[0.18] mix-blend-screen [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_78px),repeating-linear-gradient(90deg,rgba(255,255,255,0.22)_0px,rgba(255,255,255,0.22)_1px,transparent_1px,transparent_78px)]" />
        {/* Fine micro grid */}
        <div className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_1px,transparent_1px,transparent_16px),repeating-linear-gradient(90deg,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_1px,transparent_1px,transparent_16px)]" />
        <SchematicPaths />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,hsl(var(--primary)/0.3)_50%,transparent_100%)] opacity-40 mix-blend-overlay animate-[pulse_14s_linear_infinite]" />
      </div>

      <GearAssembly />

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-6 lg:px-10 flex flex-col lg:flex-row items-center lg:items-stretch gap-14">
        <style jsx>{`
          .schematic-path { stroke-dasharray: 900; stroke-dashoffset: 900; animation: draw 14s ease-in-out infinite; }
          .schematic-path:nth-child(2) { animation-delay: 4s; }
            .schematic-path:nth-child(3) { animation-delay: 8s; }
          @keyframes draw { 0% { stroke-dashoffset:900; opacity:0;} 10% {opacity:1;} 45% { stroke-dashoffset:0; opacity:1;} 70% {opacity:0.9;} 100% { stroke-dashoffset:0; opacity:0;} }
          .node, .node-sm { fill:hsl(var(--accent)); filter:drop-shadow(0 0 6px hsl(var(--accent)/0.8)); animation:pulseNode 6s ease-in-out infinite; }
          .node-sm { animation-delay:2s; }
          @keyframes pulseNode { 0%,100% { transform:scale(1);} 50% { transform:scale(1.25);} }
          .gear-large { animation: spin 110s linear infinite; transform-origin:300px 300px; }
          .gear-medium { animation: spinReverse 70s linear infinite; transform-origin:170px 390px; }
          .gear-small { animation: spin 55s linear infinite; transform-origin:450px 420px; }
          @keyframes spin { to { transform:rotate(360deg);} }
          @keyframes spinReverse { to { transform:rotate(-360deg);} }
          .headline-gradient { background:linear-gradient(95deg,#fff 0%, hsl(var(--accent)) 55%, hsl(var(--accent)/0.5) 100%); -webkit-background-clip:text; color:transparent; }
          .headline-stroke { position:relative; }
          .headline-stroke:before { content:''; position:absolute; inset:0; background:linear-gradient(95deg,#fff 0%,hsl(var(--accent)) 60%,transparent 100%); filter:blur(14px) opacity(.65); mix-blend-screen; }
          .scanlines { position:absolute; inset:0; background:repeating-linear-gradient( to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px ); mix-blend-overlay; opacity:.4; pointer-events:none; } 
          .panel-border { background:linear-gradient(140deg,hsl(var(--accent)/0.7),transparent 60%), linear-gradient( to right, hsl(var(--accent)/0.3), transparent); } 
          .panel-grid { background-image:radial-gradient(circle at 1px 1px, hsl(var(--accent)/0.45) 1px, transparent 0); background-size:22px 22px; }
          .floating-badge { animation: floatY 6s ease-in-out infinite; }
          @keyframes floatY { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-12px);} }
          .fade-reveal { animation: fadeReveal 1.4s ease 0.15s both; }
          @keyframes fadeReveal { from { opacity:0; transform:translateY(26px) skewY(2deg); filter:blur(6px);} to { opacity:1; transform:translateY(0) skewY(0); filter:blur(0);} }
          .divider-line { background:linear-gradient(to right, transparent, hsl(var(--accent)/0.8), transparent); height:1px; }
          .btn-ghost-engineer { position:relative; }
          .btn-ghost-engineer:before { content:''; position:absolute; inset:0; border:1px solid hsl(var(--accent)/0.5); border-radius:inherit; mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; padding:2px; }
          .btn-ghost-engineer:hover:before { border-color:hsl(var(--accent)); }
        `}</style>

        {/* Left Column */}
        <div className="flex-1 max-w-3xl w-full relative py-12 lg:py-24">
          <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-accent/15 blur-2xl" />
          <div className="absolute left-24 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-accent/25 blur-xl" />
          <div className="floating-badge inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/40 px-5 py-2 backdrop-blur-md shadow-[0_4px_20px_-6px_hsl(var(--accent)/0.5)] mb-8">
            <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
            <span className="text-[11px] tracking-[0.25em] font-semibold text-accent uppercase">Engineering Future</span>
          </div>
          <h1 className="headline-stroke text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-headline font-bold leading-[1.05] tracking-tight fade-reveal">
            <span className="headline-gradient">SOS-ADE</span>
            <span className="block mt-4 text-left text-lg sm:text-xl md:text-2xl font-normal text-white/80 max-w-xl">
              Artistry + Engineering: where design logic, collaboration & innovation converge.
            </span>
          </h1>
          <div className="mt-10 flex flex-wrap gap-6 items-center fade-reveal">
            <Button asChild size="lg" className="relative bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-10 py-6 tracking-wide shadow-[0_8px_32px_-10px_hsl(var(--accent)/0.8)] transition-all hover:scale-[1.03] active:scale-95">
              <Link href="#">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  Request Help
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-ghost-engineer relative border-2 border-accent/60 text-accent hover:bg-accent hover:text-accent-foreground font-semibold rounded-full px-10 py-6 backdrop-blur-md bg-white/5 tracking-wide transition-all hover:scale-[1.04] active:scale-95">
              <Link href="#featured-courses">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Explore Courses
                </span>
              </Link>
            </Button>
          </div>
          <div className="mt-12 divider-line w-full fade-reveal" />
          <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl fade-reveal">
            {[
              { title: 'Innovation', sub: 'Pipelines', icon: (
                <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2v8l6 2-6 2v8l-6-4 6-4-6-2 6-2-6-2 6-2z"/></svg>
              ) },
              { title: 'Collaborative', sub: 'Systems', icon: (
                <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M2 12h4M18 12h4M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83"/></svg>
              ) },
              { title: 'Future', sub: 'Focus', icon: (
                <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 4v8l4 4"/></svg>
              ) },
            ].map(feature => (
              <div key={feature.title} className="group relative rounded-2xl border border-accent/30 bg-white/5 backdrop-blur-xl px-4 py-5 overflow-hidden shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] hover:border-accent/60 transition-colors">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--accent)/0.35),transparent_70%)]" />
                <div className="mb-3 relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out">{feature.icon}</div>
                <p className="text-sm font-semibold tracking-wide text-accent relative z-10">{feature.title}</p>
                <p className="text-[11px] text-gray-300 relative z-10">{feature.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Panel */}
        <div className="w-full lg:w-[460px] relative lg:py-24 fade-reveal">
          <div className="relative rounded-[2rem] border border-accent/40 bg-white/[0.06] backdrop-blur-2xl shadow-[0_12px_60px_-18px_rgba(0,0,0,0.55)] overflow-hidden px-8 py-10 panel-grid">
            <div className="scanlines" />
            <div className="absolute inset-0 panel-border opacity-30 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10 space-y-8">
              <div className="text-left space-y-3">
                <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-accent/80">Upcoming Milestone</p>
                <h2 className="text-2xl font-headline font-semibold bg-gradient-to-r from-accent to-white/80 bg-clip-text text-transparent">Launch Countdown</h2>
                <p className="text-sm text-gray-300 leading-relaxed">Refining knowledge flow, peer mentorship & automated intelligence to elevate engineering journeys.</p>
              </div>
              <Countdown />
              <div className="pt-4 grid gap-4 text-left">
                {[
                  { k: 'Active Modules', v: '24' },
                  { k: 'Contributors', v: '58' },
                  { k: 'Open Ideas', v: '132' },
                ].map(stat => (
                  <div key={stat.k} className="flex items-center justify-between text-xs tracking-wide">
                    <span className="text-gray-300/90">{stat.k}</span>
                    <span className="font-semibold text-accent">{stat.v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-left">
                <p className="text-[11px] tracking-[0.25em] uppercase text-accent/70 mb-3">Blueprint Notes</p>
                <div className="rounded-xl border border-accent/25 bg-accent/10 px-4 py-4 text-[12px] leading-relaxed text-gray-200/95 shadow-inner">
                  Iterating on adaptive curriculum routing, semantic knowledge graphs & collaborative build sprints.
                </div>
              </div>
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-accent/20 blur-[90px]" />
            <div className="absolute bottom-6 right-6 w-10 h-10 rounded-lg border border-accent/40 flex items-center justify-center text-accent/80 text-[10px] tracking-wide font-mono bg-white/5 backdrop-blur-md">v1.0</div>
          </div>
        </div>
      </div>
    </section>
  );
}
