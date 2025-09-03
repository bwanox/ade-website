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
  attempts: number;
}

export function useCollectionData<T>(opts: UseCollectionDataOptions<T>): UseCollectionDataResult<T> {
  const { query: buildQuery, parser, enableRealtime = true, retryAttempts = 3, onTelemetry } = opts;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const reloadFlag = useRef(0);
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  const reload = () => { reloadFlag.current++; setAttempts(a => a + 1); };

  useEffect(() => {
    let cancelled = false;
    const q = buildQuery();

    const handleDocs = (docs: any[]) => {
      const parsed = parser ? docs.map(d => parser({ id: d.id, ...d.data() })).filter(Boolean) as T[] : docs.map(d => ({ id: d.id, ...d.data() }));
      if (!cancelled) setData(parsed);
      onTelemetry?.({ phase: 'loaded', count: parsed.length });
    };

    const fetchLoop = async () => {
      setLoading(true); setError(null);
      for (let i = 0; i < retryAttempts; i++) {
        const start = performance.now();
        try {
          const snap = await getDocs(q);
            handleDocs(snap.docs);
            setLoading(false); setError(null);
            onTelemetry?.({ phase: 'success', attempt: i+1, durationMs: performance.now() - start });
            return;
        } catch (e: any) {
          const code = (e as FirestoreError)?.code;
          const translated = translateFirestoreError(code, isOffline);
          setError(translated);
          onTelemetry?.({ phase: 'error', attempt: i+1, error: e });
          if (code === 'permission-denied') break;
          if (i < retryAttempts - 1) await sleep(300 * Math.pow(2, i));
        }
      }
      setLoading(false);
    };

    if (enableRealtime) {
      setLoading(true); setError(null);
      const unsub = onSnapshot(q, snap => {
        handleDocs(snap.docs);
        setLoading(false);
      }, (e: any) => {
        const code = (e as FirestoreError)?.code;
        setError(translateFirestoreError(code, isOffline));
        setLoading(false);
      });
      return () => { cancelled = true; unsub(); };
    } else {
      fetchLoop();
      return () => { cancelled = true; };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadFlag.current, enableRealtime]);

  return { data, loading, error, reload, attempts };
}
