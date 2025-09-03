'use client';
import React from 'react';
import { useCountdown } from './use-countdown';

export type CountdownVariant = 'engineering' | 'cute' | 'signature' | 'orbital';

interface CountdownProps { target?: string | Date; variant?: CountdownVariant; className?: string; labelFormat?: {days?:string;hours?:string;minutes?:string;seconds?:string}; }

const baseLabels={days:'Days',hours:'Hours',minutes:'Min',seconds:'Sec'};

export const Countdown: React.FC<CountdownProps> = ({ target='2024-09-01T00:00:00', variant='engineering', className='', labelFormat }) => {
  const t = useCountdown(target);
  const labels = { ...baseLabels, ...labelFormat };
  const cells:[{k:keyof typeof labels;v:number}] = [
    {k:'days',v:t.days},
    {k:'hours',v:t.hours},
    {k:'minutes',v:t.minutes},
    {k:'seconds',v:t.seconds},
  ] as any;

  if(variant==='cute') {
    return (
      <div className={`relative mx-auto w-full max-w-md ${className}`} data-variant={variant}>
        <style jsx>{`@media (prefers-reduced-motion: reduce){ .animate-[pulse_7s_ease-in-out_infinite] { animation:none !important; } }`}</style>
        <div className="flex items-stretch justify-between gap-3">
          {cells.map(c=> (
            <div key={c.k} className="relative group flex-1">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-accent/18 via-accent/10 to-transparent border border-accent/30 backdrop-blur-xl p-3 shadow-[0_6px_18px_-6px_hsl(var(--accent)/0.55)] transition-all duration-400 group-hover:from-accent/28 group-hover:shadow-[0_8px_26px_-8px_hsl(var(--accent)/0.7)]">
                <span className="text-[1.9rem] leading-none font-headline font-bold tracking-tight bg-gradient-to-b from-accent to-white/85 bg-clip-text text-transparent drop-shadow-sm">{String(c.v).padStart(2,'0')}</span>
                <span className="mt-1 text-[10px] tracking-[0.25em] uppercase text-gray-200/80 font-medium">{labels[c.k]}</span>
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen bg-[radial-gradient(circle_at_60%_25%,hsl(var(--accent)/0.65),transparent_70%)]" />
            </div>
          ))}
        </div>
        <div className="absolute -inset-[2px] rounded-3xl border border-accent/40 opacity-40 animate-[pulse_7s_ease-in-out_infinite]" />
      </div>
    );
  }

  const cellBase = (inner:React.ReactNode,label:string,key:string) => (
    <div key={key} className="relative group">
      <div className="rounded-xl border border-accent/40 bg-gradient-to-br from-accent/15 to-transparent backdrop-blur-md px-3 py-4 flex flex-col items-center shadow-[0_4px_18px_-6px_hsl(var(--accent)/0.4)] transition-all duration-300 group-hover:border-accent/70">
        {inner}
        <span className="text-[10px] tracking-[0.15em] uppercase text-gray-300/90 mt-1">{label}</span>
      </div>
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen pointer-events-none bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent)/0.7),transparent_70%)]" />
    </div>
  );

  if(variant==='signature' || variant==='orbital') {
    return (
      <div className={`relative inline-flex gap-2 ${className}`} data-variant={variant}>
        <style jsx>{`@media (prefers-reduced-motion: reduce){ .animate-[pulse_9s_ease-in-out_infinite] { animation:none !important; } }`}</style>
        {cells.map(c => (
          <div key={c.k} className="group relative">
            <div className="w-16 h-20 rounded-2xl border border-accent/35 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent backdrop-blur-xl flex flex-col items-center justify-center shadow-[0_6px_26px_-8px_hsl(var(--accent)/0.6)] overflow-hidden">
              <span className="text-3xl font-headline font-bold bg-gradient-to-b from-accent to-white/85 bg-clip-text text-transparent tracking-tight">{String(c.v).padStart(2,'0')}</span>
              <span className="mt-1 text-[10px] tracking-[0.3em] text-gray-300/85">{labels[c.k]}</span>
            </div>
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen bg-[radial-gradient(circle_at_60%_25%,hsl(var(--accent)/0.7),transparent_70%)]" />
          </div>
        ))}
        <div className="pointer-events-none absolute -inset-2 rounded-[26px] border border-accent/30 animate-[pulse_9s_ease-in-out_infinite]" />
      </div>
    );
  }

  // engineering default
  return (
    <div className={`relative ${className}`} data-variant={variant}>
      <style jsx>{`@media (prefers-reduced-motion: reduce){ .animate-[pulse_8s_ease-in-out_infinite] { animation:none !important; } }`}</style>
      <div className="grid grid-cols-4 gap-3">
        {cells.map(c => cellBase(
          <span className="text-3xl font-headline font-bold tracking-tight bg-gradient-to-b from-accent to-white/80 bg-clip-text text-transparent">{String(c.v).padStart(2,'0')}</span>,
          labels[c.k],
          c.k
        ))}
      </div>
      <div className="absolute -inset-[2px] rounded-2xl border border-accent/30 pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
    </div>
  );
};

export default Countdown;
