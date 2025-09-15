'use client';

import * as React from 'react'
import { Bot, Cpu, HeartHandshake, Users, Zap, Code, Palette } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
// Removed direct Firestore + schema imports; rely on shared ClubsProvider
// import { db } from '@/lib/firebase;
// import { collection, limit, orderBy, query, where } from 'firebase/firestore';
// import { clubSchema, translateFirestoreError, sleep, ClubDoc } from '@/types/firestore-content';
// import { useCollectionData } from '@/hooks/use-collection-data';
import { useClubs } from '@/lib/clubs-context';

// Heuristic icon selection (until icons optionally stored in Firestore)
const pickIcon = (category?: string, slug?: string) => {
  const c = (category || '').toLowerCase();
  const s = (slug || '').toLowerCase();
  if (c.includes('robot') || s.includes('robot')) return Bot;
  if (c.includes('electronic') || s.includes('electronic')) return Cpu;
  if (c.includes('human') || c.includes('impact') || c.includes('social')) return HeartHandshake;
  if (c.includes('ai') || c.includes('ml') || s.includes('ai')) return Zap;
  if (c.includes('design') || c.includes('creative') || s.includes('design')) return Palette;
  if (c.includes('hardware') || s.includes('hardware')) return Code;
  return Users; // fallback generic
};

// Interface no longer required (context supplies shape) but keep minimal for local typing if needed
// interface FSClub { id: string; name: string; slug: string; description?: string; shortDescription?: string; members?: number; category?: string; gradient?: string; }

interface StudentClubsProps {
  enableRealtime?: boolean; // kept for API compatibility (unused now)
  featuredOnly?: boolean;   // if needed later can filter client-side
  limitCount?: number;      // if needed later can slice client-side
  retryAttempts?: number;   // unused (context handles its own retries)
}

