'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { useClubs } from '@/lib/clubs-context';
import Image from "next/image";
import { createPortal } from 'react-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { courseSchema, type CourseDoc, slugify } from '@/types/firestore-content';
import { usePathname } from 'next/navigation'; // added for route-aware background

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'ADE', href: '/board' }, 
  { label: 'Events', href: '#' },
  { label: 'News', href: '#' },
  { label: 'Courses', href: '#' },
  { label: 'Contact', href: '/sos' },
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

  const [coursesOpen, setCoursesOpen] = useState(false);
  const coursesRef = useRef<HTMLDivElement | null>(null);
  const coursesButtonRef = useRef<HTMLButtonElement | null>(null);
  const coursesPanelRef = useRef<HTMLDivElement | null>(null);
  const [coursePos, setCoursePos] = useState<{left:number; top:number; width:number; height:number} | null>(null);
  const lastCoursesHoverInsideRef = useRef<number>(0);

  const [courses, setCourses] = useState<CourseDoc[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Deduplicate to prevent duplicate key warnings (in case Firestore returns duplicates or context duplication)
  const dedupedClubs = useMemo(() => {
    const seen = new Set<string>();
    return clubs.filter(cl => {
      const k = cl.id || (cl as any).slug || cl.name;
      if (!k) return true; // keep if no key basis
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [clubs]);
  const dedupedCourses = useMemo(() => {
    const seen = new Set<string>();
    return courses.filter(c => {
      const k = c.id || (c as any).slug || c.title || '';
      if (!k) return true;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [courses]);

  const pathname = usePathname();

  // Hide header for specific routes
  const hideOnPrefixes = ['/dashboard', '/login'];
  const hideHeader = hideOnPrefixes.some(p => pathname.startsWith(p));

  const sidePanelRef = useRef<HTMLDivElement | null>(null); // ref for mobile side panel
  const scrollLockRef = useRef<{ y: number } | null>(null);

  // NEW: mobile accordion expansion state (separate from desktop hover / open state)
  const [mobileClubsExpanded, setMobileClubsExpanded] = useState(false);
  const [mobileCoursesExpanded, setMobileCoursesExpanded] = useState(false);

  // Configure which routes start transparent (require scroll to show background)
  // and which should always have a solid/glassy background immediately.
  const transparentAtTopPrefixes = ['/'];
  const alwaysSolidPrefixes = ['/sos', '/dashboard', '/login','/board'];
  // Helper match (prefix based)
  const matches = (path: string, list: string[]) => list.some(p => (p === '/' ? path === '/' : path.startsWith(p)));
  const startsTransparent = matches(pathname, transparentAtTopPrefixes) && !matches(pathname, alwaysSolidPrefixes);
  const showBackground = !startsTransparent || scrolled; // show immediately if not a transparent route, else only after scroll

  // Debug log
  useEffect(() => { if (process.env.NODE_ENV !== 'production') console.log('[Header] clubs from context', clubs); }, [clubs]);
  useEffect(() => { if (process.env.NODE_ENV !== 'production') console.log('[Header] courses state', { count: courses.length }); }, [courses]);

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
    if (process.env.NODE_ENV === 'production') return;
    console.log('[Header] coursesOpen changed ->', coursesOpen, 'courseCount(state)=', courses.length);
  }, [coursesOpen, courses]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      const y = window.scrollY;
      scrollLockRef.current = { y };
      // Lock body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${y}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      // Reset internal panel scroll to top after mount frame
      requestAnimationFrame(() => { sidePanelRef.current?.scrollTo(0, 0); });
    } else {
      // Restore scroll
      if (scrollLockRef.current) {
        const y = scrollLockRef.current.y;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        window.scrollTo(0, y);
        scrollLockRef.current = null;
      }
      // Collapse accordions when menu fully closes
      setMobileClubsExpanded(false);
      setMobileCoursesExpanded(false);
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

  // Load courses once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'courses'));
        if (cancelled) return;
        const list: CourseDoc[] = [];
        snap.forEach(docSnap => {
          const raw: any = { id: docSnap.id, ...docSnap.data() };
          if (!raw.slug) raw.slug = slugify(raw.title, docSnap.id);
            const parsed = courseSchema.safeParse(raw);
            if (parsed.success) list.push(parsed.data as CourseDoc);
        });
        list.sort((a,b) => (a.title||'').localeCompare(b.title||''));
        setCourses(list);
      } finally {
        if (!cancelled) setCoursesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Outside click for both dropdowns
  useEffect(() => {
    if (!clubsOpen && !coursesOpen) return;
    const handleClick = (e: MouseEvent) => {
      const t = e.target as Node;
      const insideClubs = (clubsRef.current && clubsRef.current.contains(t)) || (clubsPanelRef.current && clubsPanelRef.current.contains(t));
      const insideCourses = (coursesRef.current && coursesRef.current.contains(t)) || (coursesPanelRef.current && coursesPanelRef.current.contains(t));
      if (insideClubs || insideCourses) return;
      setClubsOpen(false); setCoursesOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setClubsOpen(false); setCoursesOpen(false); } };
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('mousedown', handleClick); window.removeEventListener('keydown', handleKey); };
  }, [clubsOpen, coursesOpen]);

  // Hover grace for clubs (existing) & courses (new)
  useEffect(() => {
    if (!coursesOpen) return;
    const GRACE_MS = 160;
    const handleMove = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside = (coursesRef.current && coursesRef.current.contains(target)) || (coursesPanelRef.current && coursesPanelRef.current.contains(target));
      if (inside) { lastCoursesHoverInsideRef.current = Date.now(); return; }
      if (Date.now() - lastCoursesHoverInsideRef.current > GRACE_MS) setCoursesOpen(false);
    };
    document.addEventListener('mousemove', handleMove);
    lastCoursesHoverInsideRef.current = Date.now();
    return () => document.removeEventListener('mousemove', handleMove);
  }, [coursesOpen]);

  // Recalculate positions
  useEffect(() => {
    if (!coursesOpen) return;
    const calc = () => {
      if (!coursesButtonRef.current) return;
      const r = coursesButtonRef.current.getBoundingClientRect();
      setCoursePos({ left: r.left, top: r.top, width: r.width, height: r.height });
    };
    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('scroll', calc, { passive: true });
    return () => { window.removeEventListener('resize', calc); window.removeEventListener('scroll', calc); };
  }, [coursesOpen]);

  if (hideHeader) return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[160] transition-all duration-500 ease-out overflow-x-hidden',
        showBackground
          ? 'bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/10'
          : 'bg-transparent'
      )}
      data-transparent-header={startsTransparent && !scrolled ? 'true' : 'false'}
      data-path={pathname}
    >
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500',
        showBackground && 'opacity-100'
      )} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105">
            <div className="relative">
               <Image
                    src="/ddelogo.svg"
                    alt="DDE Logo"
                    width={60}
                    height={60}
                    className="transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
                  />
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
              ADE-ENSAK
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
                              {!clubsLoading && dedupedClubs.length === 0 && (
                                <li role="none" className="px-3 py-2 text-xs text-white/60">No clubs yet.</li>
                              )}
                              {dedupedClubs.map((c,i) => (
                                <li key={`${c.id || c.slug || c.name}-${i}`} role="none">
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
              if (link.label === 'Courses') {
                return (
                  <div key="courses-wrapper" className="relative" ref={coursesRef}>
                    <button
                      ref={coursesButtonRef}
                      id="courses-button"
                      onClick={() => setCoursesOpen(o => !o)}
                      onMouseEnter={() => setCoursesOpen(true)}
                      onFocus={() => setCoursesOpen(true)}
                      aria-haspopup="true"
                      aria-expanded={coursesOpen}
                      className={cn(
                        'relative font-medium transition-all duration-300 text-primary-foreground/90 hover:text-accent flex items-center gap-1 px-4 py-2 rounded-full backdrop-blur-sm',
                        'before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-0 before:bg-gradient-to-r before:from-accent before:to-primary-foreground before:transition-all before:duration-300 hover:before:w-full',
                        coursesOpen && 'text-accent'
                      )}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span>Courses</span>
                      <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', coursesOpen && 'rotate-180')} />
                      <span className="sr-only">Toggle courses menu</span>
                    </button>
                    {mounted && coursesOpen && coursePos && typeof window !== 'undefined' && createPortal(
                      (() => {
                        const GAP = 8;
                        const MIN_WIDTH = 220;
                        const MAX_WIDTH = 360;
                        const viewportWidth = window.innerWidth;
                        let panelWidth = Math.min(Math.max(coursePos.width, MIN_WIDTH), MAX_WIDTH);
                        let left = coursePos.left;
                        if (left + panelWidth > viewportWidth - 8) left = Math.max(8, viewportWidth - 8 - panelWidth);
                        if (left < 8) left = 8;
                        const top = coursePos.top + coursePos.height + GAP;
                        return (
                          <div
                            id="courses-dropdown-panel"
                            aria-labelledby="courses-button"
                            ref={coursesPanelRef}
                            onMouseLeave={() => setCoursesOpen(false)}
                            role="menu"
                            aria-orientation="vertical"
                            className={cn(
                              'hidden lg:flex fixed z-[999] flex-col rounded-lg border border-white/15 ring-1 ring-white/10',
                              'bg-neutral-800/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.06)_100%)] backdrop-blur-xl',
                              'shadow-xl shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95 py-1',
                              'max-h-[60vh] overflow-y-auto min-w-[220px]'
                            )}
                            style={{ top, left, width: panelWidth }}
                          >
                            <ul className="flex flex-col gap-0" role="none">
                              {coursesLoading && (
                                <li role="none" className="px-3 py-2 text-xs text-white/60">Loading…</li>
                              )}
                              {!coursesLoading && dedupedCourses.length === 0 && (
                                <li role="none" className="px-3 py-2 text-xs text-white/60">No courses.</li>
                              )}
                              {dedupedCourses.map((c) => (
                                <li key={`${c.id || c.slug || c.title}` } role="none">
                                  <Link
                                    data-course-item
                                    role="menuitem"
                                    tabIndex={0}
                                    href={`/courses/${c.slug}`}
                                    className={cn(
                                      'block w-full px-3 py-2 text-sm font-medium rounded-sm',
                                      'text-white/85 hover:text-white focus:text-white/100',
                                      'hover:bg-white/15 focus:bg-white/20 active:bg-white/25',
                                      'transition-colors duration-150 outline-none'
                                    )}
                                    onClick={()=> setCoursesOpen(false)}
                                  >
                                    {c.title || 'Untitled'}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-1 border-t border-white/10" />
                            <div className="px-3 py-1.5">
                              <Link
                                href="/courses/cp1-foundations" // example deep link; adjust if needed
                                role="menuitem"
                                className="text-xs font-medium text-white/70 hover:text-white hover:underline transition-colors"
                                onClick={() => setCoursesOpen(false)}
                              >
                                Explore featured →
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

      {/* Mobile overlay & side panel moved to portal to avoid clipping / stacking issues */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <div
          aria-hidden={!mobileMenuOpen}
          className={cn(
            'fixed inset-0 z-[999] lg:hidden transition-opacity duration-400',
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
        >
          {/* Backdrop */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-black/70 backdrop-blur-md transition-opacity duration-500'
              )}
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Side Panel */}
            <div
              ref={sidePanelRef}
              className={cn(
                'fixed top-0 left-0 h-full w-[82%] max-w-sm flex flex-col',
                'bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar/90 backdrop-blur-xl',
                'border-r border-accent/20 shadow-2xl shadow-black/30',
                'before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent/5 before:via-transparent before:to-accent/10',
                'translate-x-0 transition-transform duration-500 ease-out',
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                'overflow-y-auto overscroll-contain will-change-transform'
              )}
            >
              {/* Header Row */}
              <div className="flex justify-between items-center p-6 border-b border-white/10 shrink-0">
                <Link href="/" className="group flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                  <div className="relative">
                     <Image
                    src="/ddelogo.svg"
                    alt="DDE Logo"
                    width={60}
                    height={60}
                    className="transition-all duration-300 group-hover:rotate-12 group-hover:scale-110"
                       />
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

              {/* Scrollable Content */}
              <div className="p-6 space-y-5 pb-28">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link, i) => {
                    if (link.label === 'Events') {
                      return (
                        <div key="mobile-clubs" className="rounded-xl">
                          <button
                            type="button"
                            aria-expanded={mobileClubsExpanded}
                            aria-controls="mobile-clubs-panel"
                            onClick={() => setMobileClubsExpanded(o => !o)}
                            className={cn(
                              'w-full group relative text-left text-lg font-semibold flex items-center justify-between gap-3',
                              'text-primary-foreground/85 hover:text-accent transition-all duration-300 py-3 px-4 rounded-xl',
                              'hover:bg-gradient-to-r hover:from-accent/10 hover:to-transparent border border-transparent hover:border-accent/20'
                            )}
                            style={{ animationDelay: `${i * 60}ms` }}
                          >
                            <span className="relative z-10 ml-1">Clubs</span>
                            <ChevronDown className={cn('h-5 w-5 transition-transform duration-300', mobileClubsExpanded && 'rotate-180')} />
                          </button>
                          <div
                            id="mobile-clubs-panel"
                            className={cn(
                              'grid transition-all duration-500 ease-in-out',
                              mobileClubsExpanded ? 'grid-rows-[1fr] opacity-100 pointer-events-auto' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                            )}
                          >
                            <div className="overflow-hidden pl-5 pr-2 pb-3 relative z-10">
                              <ul className="flex flex-col gap-1" role="menu" aria-label="Clubs submenu">
                                {clubsLoading && (
                                  <li className="text-sm text-white/60 py-1" role="none">Loading…</li>
                                )}
                                {!clubsLoading && dedupedClubs.length === 0 && (
                                  <li className="text-sm text-white/60 py-1" role="none">No clubs yet.</li>
                                )}
                                {dedupedClubs.map(c => (
                                  <li key={`${c.id || c.slug || c.name}` } role="none">
                                    <Link
                                      role="menuitem"
                                      tabIndex={mobileClubsExpanded ? 0 : -1}
                                      href={`/clubs/${c.slug}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className={cn(
                                        'block text-sm px-3 py-2 rounded-lg outline-none',
                                        'text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/15 focus:text-white',
                                        'transition-colors'
                                      )}
                                    >
                                      {c.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-2 pl-1">
                                <Link
                                  href="#student-clubs"
                                  tabIndex={mobileClubsExpanded ? 0 : -1}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="text-xs font-medium text-accent hover:underline focus:outline-none focus:ring-1 focus:ring-accent/60 rounded"
                                >
                                  View all clubs →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    if (link.label === 'Courses') {
                      return (
                        <div key="mobile-courses" className="rounded-xl">
                          <button
                            type="button"
                            aria-expanded={mobileCoursesExpanded}
                            aria-controls="mobile-courses-panel"
                            onClick={() => setMobileCoursesExpanded(o => !o)}
                            className={cn(
                              'w-full group relative text-left text-lg font-semibold flex items-center justify-between gap-3',
                              'text-primary-foreground/85 hover:text-accent transition-all duration-300 py-3 px-4 rounded-xl',
                              'hover:bg-gradient-to-r hover:from-accent/10 hover:to-transparent border border-transparent hover:border-accent/20'
                            )}
                            style={{ animationDelay: `${i * 60}ms` }}
                          >
                            <span className="relative z-10 ml-1">Courses</span>
                            <ChevronDown className={cn('h-5 w-5 transition-transform duration-300', mobileCoursesExpanded && 'rotate-180')} />
                          </button>
                          <div
                            id="mobile-courses-panel"
                            className={cn(
                              'grid transition-all duration-500 ease-in-out',
                              mobileCoursesExpanded ? 'grid-rows-[1fr] opacity-100 pointer-events-auto' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                            )}
                          >
                            <div className="overflow-hidden pl-5 pr-2 pb-3 relative z-10">
                              <ul className="flex flex-col gap-1" role="menu" aria-label="Courses submenu">
                                {coursesLoading && (
                                  <li className="text-sm text-white/60 py-1" role="none">Loading…</li>
                                )}
                                {!coursesLoading && dedupedCourses.length === 0 && (
                                  <li className="text-sm text-white/60 py-1" role="none">No courses.</li>
                                )}
                                {dedupedCourses.map(c => (
                                  <li key={`${c.id || c.slug || c.title}` } role="none">
                                    <Link
                                      role="menuitem"
                                      tabIndex={mobileCoursesExpanded ? 0 : -1}
                                      href={`/courses/${c.slug}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className={cn(
                                        'block text-sm px-3 py-2 rounded-lg outline-none',
                                        'text-white/80 hover:text-white hover:bg-white/10 focus:bg-white/15 focus:text-white',
                                        'transition-colors'
                                      )}
                                    >
                                      {c.title || 'Untitled'}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-2 pl-1">
                                <Link
                                  href="/courses/cp1-foundations"
                                  tabIndex={mobileCoursesExpanded ? 0 : -1}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="text-xs font-medium text-accent hover:underline focus:outline-none focus:ring-1 focus:ring-accent/60 rounded"
                                >
                                  Explore featured →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'group relative text-lg font-semibold text-primary-foreground/85 hover:text-accent',
                          'transition-all duration-300 py-3 px-4 rounded-xl',
                          'hover:bg-gradient-to-r hover:from-accent/10 hover:to-transparent',
                          'border border-transparent hover:border-accent/20',
                          'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-0',
                          'before:bg-gradient-to-b before:from-accent before:to-accent/50 before:rounded-full',
                          'before:transition-all before:duration-300 hover:before:h-8'
                        )}
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <span className="relative z-10 ml-1">{link.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="pt-4">
                  <Button
                    asChild
                    className={cn(
                      'w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent',
                      'text-accent-foreground font-bold text-base shadow-xl shadow-accent/30',
                      'border border-accent/20 hover:border-accent/40 transition-all duration-300',
                      'hover:scale-105 active:scale-95 relative overflow-hidden',
                      'before:absolute before:inset-0 before:bg-white/10 before:translate-x-[-100%]',
                      'before:transition-transform before:duration-500 hover:before:translate-x-0'
                    )}
                  >
                    <Link href="/sos" onClick={() => setMobileMenuOpen(false)} className="relative z-10">
                      Request Help
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
        </div>,
        document.body
      )}
    </header>
  );
}
