'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Countdown } from './countdown';
import { baseFeatures, baseStats, FeatureItem, StatItem } from './hero-data';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useCollectionData } from '@/hooks/use-collection-data';
import { db } from '@/lib/firebase';
import { collection, orderBy, query as fsQuery } from 'firebase/firestore';

/***************************
 * Decorative Layers       *
 ***************************/
const SchematicPaths = () => (
  <svg className="absolute inset-0 w-full h-full opacity-50" viewBox="0 0 1600 900" fill="none" aria-hidden>
    <defs>
      <linearGradient id="grad-line" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.95)" stopOpacity="0.9" />
        <stop offset="100%" stopColor="rgba(255,255,255,0.1)" stopOpacity="0" />
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
      <g className="gear-large" stroke="rgba(255,255,255,0.8)" strokeWidth="10" strokeLinecap="round">
        <circle cx="300" cy="300" r="160" strokeOpacity="0.5" />
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1="300" y1="140" x2="300" y2="110" transform={`rotate(${(360 / 24) * i} 300 300)`} strokeOpacity="0.35" />
        ))}
        <circle cx="300" cy="300" r="40" strokeOpacity="0.8" />
      </g>
      <g className="gear-medium" stroke="rgba(255,255,255,0.7)" strokeWidth="6" strokeLinecap="round">
        <circle cx="170" cy="390" r="90" strokeOpacity="0.45" />
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1="170" y1="300" x2="170" y2="270" transform={`rotate(${(360 / 16) * i} 170 390)`} strokeOpacity="0.35" />
        ))}
        <circle cx="170" cy="390" r="28" strokeOpacity="0.7" />
      </g>
      <g className="gear-small" stroke="rgba(255,255,255,0.65)" strokeWidth="4" strokeLinecap="round">
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
  type Highlight = { id: string; title?: string; image?: string };
  const { data: highlights } = useCollectionData<Highlight>({
    query: () => fsQuery(collection(db, 'highlights'), orderBy('createdAt', 'desc')),
    enableRealtime: true,
  });

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
          @media (prefers-reduced-motion: reduce) {
            .schematic-path, .gear-large, .gear-medium, .gear-small, .floating-badge, .fade-reveal { animation: none !important; }
          }
          .schematic-path { stroke-dasharray: 900; stroke-dashoffset: 900; animation: draw 14s ease-in-out infinite; filter:drop-shadow(0 0 6px rgba(255,255,255,0.55)); }
          .schematic-path:nth-child(2) { animation-delay: 4s; }
            .schematic-path:nth-child(3) { animation-delay: 8s; }
          @keyframes draw { 0% { stroke-dashoffset:900; opacity:0;} 10% {opacity:1;} 45% { stroke-dashoffset:0; opacity:1;} 70% {opacity:0.9;} 100% { stroke-dashoffset:0; opacity:0;} }
          .node, .node-sm { fill:#fff; filter:drop-shadow(0 0 10px rgba(255,255,255,0.85)) drop-shadow(0 0 22px rgba(255,255,255,0.35)); animation:pulseNode 6s ease-in-out infinite; }
          .node-sm { animation-delay:2s; }
          @keyframes pulseNode { 0%,100% { transform:scale(1);} 50% { transform:scale(1.25);} }
          .gear-large, .gear-medium, .gear-small { filter:drop-shadow(0 0 14px rgba(255,255,255,0.25)); }
          .gear-large { animation: spin 110s linear infinite; transform-origin:300px 300px; }
          .gear-medium { animation: spinReverse 70s linear infinite; transform-origin:170px 390px; }
          .gear-small { animation: spin 55s linear infinite; transform-origin:450px 420px; }
          @keyframes spin { to { transform:rotate(360deg);} }
          @keyframes spinReverse { to { transform:rotate(-360deg);} }
          .headline-gradient { background:linear-gradient(95deg,#ffffff 0%, #ffffff 55%, rgba(255,255,255,0.65) 100%); -webkit-background-clip:text; color:transparent; text-shadow:0 0 8px rgba(255,255,255,0.6), 0 0 26px rgba(255,255,255,0.25); }
          .headline-stroke { position:relative; }
          .headline-stroke:before { content:''; position:absolute; inset:0; background:linear-gradient(95deg,#ffffff 0%,rgba(255,255,255,0.65) 60%,transparent 100%); filter:blur(18px) opacity(.55); mix-blend-screen; }
          .scanlines { position:absolute; inset:0; background:repeating-linear-gradient( to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 6px ); mix-blend-overlay; opacity:.4; pointer-events:none; } 
          .panel-border { background:linear-gradient(140deg,hsl(var(--accent)/0.7),transparent 60%), linear-gradient( to right, hsl(var(--accent)/0.3), transparent); } 
          .panel-grid { background-image:radial-gradient(circle at 1px 1px, hsl(var(--accent)/0.45) 1px, transparent 0); background-size:22px 22px; }
          .floating-badge { animation: floatY 6s ease-in-out infinite; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.35); box-shadow:0 4px 20px -6px rgba(255,255,255,0.35); }
          @keyframes floatY { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-12px);} }
          .fade-reveal { animation: fadeReveal 1.4s ease 0.15s both; }
          @keyframes fadeReveal { from { opacity:0; transform:translateY(26px) skewY(2deg); filter:blur(6px);} to { opacity:1; transform:translateY(0) skewY(0); filter:blur(0);} }
          .divider-line { background:linear-gradient(to right, transparent, rgba(255,255,255,0.9), transparent); height:1px; }
          .btn-ghost-engineer { position:relative; }
          .btn-ghost-engineer:before { content:''; position:absolute; inset:0; border:1px solid rgba(255,255,255,0.45); border-radius:inherit; mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; padding:2px; }
          .btn-ghost-engineer:hover:before { border-color:#fff; }
          .feature-title { color:#fff; text-shadow:0 0 6px rgba(255,255,255,0.5); }
          .feature-sub { color:rgba(255,255,255,0.6); }
          .panel-grid p.text-accent, .panel-grid span.text-accent, .panel-grid .tracking-[0.3em] { color:#fff !important; }
          .panel-grid .border-accent\/25 { border-color:rgba(255,255,255,0.25); }
        `}</style>

        {/* Mobile-specific layout */}
        <div className="sm:hidden mobile-layout">
          <div className="mobile-grid-overlay" />
          <div className="mobile-circuit-lines" />
          <div className="mobile-tech-orb orb-1" />
          <div className="mobile-tech-orb orb-2" />
          
          <div className="mobile-hexagon-cluster">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="mobile-hex" />
            ))}
          </div>

          <div className="mobile-header">
            <div className="mobile-status-bar">
              <div className="mobile-status-dot" />
              <span className="mobile-status-text">SYSTEM ACTIVE</span>
            </div>
            <h1 className="mobile-title">ADE-ENSAK</h1>
            <p className="mobile-subtitle">Engineering excellence through collaborative innovation</p>
          </div>

          <div className="mobile-central-hub">
            <div className="mobile-countdown-container">
              <div className="mobile-countdown-glow" />
              <div className="mobile-countdown-title">Launch ETA</div>
              <div className="scale-75 origin-center">
                <Countdown variant="engineering" />
              </div>
            </div>

            <div className="mobile-action-grid">
              <Link href="/sos" className="mobile-action-card">
                <div className="card-glow" />
                <div className="mobile-action-icon">🚀</div>
                <div className="mobile-action-title">Request</div>
                <div className="mobile-action-sub">Get Help</div>
              </Link>
              
              <Link href="#featured-courses" className="mobile-action-card">
                <div className="card-glow" />
                <div className="mobile-action-icon">📚</div>
                <div className="mobile-action-title">Explore</div>
                <div className="mobile-action-sub">Courses</div>
              </Link>
              
              <Link href="/dashboard" className="mobile-action-card">
                <div className="card-glow" />
                <div className="mobile-action-icon">⚡</div>
                <div className="mobile-action-title">Dashboard</div>
                <div className="mobile-action-sub">Overview</div>
              </Link>
              
              <Link href="/clubs" className="mobile-action-card">
                <div className="card-glow" />
                <div className="mobile-action-icon">🔧</div>
                <div className="mobile-action-title">Clubs</div>
                <div className="mobile-action-sub">Join Now</div>
              </Link>
            </div>

            <div className="mobile-bottom-stats">
              <div className="mobile-stat">
                <span className="mobile-stat-value">24</span>
                <span className="mobile-stat-label">Active</span>
              </div>
              <div className="mobile-stat">
                <span className="mobile-stat-value">156</span>
                <span className="mobile-stat-label">Students</span>
              </div>
              <div className="mobile-stat">
                <span className="mobile-stat-value">12</span>
                <span className="mobile-stat-label">Projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop content (hidden on mobile) */}
        <div className="desktop-content hidden sm:flex sm:flex-col lg:flex-row sm:items-start lg:items-stretch sm:gap-8 lg:gap-10 xl:gap-14 sm:w-full">
        {/* Left Column */}
        <div className="flex-1 max-w-3xl w-full relative py-12 lg:py-24">
          <div className="absolute -left-10 -top-10 w-40 h-40 rounded-full bg-accent/15 blur-2xl" />
          <div className="absolute left-24 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-accent/25 blur-xl" />
          <div className="floating-badge inline-flex items-center gap-2 rounded-full px-5 py-2 backdrop-blur-md mb-8">
            <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
            <span className="text-[11px] tracking-[0.25em] font-semibold uppercase">Engineering Future</span>
          </div>
          <h1 className="headline-stroke text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-headline font-bold leading-[1.05] tracking-tight fade-reveal">
            <span className="headline-gradient">ADE-ENSAK</span>
            <span className="block mt-4 text-left text-lg sm:text-xl md:text-2xl font-normal text-white/80 max-w-xl">
              Artistry + Engineering: where design logic, collaboration & innovation converge.
            </span>
          </h1>
          <div className="mt-10 flex flex-wrap gap-6 items-center fade-reveal">
            <Button asChild size="lg" className="relative bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-10 py-6 tracking-wide shadow-[0_8px_32px_-10px_hsl(var(--accent)/0.8)] transition-all hover:scale-[1.03] active:scale-95">
              <Link href="/sos">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  Request Help
                </span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="btn-ghost-engineer relative border-2 text-accent hover:bg-accent hover:text-accent-foreground font-semibold rounded-full px-10 py-6 backdrop-blur-md bg-white/5 tracking-wide transition-all hover:scale-[1.04] active:scale-95">
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
            {baseFeatures().map((feature: FeatureItem) => (
              <div key={feature.title} className="group relative rounded-2xl border border-white/30 bg-white/5 backdrop-blur-xl px-4 py-5 overflow-hidden shadow-[0_4px_24px_-8px_rgba(255,255,255,0.35)] hover:border-white/60 transition-colors">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.35),transparent_70%)]" />
                <div className="mb-3 relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out text-white">{feature.icon}</div>
                <p className="text-sm font-semibold tracking-wide feature-title relative z-10">{feature.title}</p>
                <p className="text-[11px] feature-sub relative z-10">{feature.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Panel */}
        <div className="w-full lg:w-[460px] relative lg:py-24 fade-reveal">
          <div className="relative rounded-[2rem] border border-accent/40 bg-white/[0.06] backdrop-blur-2xl shadow-[0_12px_60px_-18px_rgba(0,0,0,0.55)] overflow-hidden px-0 py-0 panel-grid">
            <div className="scanlines" />
            <div className="absolute inset-0 panel-border opacity-30 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10">
              {highlights && highlights.length > 0 ? (
                <div className="relative">
                  {/* Header strip to mimic original frame heading */}
                  <div className="px-8 pt-8 pb-3">
                    <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-accent/80">Highlights</p>
                    <h2 className="text-2xl font-headline font-semibold bg-gradient-to-r from-accent to-white/80 bg-clip-text text-transparent">From the Community</h2>
                  </div>
                  <div className="px-6 pb-8">
                    <Carousel opts={{ align: 'start', loop: true }} plugins={[Autoplay({ delay: 3500, stopOnInteraction: false })]} wheelGestures className="relative">
                      <CarouselContent>
                        {highlights.map((h) => (
                          <CarouselItem key={h.id}>
                            <div className="relative h-[320px] rounded-xl overflow-hidden border border-white/20 bg-white/5">
                              {/* Background image */}
                              {h.image ? (
                                <img src={h.image} alt={h.title || 'Highlight'} className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-accent/20 to-transparent" />
                              )}
                              {/* Overlays for creative transparency */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                              <div className="absolute inset-0 backdrop-blur-[1px]" />
                              {/* Title pill */}
                              <div className="absolute bottom-4 left-4 right-4">
                                <div className="inline-flex items-center max-w-full px-4 py-2 rounded-xl bg-white/12 border border-white/25 shadow-[0_6px_26px_-10px_rgba(255,255,255,0.55)] backdrop-blur-md">
                                  <span className="block truncate text-white font-semibold tracking-wide">
                                    {h.title || 'Untitled Highlight'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="-left-3 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 hover:bg-white/30" />
                      <CarouselNext className="-right-3 top-1/2 -translate-y-1/2 bg-white/20 border-white/30 hover:bg-white/30" />
                    </Carousel>
                  </div>
                </div>
              ) : (
                // Fallback to previous static content if no highlights
                <div className="relative z-10 space-y-8 px-8 py-10">
                  <div className="text-left space-y-3">
                    <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-accent/80">Upcoming Milestone</p>
                    <h2 className="text-2xl font-headline font-semibold bg-gradient-to-r from-accent to-white/80 bg-clip-text text-transparent">Launch Countdown</h2>
                    <p className="text-sm text-gray-300 leading-relaxed">Refining knowledge flow, peer mentorship & automated intelligence to elevate engineering journeys.</p>
                  </div>
                  <Countdown variant="engineering" />
                  <div className="pt-4 grid gap-4 text-left">
                    {baseStats.map((stat: StatItem) => (
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
              )}
            </div>
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-accent/20 blur-[90px]" />
            <div className="absolute bottom-6 right-6 w-10 h-10 rounded-lg border border-accent/40 flex items-center justify-center text-accent/80 text-[10px] tracking-wide font-mono bg-white/5 backdrop-blur-md">v1.0</div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