export function StudentClubs({ enableRealtime = true, featuredOnly = false, limitCount = 16 }: StudentClubsProps) {
  const plugin = React.useRef(
    Autoplay({ 
      delay: 4000, 
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    })
  );

  // Unified data source (same as Header)
  const { clubs: contextClubs, loading, error, reload, attempts } = useClubs();

  // Optional client-side filtering / limiting (mirrors older props semantics)
  const filtered = React.useMemo(() => {
    let list = contextClubs;
    if (featuredOnly) list = list.filter(c => (c as any).featured === true);
    if (limitCount && list.length > limitCount) list = list.slice(0, limitCount);
    return list;
  }, [contextClubs, featuredOnly, limitCount]);

  // Already sorted in provider, but ensure deterministic if future provider changes
  const sortedClubs = React.useMemo(() => [...filtered].sort((a,b)=>a.name.localeCompare(b.name)), [filtered]);

  const skeletonItems = React.useMemo(()=>Array.from({ length: 6 }), []);

  // Total members aggregate (approx) for banner
  const totalMembers = React.useMemo(() => {
    if (!sortedClubs.length) return '—';
    const sum = sortedClubs.reduce((a, c: any) => a + (c.members || 0), 0);
    return sum > 0 ? `${sum}+` : '—';
  }, [sortedClubs]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[StudentClubs][context] clubs len', contextClubs.length, contextClubs.map(c=>c.name));
      console.debug('[StudentClubs][derived] sorted len', sortedClubs.length, sortedClubs.map(c=>c.name));
    }
  }, [contextClubs, sortedClubs]);

  return (
    <section id="student-clubs" className="w-full py-20 relative overflow-hidden" aria-busy={loading} aria-live="polite">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/5 w-72 h-72 bg-gradient-to-r from-accent/15 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-gradient-to-l from-accent/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-accent/8 via-transparent to-transparent rounded-full animate-pulse delay-500" />
      </div>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-accent/12 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/40 pointer-events-none" />
      
      {/* Community connection lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1000 800" aria-hidden="true">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M100,200 Q300,100 500,200 T900,200" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="text-accent animate-pulse" />
          <path d="M150,400 Q350,300 550,400 T850,400" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="text-accent animate-pulse delay-1000" />
          <path d="M200,600 Q400,500 600,600 T800,600" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="text-accent animate-pulse delay-2000" />
        </svg>
      </div>
      
      <div className="relative z-10 mb-16 text-center">
        <div className="inline-block group">
          <h2 className="text-3xl md:text-5xl font-headline font-bold bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent gradient-shift">
            Find Your Community
          </h2>
          <div className="mt-3 h-1 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Connect with like-minded peers in our vibrant student clubs. Build lasting friendships, develop skills, and make an impact together.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
            <Users className="w-4 h-4 text-accent" />
            <span>{totalMembers} Active Members Across All Clubs</span>
          </div>
          {error && (
            <div className="flex flex-col items-center gap-2" role="alert">
              <p className="text-destructive text-xs">{error} (attempts: {attempts})</p>
              <Button variant="outline" size="sm" onClick={() => reload()} disabled={loading} aria-label="Retry loading clubs">Retry</Button>
            </div>
          )}
        </div>
      </div>

      <Carousel opts={{ align: 'start', loop: true, skipSnaps: false, dragFree: true }} plugins={[plugin.current]} className="w-full group/carousel">
        <CarouselContent className="-ml-2 md:-ml-4">
          {(loading ? skeletonItems : sortedClubs).map((raw: any, index: number) => {
            const isSkeleton = loading;
            const club = raw || {};
            const Icon = isSkeleton ? Users : pickIcon(club.category, club.slug);
            const name = isSkeleton ? 'Loading…' : club.name;
            const desc = isSkeleton ? 'Fetching club details…' : (club.description || '');
            const gradient = isSkeleton ? 'from-accent to-accent/60' : (club.gradient || 'from-accent to-accent/70');
            const members = isSkeleton ? '—' : (club.members ? (club.members >= 100 ? `${club.members}+` : club.members.toString()) : '');
            const slug = isSkeleton ? '#' : club.slug;
            const hasLogo = !isSkeleton && club.logoUrl;
            return (
              <CarouselItem key={isSkeleton ? index : club.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
                <Link href={isSkeleton ? '#' : `/clubs/${slug}`} className="block h-full" aria-disabled={isSkeleton}>
                  <Card className={`h-full w-full overflow-hidden group/card cursor-pointer transform transition-all duration-500 ${isSkeleton ? 'opacity-70' : 'hover:scale-105 hover:-translate-y-3'} relative`}>
                    <div className="absolute inset-0 opacity-5 group-hover/card:opacity-10 transition-opacity duration-500"><div className={`w-full h-full bg-gradient-to-br ${gradient}`} /></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/90 backdrop-blur-xl" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover/card:opacity-10 transition-opacity duration-500`} />
                    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`} style={{ padding: '2px' }}>
                      <div className="w-full h-full bg-background rounded-lg" />
                    </div>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center relative z-10 h-full">
                      <div className="absolute top-4 right-4 bg-accent/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-accent font-medium border border-accent/20">{isSkeleton ? '—' : club.category}</div>
                      {hasLogo ? (
                        <div className="relative mb-6 w-24 h-24 rounded-full overflow-hidden ring-2 ring-accent/20 shadow-lg group-hover/card:ring-accent/40 transition-all duration-500">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={club.logoUrl} alt={`${club.name} logo`} className="object-cover w-full h-full" />
                          <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-transparent to-background/40" />
                        </div>
                      ) : (
                        <div className={`relative p-6 rounded-full mb-6 bg-gradient-to-br ${gradient} shadow-lg group-hover/card:shadow-xl transition-all duration-500 ${isSkeleton ? '' : 'group-hover/card:scale-110'}`}>
                          <div className="absolute inset-0 bg-white/20 rounded-full backdrop-blur-sm" />
                          <Icon className={`h-12 w-12 text-white relative z-10 ${isSkeleton ? 'animate-pulse' : 'group-hover/card:rotate-12 transition-transform duration-500'}`} />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/60 rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-300 animate-pulse" />
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-300 delay-100 animate-pulse" />
                        </div>
                      )}
                      <h3 className="text-xl font-headline font-semibold mb-3 group-hover/card:text-accent transition-colors duration-300 relative">{name}<div className={`absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r ${gradient} group-hover/card:w-full transition-all duration-500`} /></h3>
                      <p className="text-muted-foreground leading-relaxed mb-4 group-hover/card:text-foreground/80 transition-colors duration-300 line-clamp-4">{desc}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground/70 mb-4"><Users className="w-4 h-4 text-accent" /><span>{members} {members && 'Members'}</span></div>
                      <Button variant="ghost" size="sm" disabled={isSkeleton} className={`group/button relative overflow-hidden border border-transparent hover:border-accent/20 transition-all duration-300 bg-gradient-to-r ${gradient} bg-clip-text text-transparent hover:text-white`}>
                        <span className="relative z-10 font-medium">{isSkeleton ? 'Loading' : 'View Club'}</span>
                        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} translate-y-full group-hover/button:translate-y-0 transition-transform duration-300`} />
                      </Button>
                    </CardContent>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                  </Card>
                </Link>
              </CarouselItem>
            );
          })}
          {!loading && !error && sortedClubs.length === 0 && (
            <div className="p-8 text-center w-full">
              <p className="text-muted-foreground">No clubs available yet. Check back soon.</p>
            </div>
          )}
        </CarouselContent>
      </Carousel>

      {/* Call to action section */}
      <div className="mt-16 text-center relative z-10">
        <div className="inline-block group">
          <Button size="lg" className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 border border-accent/20 hover:border-accent/40 backdrop-blur-sm relative overflow-hidden">
            <span className="relative z-10 font-semibold">Explore All Clubs</span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground/70">Can't find what you're looking for? Start your own club!</p>
      </div>
    </section>
  );
}
