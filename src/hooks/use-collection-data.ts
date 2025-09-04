import { useEffect, useRef, useState } from 'react';
import { onSnapshot, getDocs, Query, FirestoreError } from 'firebase/firestore';
import { sleep, translateFirestoreError } from '@/types/firestore-content';

export interface UseCollectionDataOptions<T> {
  query: () => Query;
  parser?: (raw: any) => T | null; // return null to skip invalid
  enableRealtime?: boolean;
  retryAttempts?: number;
  onTelemetry?: (e: { phase: string; attempt?: number; error?: any; count?: number; durationMs?: number }) => void;
}

export interface UseCollectionDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  attempts: number; // manual reload attempts
}

export function useCollectionData<T>(opts: UseCollectionDataOptions<T>): UseCollectionDataResult<T> {
  const { query: buildQuery, parser, enableRealtime = true, retryAttempts = 3, onTelemetry } = opts;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0); // counts manual reload triggers, not internal retries
  const reloadFlag = useRef(0);
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
  const lastRealtimeErrorCodeRef = useRef<string | undefined>(undefined);

  const reload = () => { reloadFlag.current++; setAttempts(a => a + 1); };

  useEffect(() => {
    let cancelled = false;
    const q = buildQuery();
    const cleanupRef: { current: (() => void) | null } = { current: null };

    onTelemetry?.({ phase: 'start', attempt: attempts + 1 });
    if (process.env.NODE_ENV !== 'production') console.info('[useCollectionData] start', { attempt: attempts + 1 });

    const handleDocs = (docs: any[]) => {
      const parsed = parser ? docs.map(d => parser({ id: d.id, ...d.data() })).filter(Boolean) as T[] : docs.map(d => ({ id: d.id, ...d.data() }));
      if (!cancelled) setData(parsed);
      onTelemetry?.({ phase: 'loaded', count: parsed.length });
      if (process.env.NODE_ENV !== 'production') console.info('[useCollectionData] loaded', { count: parsed.length });
    };

    const fetchLoop = async () => {
      setLoading(true); setError(null);
      for (let i = 0; i < retryAttempts; i++) {
        const start = performance.now();
        onTelemetry?.({ phase: 'attempt', attempt: i + 1 });
        if (process.env.NODE_ENV !== 'production') console.info('[useCollectionData] attempt', { attempt: i + 1 });
        try {
          const snap = await getDocs(q);
          handleDocs(snap.docs);
          setLoading(false); setError(null);
          onTelemetry?.({ phase: 'success', attempt: i + 1, durationMs: performance.now() - start });
          if (process.env.NODE_ENV !== 'production') console.info('[useCollectionData] success', { attempt: i + 1 });
          return;
        } catch (e: any) {
          const code = (e as FirestoreError)?.code;
          const translated = translateFirestoreError(code, isOffline);
          setError(translated);
          onTelemetry?.({ phase: 'error', attempt: i + 1, error: { code, message: (e as Error)?.message } });
          if (process.env.NODE_ENV !== 'production') {
            console.error('[useCollectionData] error', { attempt: i + 1, code, message: (e as Error)?.message });
          }
          if (code === 'permission-denied') break; // do not retry perms issues
          if (i < retryAttempts - 1) await sleep(300 * Math.pow(2, i));
        }
      }
      setLoading(false);
    };

    if (enableRealtime) {
      // Perform one initial fetch so we get an 'attempt' phase & immediate data/error before realtime subscription.
      (async () => {
        try {
          onTelemetry?.({ phase: 'attempt', attempt: 1 });
          if (process.env.NODE_ENV !== 'production') console.info('[useCollectionData] attempt', { attempt: 1, mode: 'initialRealtimeFetch' });
          const snap = await getDocs(q);
          handleDocs(snap.docs);
          setLoading(false);
          onTelemetry?.({ phase: 'success', attempt: 1 });
          if (process.env.NODE_ENV !== 'production') console.info('[useCollectionData] success', { attempt: 1, mode: 'initialRealtimeFetch' });
        } catch (e: any) {
          const code = (e as FirestoreError)?.code;
          const translated = translateFirestoreError(code, isOffline);
          setError(translated);
          onTelemetry?.({ phase: 'error', attempt: 1, error: { code, message: (e as Error)?.message } });
          if (process.env.NODE_ENV !== 'production') console.error('[useCollectionData] initial realtime fetch error', { code, message: (e as Error)?.message });
        } finally {
          if (!cancelled) setLoading(false);

          // Now attach realtime listener
          const unsub = onSnapshot(q, snap => {
            handleDocs(snap.docs);
            if (!cancelled) setLoading(false);
            if (process.env.NODE_ENV !== 'production') console.info('[useCollectionData] realtime update', { count: snap.docs.length });
          }, (e: any) => {
            const code = (e as FirestoreError)?.code;
            if (lastRealtimeErrorCodeRef.current === code) return; // dedupe
            lastRealtimeErrorCodeRef.current = code;
            const translated = translateFirestoreError(code, isOffline);
            setError(translated);
            onTelemetry?.({ phase: 'error', attempt: attempts + 1, error: { code, message: (e as Error)?.message } });
            if (process.env.NODE_ENV !== 'production') console.error('[useCollectionData] realtime error', { code, message: (e as Error)?.message });
            if (!cancelled) setLoading(false);
          });
          cleanupRef.current = () => { unsub(); };
        }
      })();
    } else {
      fetchLoop();
    }

    return () => { cancelled = true; cleanupRef.current?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadFlag.current, enableRealtime]);

  return { data, loading, error, reload, attempts };
}
