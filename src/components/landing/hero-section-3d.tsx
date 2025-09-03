'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Countdown } from './countdown';
import { baseFeatures, extendedStats, FeatureItem, StatItem } from './hero-data';

/* 3D Hero Variant: "Orbital Knowledge Core" */
export function HeroSection3D(){
  const ref=useRef<HTMLDivElement|null>(null);
  const [p,setP]=useState({x:0,y:0});
  useEffect(()=>{const h=(e:PointerEvent)=>{if(!ref.current)return;const r=ref.current.getBoundingClientRect();const cx=r.left+r.width/2;const cy=r.top+r.height/2;setP({x:(e.clientX-cx)/r.width,y:(e.clientY-cy)/r.height});};window.addEventListener('pointermove',h,{passive:true});return()=>window.removeEventListener('pointermove',h);},[]);
  return (
    <section ref={ref} className="relative w-full h-[95dvh] min-h-[760px] overflow-hidden flex items-center justify-center bg-primary text-white">
      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,hsl(var(--accent)/0.38),transparent_60%),radial-gradient(circle_at_75%_70%,hsl(var(--accent)/0.30),transparent_55%),linear-gradient(130deg,hsl(var(--primary)/0.95)_0%,hsl(var(--primary)/0.5)_55%,hsl(var(--primary)/0.9)_100%)]" />
        <div className="absolute inset-0 opacity-[0.22] mix-blend-screen [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.18)_0px,rgba(255,255,255,0.18)_1px,transparent_1px,transparent_80px),repeating-linear-gradient(90deg,rgba(255,255,255,0.18)_0px,rgba(255,255,255,0.18)_1px,transparent_1px,transparent_80px)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,hsl(var(--accent)/0.5)_1px,transparent_0)] bg-[size:26px_26px]" />
        {/* Large ambient blobs */}
        {[0,1,2].map(i=> <div key={i} className="absolute w-[45rem] h-[45rem] rounded-full blur-[110px] opacity-40" style={{top:i===0?'-18%':i===1?'55%':'20%',left:i===0?'-10%':i===1?'50%':'75%',background:'radial-gradient(circle at 30% 30%, hsl(var(--accent)/0.6), transparent 65%)',animation:`blob${i} 28s ease-in-out infinite`,animationDelay:`${i*5}s`}} />)}
      </div>

      {/* PARALLAX ORBITAL RINGS + TOKENS */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({length:6}).map((_,i)=>{const depth=i+1;const tx=p.x*depth*14;const ty=p.y*depth*14;return (
          <div key={i} className="absolute left-1/2 top-1/2" style={{transform:`translate(-50%,-50%) translate3d(${tx}px,${ty}px,0)`}}>
            <div className="relative w-[420px] h-[420px] flex items-center justify-center" style={{animation:`spin${i%2?'R':'F'} ${(40-depth*3)}s linear infinite`}}>
              <div className="absolute inset-0 rounded-full border border-accent/25" style={{filter:'drop-shadow(0 0 12px hsl(var(--accent)/0.25))',transform:`scale(${0.35+depth*0.1}) rotate(${depth*12}deg)`}} />
              {Array.from({length:depth+3}).map((__,k)=> <span key={k} className="absolute w-3 h-3 rounded-full bg-accent shadow-[0_0_0_4px_hsl(var(--accent)/0.15)]" style={{transform:`rotate(${(360/(depth+3))*k}deg) translateY(-${70+depth*24}px)`}} />)}
            </div>
          </div> );})}
      </div>

      {/* 3D CORE CONTAINER */}
      <div className="relative z-10 w-full max-w-[1550px] px-6 lg:px-14 flex flex-col xl:flex-row items-center gap-24">
        <style jsx>{`
          @media (prefers-reduced-motion: reduce) { [class*='blob'], [class*='spin'], .rise span, .panel { animation: none !important; } }
          @keyframes blob0 {0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(8%,6%,0) scale(1.12);}}
          @keyframes blob1 {0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(-6%,-4%,0) scale(.9);}}
            @keyframes blob2 {0%,100%{transform:translate3d(0,0,0) scale(1);}50%{transform:translate3d(-4%,5%,0) scale(1.07);}}
          @keyframes spinF {to{transform:rotate(360deg);}} @keyframes spinR {to{transform:rotate(-360deg);}}
          .rise span {display:inline-block; opacity:0; transform:translateY(34px) scale(.9); animation:word 1s ease forwards;} .rise span:nth-child(odd){animation-delay:.05s} .rise span:nth-child(even){animation-delay:.18s}
          @keyframes word {to{opacity:1;transform:translateY(0) scale(1);}}
          .headlineGrad{background:linear-gradient(95deg,#fff 0%,hsl(var(--accent)) 55%,hsl(var(--accent)/0.55) 100%);-webkit-background-clip:text;color:transparent;}
          .glass{position:relative;}
          .glass:before{content:'';position:absolute;inset:0;background:linear-gradient(140deg,hsl(var(--accent)/0.55),transparent 60%);mix-blend-overlay;opacity:.4;}
          .panelStack{transform-style:preserve-3d;perspective:1600px;}
          .panel{--d:0; position:absolute; inset:0; border-radius:2rem; backdrop-filter:blur(22px); background:linear-gradient(160deg,hsl(var(--accent)/0.18),hsl(var(--accent)/0.04)); border:1px solid hsl(var(--accent)/0.35); box-shadow:0 10px 40px -12px hsl(var(--accent)/0.55); transform:translate3d(0,0,calc(var(--d)*-85px)) scale(calc(1 - (var(--d)*0.04))) rotateX(calc(var(--d)*6deg)) rotateY(calc(var(--d)*-5deg)); animation:floatPanel 10s ease-in-out infinite;}
          .panel:nth-child(2){--d:1; animation-delay:3s}
          .panel:nth-child(3){--d:2; animation-delay:6s}
          @keyframes floatPanel{0%,100%{transform:translate3d(0,0,calc(var(--d)*-85px)) scale(calc(1 - (var(--d)*0.04))) rotateX(calc(var(--d)*6deg)) rotateY(calc(var(--d)*-5deg));}50%{transform:translate3d(0,-14px,calc(var(--d)*-85px)) scale(calc(1 - (var(--d)*0.04))) rotateX(calc(var(--d)*6deg + 4deg)) rotateY(calc(var(--d)*-5deg + 5deg));}}
          .dataRow{display:flex;justify-content:space-between;font-size:11px;letter-spacing:.15em;}
        `}</style>

        {/* LEFT: Narrative & Actions */}
        <div className="flex-1 relative">
          <div className="absolute -left-10 -top-10 w-52 h-52 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute left-28 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-accent/30 blur-2xl" />
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 border border-accent/40 px-6 py-2 backdrop-blur-md mb-10 shadow-[0_4px_20px_-6px_hsl(var(--accent)/0.55)]">
            <span className="h-2.5 w-2.5 rounded-full bg-accent animate-ping" />
            <span className="text-[11px] tracking-[0.3em] font-semibold text-accent uppercase">Orbital Stack</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-headline font-bold leading-[1.04] tracking-tight rise headlineGrad">
            {Array.from('SOS-ADE').map((c,i)=><span key={i}>{c}</span>)}
          </h1>
          <p className="mt-7 text-lg sm:text-xl md:text-2xl max-w-xl text-white/80 font-normal">
            A 3D orbital knowledge core where playful engineering, semantic systems & collaborative energy fuse.
          </p>
          <div className="mt-10 flex flex-wrap gap-6 items-center">
            <Button asChild size="lg" className="relative bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-10 py-6 tracking-wide shadow-[0_8px_32px_-10px_hsl(var(--accent)/0.85)] transition-all hover:scale-[1.05] active:scale-95">
              <Link href="#"><span className="flex items-center gap-2"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>Request Help</span></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="relative border-2 border-accent/60 text-accent hover:bg-accent hover:text-accent-foreground font-semibold rounded-full px-10 py-6 backdrop-blur-md bg-white/5 tracking-wide transition-all hover:scale-[1.06] active:scale-95">
              <Link href="#featured-courses"><span className="flex items-center gap-2"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>Explore Courses</span></Link>
            </Button>
          </div>
          <div className="mt-14 flex flex-wrap gap-10 items-start">
            <div className="flex flex-col gap-5">
              <Countdown variant="orbital" />
              <p className="text-[11px] tracking-[0.35em] uppercase text-accent/70 font-medium ml-1">T‑Minus</p>
            </div>
            <div className="grid grid-cols-3 gap-5 max-w-sm">
              {baseFeatures().map((card:FeatureItem)=> <div key={card.title} className="group relative rounded-2xl border border-accent/30 bg-white/5 backdrop-blur-xl px-4 py-5 overflow-hidden shadow-[0_4px_26px_-10px_rgba(0,0,0,0.55)] hover:border-accent/60 transition-colors">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_68%_28%,hsl(var(--accent)/0.4),transparent_70%)]" />
                <div className="mb-2 relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out">{card.icon}</div>
                <p className="text-[11px] font-semibold tracking-wide text-accent relative z-10">{card.title}</p>
                <p className="text-[10px] text-gray-300 relative z-10">{card.sub}</p>
              </div>)}
            </div>
          </div>
        </div>

        {/* RIGHT: 3D Glass Panel Stack */}
        <div className="w-full max-w-md xl:max-w-lg relative panelStack" style={{transform:`rotateX(${p.y*10}deg) rotateY(${p.x*-12}deg)`}}>
          <div className="panel" />
          <div className="panel flex flex-col justify-between p-10 gap-10">
            <div className="space-y-4">
              <p className="text-[11px] font-medium tracking-[0.35em] uppercase text-accent/80">Knowledge Core</p>
              <h2 className="text-2xl font-headline font-semibold bg-gradient-to-r from-accent to-white/80 bg-clip-text text-transparent">Evolution Metrics</h2>
              <p className="text-sm text-gray-300 leading-relaxed max-w-sm">Adaptive graphs, intent inference & generative collaboration driving fluid learning architecture.</p>
            </div>
            <div className="flex flex-col gap-6">
              <Countdown variant="orbital" />
              <div className="grid gap-4 pt-2">
                {extendedStats.map((row:StatItem)=> <div key={row.k} className="dataRow text-accent/90"><span className="text-gray-300/80">{row.k}</span><span className="font-semibold text-accent">{row.v}</span></div>)}
              </div>
              <div>
                <p className="text-[11px] tracking-[0.3em] uppercase text-accent/70 mb-3">Blueprint Notes</p>
                <div className="rounded-xl border border-accent/25 bg-accent/10 px-5 py-5 text-[12px] leading-relaxed text-gray-100/95 shadow-inner">
                  Orchestrating semantic routing, micro‑build sprints & curiosity‑driven iteration loops.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] tracking-widest uppercase text-accent/70">
              <span>v1.0</span>
              <span className="h-px flex-1 bg-gradient-to-r from-accent/60 to-transparent" />
              <span>LIVE</span>
            </div>
          </div>
          <div className="panel" />
        </div>
      </div>
    </section>
  );
}

export default HeroSection3D;
