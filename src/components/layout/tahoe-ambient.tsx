"use client";
import { useEffect, useRef } from 'react';
import clsx from 'clsx';

/**
 * TahoeAmbient
 * A lightweight atmospheric wrapper inspired by Apple "glass / depth" aesthetic.
 * - Retains existing color tokens (accent / primary / background)
 * - Adds multilayer gradients, subtle grid, animated accent glows & noise
 * - Parallax response to pointer / device tilt for depth
 */
export function TahoeAmbient({
  children,
  className,
  disableParallax = false,
}: {
  children: React.ReactNode;
  className?: string;
  disableParallax?: boolean;
}) {
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableParallax) return;
    const layer = layerRef.current;
    if (!layer) return;

    const handleMove = (e: PointerEvent | DeviceOrientationEvent) => {
      let x = 0;
      let y = 0;
      if (e instanceof PointerEvent) {
        const { innerWidth, innerHeight } = window;
        x = (e.clientX / innerWidth - 0.5) * 18; // max tilt deg
        y = (e.clientY / innerHeight - 0.5) * 18;
      } else {
        // basic gyro support
        if (typeof e.beta === 'number' && typeof e.gamma === 'number') {
          x = (e.gamma / 45) * 18;
          y = (e.beta / 45) * 18;
        }
      }
      layer.style.setProperty('--tx', `${x}`);
      layer.style.setProperty('--ty', `${y}`);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('deviceorientation', handleMove);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('deviceorientation', handleMove);
    };
  }, [disableParallax]);

  return (
    <div className={clsx('relative w-full', className)}>
      {/* Backdrop gradient field */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.22),transparent_55%),radial-gradient(circle_at_80%_70%,hsl(var(--primary)/0.18),transparent_60%),linear-gradient(to_bottom,hsl(var(--background)),hsl(var(--background)))]" />
        {/* Soft edge vignette for focus */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,hsl(var(--background)))] mix-blend-multiply" />
      </div>

      {/* Thin grid overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)] opacity-[0.18]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.15)_1px,transparent_1px)] bg-[size:90px_90px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.07)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.07)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      {/* Accent luminous blobs (parallax) */}
      <div
        ref={layerRef}
        className="pointer-events-none absolute inset-0 -z-10 [transform:perspective(1200px)_rotateX(calc(var(--ty)*1deg))_rotateY(calc(var(--tx)*-1deg))] transition-transform duration-300 will-change-transform"
      >
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-accent/25 blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-accent/20 blur-[90px] animation-delay-300 animate-pulse" />
        <div className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[140px]" />
      </div>

      {/* Grain / noise */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30 mix-blend-overlay" aria-hidden>
        <div className="h-full w-full" style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,rgba(255,255,255,0.03)_0,rgba(255,255,255,0.03)_1px,transparent_1px,transparent_2px),repeating-linear-gradient(90deg,rgba(255,255,255,0.025)_0,rgba(255,255,255,0.025)_1px,transparent_1px,transparent_2px)',
          maskImage: 'radial-gradient(circle at center, black 60%, transparent 100%)'
        }} />
      </div>

      {/* Frosted glass overlay for contained width (optional) */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
