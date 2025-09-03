'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy imports for non-default variants
const HeroCute = dynamic(()=>import('./hero-section-cute').then(m=>m.HeroSectionCute),{ssr:false,loading:()=><div className='h-[60vh] flex items-center justify-center text-accent'>Loading cute…</div>});
const HeroSignature = dynamic(()=>import('./hero-section-signature').then(m=>m.HeroSectionSignature),{ssr:false,loading:()=><div className='h-[60vh] flex items-center justify-center text-accent'>Loading signature…</div>});
const Hero3D = dynamic(()=>import('./hero-section-3d').then(m=>m.HeroSection3D),{ssr:false,loading:()=><div className='h-[60vh] flex items-center justify-center text-accent'>Loading orbital…</div>});
const HeroEngineering = dynamic(()=>import('./hero-section').then(m=>m.HeroSection),{ssr:false});

export type HeroVariant = 'engineering' | 'cute' | 'signature' | 'orbital';

interface HeroSwitcherProps { defaultVariant?: HeroVariant; allowUserSwitch?: boolean; className?: string; }

const variantMeta: Record<HeroVariant,{ label:string; desc:string }> = {
  engineering:{ label:'Artistic Engineering', desc:'Schematic blueprint aesthetics' },
  cute:{ label:'Cute Habitat', desc:'Playful kawaii engineering vibe' },
  signature:{ label:'Neuro‑Blueprint', desc:'Parametric kinetic lattice realm' },
  orbital:{ label:'3D Orbital Core', desc:'Spatial rings & panel stack depth' },
};

export const HeroSwitcher: React.FC<HeroSwitcherProps> = ({ defaultVariant='engineering', allowUserSwitch=true, className='' }) => {
  const [variant,setVariant]=useState<HeroVariant>(defaultVariant);
  // Persist choice in localStorage
  useEffect(()=>{ try { const saved = localStorage.getItem('heroVariant'); if(saved && saved in variantMeta) setVariant(saved as HeroVariant); } catch {} },[]);
  useEffect(()=>{ try { localStorage.setItem('heroVariant', variant); } catch {} },[variant]);

  const renderVariant = () => {
    switch(variant){
      case 'cute': return <HeroCute />;
      case 'signature': return <HeroSignature />;
      case 'orbital': return <Hero3D />;
      default: return <HeroEngineering />;
    }
  };

  return (
    <div className={className}>
      {allowUserSwitch && (
        <div className='absolute z-[60] top-4 right-4 flex flex-col items-end gap-2 text-[11px] font-medium'>
          <div className='px-3 py-1 rounded-full bg-background/70 backdrop-blur border border-accent/30 shadow-sm text-accent tracking-[0.25em] uppercase'>Hero Mode</div>
          <div className='flex gap-2 flex-wrap max-w-[320px]'>
            {Object.entries(variantMeta).map(([key,val])=>{
              const active = variant===key;
              return (
                <button key={key} onClick={()=>setVariant(key as HeroVariant)} className={`relative group px-3 py-2 rounded-xl border text-xs transition-all backdrop-blur-md ${active ? 'bg-accent text-accent-foreground border-accent shadow-[0_0_0_1px_hsl(var(--accent))]' : 'bg-white/5 border-accent/30 text-accent hover:border-accent/60 hover:bg-accent/10'}`}> 
                  <span className='font-semibold'>{val.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {renderVariant()}
    </div>
  );
};

export default HeroSwitcher;
