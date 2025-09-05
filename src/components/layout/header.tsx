'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { useClubs } from '@/lib/clubs-context';
import { createPortal } from 'react-dom';

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'About Us', href: '#' },
  { label: 'Events', href: '#' },
  { label: 'News', href: '#' },
  { label: 'Contact', href: '#' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clubsOpen, setClubsOpen] = useState(false);
  const { clubs, loading: clubsLoading } = useClubs();
  const clubsRef = useRef<HTMLDivElement | null>(null);
  const clubsButtonRef = useRef<HTMLButtonElement | null>(null);
  const clubsPanelRef = useRef<HTMLDivElement | null>(null);
  const [clubPos, setClubPos] = useState<{left:number; top:number; width:number; height:number} | null>(null);
  const [mounted, setMounted] = useState(false);
  const lastHoverInsideRef = useRef<number>(0);

  // Debug log
  useEffect(() => { if (process.env.NODE_ENV !== 'production') console.log('[Header] clubs from context', clubs); }, [clubs]);

  // Log dropdown open/close + DOM reconciliation
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    console.log('[Header] clubsOpen changed ->', clubsOpen, 'clubCount(state)=', clubs.length);
    if (clubsOpen) {
      requestAnimationFrame(() => {
        const domItems = clubsPanelRef.current?.querySelectorAll('[data-club-item]')?.length || 0;
        console.log('[Header] dropdown DOM items count', domItems);
      });
    }
  }, [clubsOpen, clubs]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!clubsOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      // Treat clicks inside either the trigger wrapper or the portal panel as inside
      if (
        (clubsRef.current && clubsRef.current.contains(target)) ||
        (clubsPanelRef.current && clubsPanelRef.current.contains(target))
      ) {
        return; // do not close; allow Link onClick to run
      }
      setClubsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setClubsOpen(false); clubsButtonRef.current?.focus(); }
    };
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [clubsOpen]);

  useEffect(() => {
    if (!clubsOpen) return;
    const GRACE_MS = 160; // allow brief travel between button and panel
    const handleMove = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = (
        (clubsRef.current && clubsRef.current.contains(target)) ||
        (clubsPanelRef.current && clubsPanelRef.current.contains(target))
      );
      if (inside) {
        lastHoverInsideRef.current = Date.now();
        return;
      }
      // outside both; close only if beyond grace period
      if (Date.now() - lastHoverInsideRef.current > GRACE_MS) {
        setClubsOpen(false);
      }
    };
    document.addEventListener('mousemove', handleMove);
    // initialize timestamp so quick exit after open still gets grace
    lastHoverInsideRef.current = Date.now();
    return () => document.removeEventListener('mousemove', handleMove);
  }, [clubsOpen]);

  useEffect(()=>{ setMounted(true); },[]);

  // Recalculate button position when dropdown opens / window resizes / scrolls
  useEffect(()=>{
    if(!clubsOpen) return;
    const calc = () => {
      if(!clubsButtonRef.current) return;
      const rect = clubsButtonRef.current.getBoundingClientRect();
      // Store viewport-based rect (no scrollY for fixed positioning)
      setClubPos({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
    };
    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('scroll', calc, { passive:true });
    return ()=>{ window.removeEventListener('resize', calc); window.removeEventListener('scroll', calc); };
  },[clubsOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[160] transition-all duration-500 ease-out overflow-x-hidden',
        scrolled 
          ? 'bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/10' 
          : 'bg-transparent'
      )}
    >
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500',
        scrolled && 'opacity-100'
      )} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105">
            <div className="relative">
              <Logo className="text-accent transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span
              className={cn(
                'text-xl font-bold font-headline text-primary-foreground relative',
                'bg-gradient-to-r from-primary-foreground via-accent to-primary-foreground bg-clip-text gradient-shift',
                'group-hover:bg-gradient-to-r group-hover:from-accent group-hover:via-primary-foreground group-hover:to-accent',
                'transition-all duration-300'
              )}
            >
              SOSADE
              <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-accent to-primary-foreground transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => {
              if (link.label === 'Events') {
                return (
                  <div key="clubs-wrapper" className="relative" ref={clubsRef}>
                    <button
                      ref={clubsButtonRef}
                      id="clubs-button"
                      onClick={() => setClubsOpen(o => !o)}
                      onMouseEnter={() => setClubsOpen(true)}
                      onFocus={() => setClubsOpen(true)}
                      aria-haspopup="true"
                      aria-expanded={clubsOpen}
                      className={cn(
                        'relative font-medium transition-all duration-300 text-primary-foreground/90 hover:text-accent flex items-center gap-1 px-4 py-2 rounded-full backdrop-blur-sm',
                        'before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-0 before:bg-gradient-to-r before:from-accent before:to-primary-foreground before:transition-all before:duration-300 hover:before:w-full',
                        clubsOpen && 'text-accent'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span>Clubs</span>
                      <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', clubsOpen && 'rotate-180')} />
                      <span className="sr-only">Toggle clubs menu</span>
                    </button>
                    {/* Portal rendered dropdown (desktop) */}
                    {mounted && clubsOpen && clubPos && typeof window !== 'undefined' && createPortal(
                      (()=>{ // IIFE to compute layout values cleanly
                        const GAP = 8; // space between trigger and panel
                        const MIN_WIDTH = 200;
                        const MAX_WIDTH = 320;
                        const viewportWidth = window.innerWidth;
                        let panelWidth = Math.min(Math.max(clubPos.width, MIN_WIDTH), MAX_WIDTH);
                        let left = clubPos.left; // left align under trigger
                        // Clamp if overflowing right edge
                        if (left + panelWidth > viewportWidth - 8) left = Math.max(8, viewportWidth - 8 - panelWidth);
                        if (left < 8) left = 8;
                        const top = clubPos.top + clubPos.height + GAP; // directly under trigger
                        return (
                          <div
                            id="clubs-dropdown-panel"
                            aria-labelledby="clubs-button"
                            ref={clubsPanelRef}
                            onMouseLeave={() => setClubsOpen(false)}
                            role="menu"
                            aria-orientation="vertical"
                            className={cn(
                              // Updated glassy grey styling
                              'hidden lg:flex fixed z-[999] flex-col rounded-lg border border-white/15 ring-1 ring-white/10',
                              'bg-neutral-800/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.05)_100%)] backdrop-blur-xl',
                              'shadow-xl shadow-black/30 overflow-hidden',
                              // Animation + sizing
                              'animate-in fade-in-0 zoom-in-95',
                              'py-1 max-h-[60vh] overflow-y-auto min-w-[200px]' 
                            )}
                            style={{ top, left, width: panelWidth }}
                          >
                            <ul className="flex flex-col gap-0" role="none">
                              {clubsLoading && (
                                <li role="none" className="px-3 py-2 text-xs text-white/60">Loading…</li>
                              )}
                              {!clubsLoading && clubs.length === 0 && (
                                <li role="none" className="px-3 py-2 text-xs text-white/60">No clubs yet.</li>
                              )}
                              {clubs.map((c,i) => (
                                <li key={c.id} role="none">
                                  <Link
                                    data-club-item
                                    role="menuitem"
                                    tabIndex={0}
                                    href={`/clubs/${c.slug}`}
                                    className={cn(
                                      // Glass menu item style
                                      'block w-full px-3 py-2 text-sm font-medium rounded-sm',
                                      'text-white/85 hover:text-white focus:text-white/100',
                                      'hover:bg-white/15 focus:bg-white/20 active:bg-white/25',
                                      'transition-colors duration-150 outline-none'
                                    )}
                                    onClick={()=> setClubsOpen(false)}
                                  >
                                    {c.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-1 border-t border-white/10" />
                            <div className="px-3 py-1.5">
                              <Link
                                href="#student-clubs"
                                role="menuitem"
                                className="text-xs font-medium text-white/70 hover:text-white hover:underline transition-colors"
                                onClick={()=> setClubsOpen(false)}
                              >
                                View all clubs →
                              </Link>
                            </div>
                          </div>
                        );
                      })(),
                      document.body
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'relative font-medium transition-all duration-300 text-primary-foreground/90 hover:text-accent',
                    'before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-0 before:bg-gradient-to-r before:from-accent before:to-primary-foreground',
                    'before:transition-all before:duration-300 hover:before:w-full',
                    'after:absolute after:inset-0 after:bg-accent/10 after:rounded-full after:scale-0 after:opacity-0',
                    'after:transition-all after:duration-300 hover:after:scale-100 hover:after:opacity-100',
                    'px-4 py-2 rounded-full backdrop-blur-sm'
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Button 
              asChild 
              className={cn(
                'hidden sm:flex bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground',
                'shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300',
                'border border-accent/20 hover:border-accent/40 backdrop-blur-sm',
                'before:absolute before:inset-0 before:bg-white/10 before:rounded-lg before:opacity-0 before:transition-opacity before:duration-300',
                'hover:before:opacity-100 relative overflow-hidden'
              )}
            >
              <Link href="/sos" className="relative z-10 font-semibold">
                Request Help
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'lg:hidden text-primary-foreground hover:bg-white/10 relative overflow-hidden',
                'border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300',
                'hover:scale-105 active:scale-95'
              )}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6 transition-transform duration-300 hover:rotate-180" />
              <span className="sr-only">Open menu</span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'fixed inset-0 z-[100] bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-md lg:hidden transition-all duration-500',
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={cn(
            'fixed top-0 left-0 h-full w-4/5 max-w-sm transition-all duration-500 ease-out',
            'bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar/90 backdrop-blur-xl',
            'border-r border-accent/20 shadow-2xl shadow-black/30',
            'before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent/5 before:via-transparent before:to-accent/10',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <Logo className="text-accent transition-all duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold font-headline text-primary-foreground bg-gradient-to-r from-primary-foreground to-accent bg-clip-text">
                SOSADE
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-primary-foreground hover:bg-white/10 transition-all duration-300',
                'border border-white/10 hover:border-white/20 backdrop-blur-sm',
                'hover:rotate-90 hover:scale-110'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          
          <nav className="flex flex-col p-6 space-y-2">
            <div className="border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setClubsOpen(o => !o)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 text-left text-lg font-semibold',
                  'text-primary-foreground/80 hover:text-accent transition-colors'
                )}
                aria-expanded={clubsOpen}
              >
                <span className="flex items-center gap-2"><span className="ml-1">Clubs</span></span>
                <ChevronDown className={cn('h-5 w-5 transition-transform', clubsOpen && 'rotate-180')} />
              </button>
              <div className={cn('grid grid-cols-1 gap-1 px-4 pb-4 transition-all duration-300', clubsOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden')}>
                {clubsLoading && <div className="text-xs text-muted-foreground py-2">Loading…</div>}
                {clubs.map(c => (
                  <Link
                    key={c.id}
                    href={`/clubs/${c.slug}`}
                    onClick={() => { setMobileMenuOpen(false); setClubsOpen(false); }}
                    className="text-sm px-2 py-2 rounded-md hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
                {!clubsLoading && clubs.length === 0 && <div className="text-xs text-muted-foreground py-2">No clubs yet.</div>}
                <Link
                  href="#student-clubs"
                  onClick={() => { setMobileMenuOpen(false); setClubsOpen(false); }}
                  className="text-xs text-accent mt-2 hover:underline"
                >
                  View all →
                </Link>
              </div>
            </div>
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'group relative text-xl font-semibold text-primary-foreground/80 hover:text-accent',
                  'transition-all duration-300 py-3 px-4 rounded-xl',
                  'hover:bg-gradient-to-r hover:from-accent/10 hover:to-transparent',
                  'border border-transparent hover:border-accent/20',
                  'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-0',
                  'before:bg-gradient-to-b before:from-accent before:to-accent/50 before:rounded-full',
                  'before:transition-all before:duration-300 hover:before:h-8',
                  'animate-fade-in-up'
                )}
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10 ml-2">{link.label}</span>
              </Link>
            ))}
          </nav>
          
          <div className="absolute bottom-6 left-6 right-6">
            <Button 
              asChild 
              className={cn(
                'w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent',
                'text-accent-foreground font-bold text-lg shadow-xl shadow-accent/30',
                'border border-accent/20 hover:border-accent/40 transition-all duration-300',
                'hover:scale-105 active:scale-95 relative overflow-hidden',
                'before:absolute before:inset-0 before:bg-white/10 before:translate-x-[-100%]',
                'before:transition-transform before:duration-500 hover:before:translate-x-0'
              )}
            >
              <Link href="/sos" className="relative z-10">
                Request Help
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
