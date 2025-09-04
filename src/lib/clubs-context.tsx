"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { collection, where, limit as fsLimit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCollectionData } from '@/hooks/use-collection-data';
import { clubs as staticClubs } from '@/lib/clubs';

interface ClubLite {
  id: string;
  name: string;
  slug: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  members?: number;
  gradient?: string;
}

interface ClubsContextValue {
  clubs: ClubLite[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  attempts: number;
}

const ClubsContext = createContext<ClubsContextValue | null>(null);

// Provider fetches published clubs once (realtime) and shares across header + sections.
export function ClubsProvider({ children, limit = 64 }: { children: React.ReactNode; limit?: number }) {
  // Optimistic static fallback mapped to minimal shape (unique ids via slug)
  const optimistic = useRef<ClubLite[]>(
    staticClubs.map(c => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
      category: c.category,
      members: c.members,
      gradient: c.gradient,
      description: c.shortDescription || ''
    }))
  );

  const buildQuery = () => {
    const baseCol = collection(db, 'clubs');
    return query(baseCol, where('published', '==', true), fsLimit(limit));
  };

  const { data, loading, error, reload, attempts } = useCollectionData<ClubLite>({
    query: buildQuery,
    enableRealtime: true,
    retryAttempts: 3,
    parser: (raw: any) => {
      if (!raw.name || !raw.slug) return null;
      return {
        id: raw.id,
        name: raw.name,
        slug: raw.slug,
        category: raw.category,
        description: raw.description || raw.shortDescription || '',
        shortDescription: raw.shortDescription,
        members: raw.members,
        gradient: raw.gradient,
      } as ClubLite;
    }
  });

  const sorted = useMemo(() => {
    // Keep optimistic fallback until we have at least one Firestore club.
    const arr = data.length > 0 ? data : optimistic.current;
    return [...arr].sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const value: ClubsContextValue = {
    clubs: sorted,
    loading,
    error,
    reload,
    attempts
  };

  return <ClubsContext.Provider value={value}>{children}</ClubsContext.Provider>;
}

export function useClubs() {
  const ctx = useContext(ClubsContext);
  if (!ctx) throw new Error('useClubs must be used within ClubsProvider');
  return ctx;
}
