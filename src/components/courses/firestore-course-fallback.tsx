'use client';

import { useEffect, useState, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, limit as fsLimit, query, where, getDoc, doc } from 'firebase/firestore';
import { courseSchema, slugify } from '@/types/firestore-content';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getDownloadURL, ref } from 'firebase/storage';

interface Props { slug: string; prefetchedCourse?: any; }

export function FirestoreCourseFallback({ slug, prefetchedCourse }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<any | null>(prefetchedCourse || null);
  const [debug, setDebug] = useState<any>(null);

  // Resource viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewer, setViewer] = useState<{
    title: string;
    url: string;
    mime?: string;
    meta?: { raw?: string; isDrive?: boolean; drivePrimary?: string; driveAlt?: string; isProxied?: boolean };
  } | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const viewerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewerAltTriedRef = useRef(false);

  // dev logger for viewer flow
  const vlog = (...args: any[]) => { if (process.env.NODE_ENV !== 'production') console.debug('[Viewer]', ...args); };

  const allowedHosts = new Set([
    'firebasestorage.googleapis.com',
    'storage.googleapis.com',
    'lh3.googleusercontent.com',
    'lh4.googleusercontent.com',
    'lh5.googleusercontent.com',
    'lh6.googleusercontent.com'
  ]);

  // Simple, reliable handling for Google Drive/Docs links: open in new tab instead of embedding
  // Change to 'embed' if you want to try inline preview again
  const DRIVE_PREVIEW_MODE: 'link' | 'embed' = 'link';

  // Generic helpers to normalize any resource (Storage path/URL or external link)
  const isAbsoluteUrl = (val: string) => {
    try { new URL(val); return true; } catch { return false; }
  };
  const basename = (val: string) => val.split('?')[0].split('#')[0].split('/').pop() || 'Resource';

  const asResource = (raw: any, fallbackTitle: string) => {
    if (!raw) return null;
    if (typeof raw === 'string') {
      return { title: basename(raw) || fallbackTitle, url: raw } as { title: string; url?: string; path?: string; mime?: string };
    }
    const url = raw.url || raw.link || undefined;
    const path = raw.path || (!url && raw.storagePath) || undefined;
    const title = raw.title || (url ? basename(url) : (path ? basename(path) : fallbackTitle));
    const mime = raw.mime || raw.contentType || undefined;
    return { title, url, path, mime } as { title: string; url?: string; path?: string; mime?: string };
  };

  // Add: detect/convert Google Drive & Docs public links to embeddable preview URLs
  const getDriveOrDocsEmbedUrl = (url: string): string | null => {
    try {
      const u = new URL(url);
      const host = u.hostname;
      if (host === 'drive.google.com') {
        const fileMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
        const searchId = u.searchParams.get('id');
        const id = fileMatch?.[1] || searchId || null;
        if (id) return `https://drive.google.com/file/d/${id}/preview`;
        if (u.pathname.startsWith('/uc') && searchId) {
          return `https://drive.google.com/uc?export=preview&id=${searchId}`;
        }
      }
      if (host === 'docs.google.com') {
        const m = u.pathname.match(/^\/(document|spreadsheets|presentation)\/d\/([^/]+)/);
        if (m) {
          const type = m[1];
          const id = m[2];
          return `https://docs.google.com/${type}/d/${id}/preview`;
        }
      }
      return null;
    } catch {
      return null;
    }
  };
  // Alternate Drive embed using Google Docs Viewer with a direct download link
  const getDriveAltEmbedUrl = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname !== 'drive.google.com' && u.hostname !== 'docs.google.com') return null;
      // Extract file id from /file/d/{id} or id param
      const fileMatch = u.pathname.match(/\/file\/d\/([^/]+)/);
      const searchId = u.searchParams.get('id');
      const id = fileMatch?.[1] || searchId || null;
      if (!id) return null;
      const direct = `https://drive.google.com/uc?export=download&id=${id}`;
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(direct)}`;
    } catch {
      return null;
    }
  };
  const isDriveOrDocsHost = (host: string) => (host === 'drive.google.com' || host === 'docs.google.com');

  const toProxyUrl = (url: string) => {
    try {
      const u = new URL(url);
      // Only proxy known hosts, otherwise return original (never proxy Google Drive/Docs)
      if (!allowedHosts.has(u.hostname)) return url;
      return `/files?u=${encodeURIComponent(url)}`;
    } catch {
      return url;
    }
  };
  const isStorageHost = (u: URL) => (u.hostname === 'firebasestorage.googleapis.com' || u.hostname === 'storage.googleapis.com');
  const hasDownloadToken = (u: URL) => !!(u.searchParams.get('token'));

  // Resolve any input (Storage path/URL or external link) to a final preview URL
  const resolveFinalUrl = async (rawUrlOrPath: string): Promise<{ url: string; isDrive: boolean; isProxied: boolean }> => {
    vlog('resolveFinalUrl: start', { rawUrlOrPath });
    if (isAbsoluteUrl(rawUrlOrPath)) {
      const original = new URL(rawUrlOrPath);
      const isDrive = isDriveOrDocsHost(original.hostname);
      if (isDrive) {
        const embed = getDriveOrDocsEmbedUrl(rawUrlOrPath);
        vlog('resolveFinalUrl: drive link', { original: original.hostname, embed });
        return { url: embed || rawUrlOrPath, isDrive: true, isProxied: false };
      }
      if (isStorageHost(original) && !hasDownloadToken(original)) {
        try {
          vlog('resolveFinalUrl: abs storage without token -> signing');
          const signed = await getDownloadURL(ref(storage, rawUrlOrPath));
          const prox = toProxyUrl(signed);
          vlog('resolveFinalUrl: signed storage url', { prox });
          return { url: prox, isDrive: false, isProxied: true };
        } catch (e: any) {
          vlog('resolveFinalUrl: sign failed, will try proxy original', e?.message);
          const prox = toProxyUrl(rawUrlOrPath);
          return { url: prox, isDrive: false, isProxied: prox !== rawUrlOrPath };
        }
      }
      const proxied = toProxyUrl(rawUrlOrPath);
      vlog('resolveFinalUrl: other absolute', { proxied });
      return { url: proxied, isDrive: false, isProxied: proxied !== rawUrlOrPath };
    }
    // Treat as Storage path
    try {
      vlog('resolveFinalUrl: storage path -> signing');
      const signed = await getDownloadURL(ref(storage, rawUrlOrPath));
      const prox = toProxyUrl(signed);
      vlog('resolveFinalUrl: signed path', { prox });
      return { url: prox, isDrive: false, isProxied: true };
    } catch (e: any) {
      vlog('resolveFinalUrl: failed to sign storage path', e?.message);
      return { url: rawUrlOrPath, isDrive: false, isProxied: false };
    }
  };

  const guessType = (url?: string, mime?: string) => {
    const m = (mime || '').toLowerCase();
    if (m.includes('pdf')) return 'pdf';
    if (m.startsWith('image/')) return 'image';
    if (m.startsWith('video/')) return 'video';
    if (m.startsWith('audio/')) return 'audio';
    // Add: drive/docs links should render in iframe
    try {
      if (url) {
        const u = new URL(url);
        if (u.hostname === 'drive.google.com' || u.hostname === 'docs.google.com') return 'iframe';
      }
    } catch { /* ignore */ }
    const ext = (url || '').split('?')[0].split('#')[0].split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['png','jpg','jpeg','webp','gif','svg','avif'].includes(ext || '')) return 'image';
    if (['mp4','webm','mov','m4v'].includes(ext || '')) return 'video';
    if (['mp3','wav','ogg'].includes(ext || '')) return 'audio';
    return 'unknown';
  };

  // Backward-compatible openViewer: accepts (title, url, mime) OR (title, resourceObjectOrString)
  const openViewer = async (title: string, urlOrResource?: any, mimeMaybe?: string) => {
    vlog('openViewer: start', { title, urlOrResource, mimeMaybe });
    // Normalize inputs
    const res = asResource(urlOrResource, title);
    let effectiveTitle = title;
    let raw = '' as string;
    let effectiveMime: string | undefined = mimeMaybe;
    if (res) {
      effectiveTitle = res.title || title;
      raw = (res.url || res.path || '') as string;
      effectiveMime = res.mime || mimeMaybe;
    } else if (typeof urlOrResource === 'string') {
      raw = urlOrResource;
    } else {
      raw = typeof urlOrResource === 'undefined' ? '' : String(urlOrResource);
    }
    if (!raw) { vlog('openViewer: no raw'); return; }

    setViewerLoading(true);
    setViewerError(null);
    if (viewerTimeoutRef.current) clearTimeout(viewerTimeoutRef.current);
    viewerTimeoutRef.current = setTimeout(() => { vlog('openViewer: timeout stop spinner'); setViewerLoading(false); }, 8000);

    try {
      const { url: finalUrl, isDrive, isProxied } = await resolveFinalUrl(raw);
      vlog('openViewer: resolved', { finalUrl, isDrive, isProxied });
      const primaryEmbed = isDrive ? (getDriveOrDocsEmbedUrl(raw) || finalUrl) : finalUrl;

      // New: in simple mode, do not embed Drive/Docs; just open in a new tab for reliability
      if (isDrive && DRIVE_PREVIEW_MODE === 'link') {
        if (viewerTimeoutRef.current) { clearTimeout(viewerTimeoutRef.current); viewerTimeoutRef.current = null; }
        setViewerLoading(false);
        try { if (typeof window !== 'undefined') window.open(primaryEmbed, '_blank', 'noopener,noreferrer'); } catch { /* ignore */ }
        return; // Skip dialog/modal entirely
      }

      const altEmbed = isDrive ? getDriveAltEmbedUrl(raw) || undefined : undefined;
      setViewer({ title: effectiveTitle, url: primaryEmbed, mime: effectiveMime, meta: { raw, isDrive, drivePrimary: primaryEmbed, driveAlt: altEmbed, isProxied } });
      setViewerOpen(true);

      if (isProxied && !isDrive) {
        const ac = new AbortController();
        const timeout = setTimeout(() => ac.abort(), 7000);
        vlog('openViewer: preflight HEAD', { finalUrl });
        fetch(finalUrl, { method: 'HEAD', signal: ac.signal })
          .then(async (res) => {
            clearTimeout(timeout);
            vlog('openViewer: preflight result', { ok: res.ok, status: res.status });
            if (!res.ok) {
              if ((res.status === 401 || res.status === 403)) {
                try {
                  vlog('openViewer: unauthorized -> trying to sign again');
                  const isAbs = isAbsoluteUrl(raw);
                  const signed = await getDownloadURL(isAbs ? ref(storage, raw) : ref(storage, raw));
                  const signedProxied = toProxyUrl(signed);
                  setViewer((v) => (v ? { ...v, url: signedProxied } : v));
                  return;
                } catch (e: any) {
                  vlog('openViewer: retry sign failed', e?.message);
                }
              }
              setViewerError(res.status === 401 || res.status === 403 ? 'You are not authorized to view this file.' : 'Failed to load preview.');
              setViewerLoading(false);
            }
          })
          .catch(() => {
            clearTimeout(timeout);
            vlog('openViewer: preflight network error');
            setViewerError('Failed to reach file server.');
            setViewerLoading(false);
          });
      } else if (isDrive) {
        const alt = getDriveAltEmbedUrl(raw);
        vlog('openViewer: drive embed prepared', { alt });
        if (alt) {
          viewerAltTriedRef.current = false;
          setTimeout(() => {
            if (!viewerAltTriedRef.current && viewerOpen && viewerLoading) {
              vlog('openViewer: switching to alternate drive viewer (timeout)');
              viewerAltTriedRef.current = true;
              setViewerLoading(true);
              setViewerError(null);
              setViewer((v) => (v ? { ...v, url: alt, meta: { ...(v.meta || {}), driveAlt: alt } } : v));
            }
          }, 2500);
        }
      }
    } catch (e: any) {
      vlog('openViewer: error', e?.message);
      setViewerError('Failed to open resource.');
      setViewerLoading(false);
    }
  };

  const handleViewerOpenChange = (open: boolean) => {
    vlog('handleViewerOpenChange', { open });
    setViewerOpen(open);
    if (!open) {
      if (viewerTimeoutRef.current) {
        clearTimeout(viewerTimeoutRef.current);
        viewerTimeoutRef.current = null;
      }
      viewerAltTriedRef.current = false;
      setViewer(null);
      setViewerLoading(false);
      setViewerError(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const log = (...args: any[]) => { if (process.env.NODE_ENV !== 'production') console.debug('[FirestoreCourseFallback]', ...args); };
    if (prefetchedCourse) {
      log('Using prefetchedCourse', { slug, id: prefetchedCourse?.id });
      setLoading(false);
      return () => { cancelled = true; };
    }
    (async () => {
      try {
        // Pass 0: treat slug param as Firestore document ID directly
        try {
          if (slug && !slug.includes('/')) {
            const idRef = doc(db, 'courses', slug);
            const idSnap = await getDoc(idRef);
            if (idSnap.exists()) {
              const rawId = { id: idSnap.id, ...idSnap.data() } as any;
              const parsedId = courseSchema.safeParse(rawId);
              if (parsedId.success) {
                setCourse(parsedId.data); setDebug({ phase: 'parsed-doc-id', id: slug }); setLoading(false); return;
              } else {
                log('Doc-id parse failure, falling back to slug/title search', parsedId.error.issues);
              }
            }
          }
        } catch (e: any) {
          log('Doc-id fetch error (ignored, will try slug/title)', e?.message);
        }
        let decoded = slug; try { decoded = decodeURIComponent(slug); } catch { /* ignore */ }
        const normalized = decoded.trim().toLowerCase();
        const attempts: { mode: string; value: string }[] = [];
        const variants = new Set<string>([slug, decoded, normalized, normalized.replace(/\s+/g,'-'), normalized.replace(/[^a-z0-9]+/g,'-')]);
        let found: any | null = null;
        // Pass 1 slug
        for (const v of variants) {
          const val = v.trim().toLowerCase(); if (!val) continue;
            attempts.push({ mode: 'slug', value: val });
            const q = query(collection(db, 'courses'), where('slug', '==', val), fsLimit(1));
            // eslint-disable-next-line no-await-in-loop
            const snap = await getDocs(q);
            log('Attempt slug', val, 'empty?', snap.empty);
            if (!snap.empty) { found = { id: snap.docs[0].id, ...snap.docs[0].data() }; break; }
        }
        // Pass 2 title
        if (!found) {
          for (const v of variants) {
            const titleVal = v.trim(); if (!titleVal) continue;
            attempts.push({ mode: 'title', value: titleVal });
            const q = query(collection(db, 'courses'), where('title', '==', titleVal), fsLimit(1));
            // eslint-disable-next-line no-await-in-loop
            const snap = await getDocs(q);
            log('Attempt title', titleVal, 'empty?', snap.empty);
            if (!snap.empty) { found = { id: snap.docs[0].id, ...snap.docs[0].data() }; break; }
          }
        }
        if (!found) { setCourse(null); setDebug({ phase: 'not-found', attempts }); return; }
        const parsed = courseSchema.safeParse(found);
        if (!parsed.success) {
          const fallback = { id: found.id, title: found.title || 'Untitled Course', slug: found.slug || slugify(found.title, found.id), description: found.description || '', difficulty: found.difficulty || '', duration: found.duration || '', heroImage: found.heroImage || '', year: typeof found.year === 'number' ? found.year : undefined };
          log('Lenient parse used (issues ignored)', parsed.error.issues);
          setCourse(fallback); setDebug({ phase: 'lenient', issues: parsed.error.issues, attempts });
        } else { setCourse(parsed.data); setDebug({ phase: 'parsed', attempts }); }
      } catch (e: any) { setError('Failed to load course'); setDebug({ phase: 'error', message: e?.message }); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [slug, prefetchedCourse]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-pulse text-sm text-muted-foreground">Loading course…</div>
      </div>
    );
  }
  if (error || !course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <h2 className="text-3xl font-headline font-bold">Course Not Found</h2>
        <p className="text-muted-foreground max-w-md">The course you are looking for does not exist or has been removed.</p>
        {debug && process.env.NODE_ENV !== 'production' && (
          <pre className="text-xs text-left max-w-xl overflow-auto p-3 rounded bg-muted/40 border border-border/20">
            {JSON.stringify(debug, null, 2)}
          </pre>
        )}
      </div>
    );
  }
  const hero = course.heroImage && typeof course.heroImage === 'string' && course.heroImage.length > 4
    ? course.heroImage
    : 'https://picsum.photos/1200/600?grayscale&blur=2';
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background" />
        <div className="absolute top-1/3 -left-32 w-[40rem] h-[40rem] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[50rem] h-[50rem] bg-accent/5 rounded-full blur-3xl" />
      </div>
      <section className="relative pt-16 md:pt-24 pb-12">
        <div className="container max-w-5xl mx-auto px-4 space-y-8">
          <div className="space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-medium">
              <span>{course.difficulty || 'Course'}</span>
              {course.year && <span className="text-muted-foreground">• Year {course.year}</span>}
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent gradient-shift">
              {course.title || 'Untitled Course'}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground max-w-prose">
              {course.description || 'Description coming soon.'}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {course.duration && <Badge variant="secondary" className="backdrop-blur border border-accent/20">{course.duration}</Badge>}
            </div>
          </div>
          <div className="relative h-72 md:h-96 rounded-xl overflow-hidden group shadow-2xl">
            <Image fill src={hero} alt={course.title || 'Course image'} className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
          </div>
          {Array.isArray(course.semesters) && course.semesters.length > 0 && (
            <div className="pt-8 md:pt-12">
              <Tabs defaultValue={(course.semesters[0]?.id as string) || 'semester-0'} className="w-full">
                <div className="mb-4 md:mb-6 sticky top-14 md:static z-20 -mx-4 px-4">
                  <TabsList className="w-full max-w-full flex flex-nowrap whitespace-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain bg-background/70 supports-[backdrop-filter]:bg-background/50 backdrop-blur border border-accent/20 p-1 rounded-md snap-x snap-mandatory">
                    {course.semesters.map((sem: any, si: number) => {
                      const semKey = (sem?.id as string) || `semester-${si}`;
                      return (
                        <TabsTrigger key={semKey} value={semKey} asChild className="shrink-0 snap-start">
                          <Button
                            variant="outline"
                            size="lg"
                            className="shrink-0 rounded-lg min-h-[44px] px-4 md:px-5 text-sm md:text-base border-accent/30 hover:border-accent/50 hover:bg-accent/10 transition-colors data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:border-accent data-[state=active]:shadow-md"
                          >
                            {sem?.title || `Semester ${si + 1}`}
                          </Button>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>
                {course.semesters.map((sem: any, si: number) => {
                  const semKey = (sem?.id as string) || `semester-${si}`;
                  return (
                    <TabsContent key={semKey} value={semKey} className="space-y-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {(sem?.modules || []).map((m: any, mi: number) => (
                          <Card key={m?.id || mi} className="group relative overflow-hidden border-accent/20 hover:border-accent/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <CardHeader className="pb-2">
                              <h3 className="font-headline font-semibold tracking-tight text-sm">
                                {m?.title || `Module ${mi + 1}`}
                              </h3>
                              {m?.summary && <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[20rem]">{m.summary}</p>}
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <Accordion type="multiple" className="w-full">
                                <AccordionItem value="lesson">
                                  <AccordionTrigger className="text-sm">Lesson</AccordionTrigger>
                                  <AccordionContent>
                                    {m?.resources?.lesson ? (() => {
                                      const L = asResource(m.resources.lesson, 'Lesson');
                                      const hasLink = !!(L?.url || L?.path);
                                      return (
                                        <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-accent/10">
                                          <div className="flex items-center gap-2 text-xs">
                                            <FileText className="w-3 h-3 text-accent" />
                                            <span>{L?.title || 'Lesson'}</span>
                                            {m.resources.lesson.size && <span className="text-[10px] text-muted-foreground">{m.resources.lesson.size}</span>}
                                          </div>
                                          {hasLink && (
                                            <div className="flex gap-1">
                                              <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => openViewer(L!.title, L!.url || L!.path, L!.mime)}>
                                                View
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })() : <div className="text-[10px] text-muted-foreground">No lesson uploaded</div>}
                                  </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="exercises">
                                  <AccordionTrigger className="text-sm">Exercises ({m?.resources?.exercises?.length || 0})</AccordionTrigger>
                                  <AccordionContent className="space-y-2">
                                    {m?.resources?.exercises?.length ? m.resources.exercises.map((r: any, ei: number) => {
                                      const R = asResource(r, `Exercise ${ei + 1}`);
                                      const hasLink = !!(R?.url || R?.path);
                                      return (
                                        <div key={ei} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-accent/10">
                                          <div className="flex items-center gap-2 text-xs">
                                            <FileText className="w-3 h-3 text-accent" />
                                            <span>{R?.title || `Exercise ${ei + 1}`}</span>
                                          </div>
                                          {hasLink && (
                                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => openViewer(R!.title, R!.url || R!.path, R!.mime)}>
                                              View
                                            </Button>
                                          )}
                                        </div>
                                      );
                                    }) : <div className="text-[10px] text-muted-foreground">No exercises</div>}
                                  </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="exams">
                                  <AccordionTrigger className="text-sm">Past Exams ({m?.resources?.pastExams?.length || 0})</AccordionTrigger>
                                  <AccordionContent className="space-y-2">
                                    {m?.resources?.pastExams?.length ? m.resources.pastExams.map((r: any, pi: number) => {
                                      const R = asResource(r, `Exam ${pi + 1}`);
                                      const hasLink = !!(R?.url || R?.path);
                                      return (
                                        <div key={pi} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-accent/10">
                                          <div className="flex items-center gap-2 text-xs">
                                            <FileText className="w-3 h-3 text-accent" />
                                            <span>{R?.title || `Exam ${pi + 1}`}</span>
                                          </div>
                                          {hasLink && (
                                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => openViewer(R!.title, R!.url || R!.path, R!.mime)}>
                                              View
                                            </Button>
                                          )}
                                        </div>
                                      );
                                    }) : <div className="text-[10px] text-muted-foreground">No exams</div>}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
          )}
          <div className="text-sm text-muted-foreground/70 space-y-3">
            <p>This course was loaded dynamically from Firestore (lenient mode).</p>
            {debug && process.env.NODE_ENV !== 'production' && (
              <details className="text-xs">
                <summary className="cursor-pointer opacity-70 hover:opacity-100">Debug Info</summary>
                <pre className="mt-2 p-3 rounded bg-muted/40 border border-border/20 overflow-auto max-h-64">{JSON.stringify(debug, null, 2)}</pre>
              </details>
            )}
          </div>
        </div>
      </section>

      {/* Resource Viewer Modal */}
      <Dialog open={viewerOpen} onOpenChange={handleViewerOpenChange}>
        <DialogContent className="max-w-5xl w-[96vw] p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-base">{viewer?.title || 'Preview'}</DialogTitle>
            <DialogDescription className="sr-only">
              Resource preview dialog. Press Escape to close or use the close button.
            </DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4">
            {viewer && (() => {
              const t = guessType(viewer.url, viewer.mime);
              const LoadingOverlay = (
                <div className="absolute inset-0 grid place-items-center bg-background/60">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-accent border-r-transparent animate-spin" />
                    <span>Loading preview…</span>
                  </div>
                </div>
              );

              const ErrorInline = viewerError ? (
                <div className="p-4 text-sm text-red-500">
                  {viewerError}
                  {(() => {
                    try {
                      const u = new URL(viewer.url, typeof window !== 'undefined' ? window.location.origin : undefined);
                      if (u.hostname.includes('drive.google.com') || u.hostname.includes('docs.google.com')) {
                        return (
                          <div className="mt-2 text-xs text-muted-foreground">
                            If the Google Drive preview shows a permission or removal message, request access or have the owner set "Anyone with the link". You can also try the alternate viewer below.
                          </div>
                        );
                      }
                      if (u.pathname === '/files') {
                        return (
                          <div className="mt-2 text-xs text-muted-foreground">
                            The Firebase Storage object likely requires auth or a download token. Generate a public download URL or adjust Storage rules.
                          </div>
                        );
                      }
                    } catch { /* ignore */ }
                    return null;
                  })()}
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <a className="underline" href={viewer.url} target="_blank" rel="noreferrer noopener">Open in new tab</a>
                    {(() => {
                      const alt = viewer.meta?.driveAlt || getDriveAltEmbedUrl(viewer.url);
                      if (!alt) return null;
                      return (
                        <button
                          className="underline text-left"
                          onClick={() => {
                            viewerAltTriedRef.current = true;
                            setViewerLoading(true);
                            setViewerError(null);
                            setViewer((v) => (v ? { ...v, url: alt, meta: { ...(v.meta || {}), driveAlt: alt } } : v));
                          }}
                        >
                          Try alternate viewer
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ) : null;

              // Optional: Drive toolbar for quick switching even without explicit errors
              const DriveToolbar = (() => {
                try {
                  if (!viewer?.meta?.isDrive) return null;
                  const u = new URL(viewer.url, typeof window !== 'undefined' ? window.location.origin : undefined);
                  const isAlt = viewer.meta?.driveAlt && viewer.url === viewer.meta.driveAlt;
                  return (
                    <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div>Google Drive/Docs preview</div>
                      <div className="flex items-center gap-3">
                        {viewer.meta?.driveAlt && (
                          <button
                            className="underline"
                            onClick={() => {
                              const nextUrl = isAlt ? (viewer.meta?.drivePrimary || viewer.url) : (viewer.meta?.driveAlt || viewer.url);
                              vlog('DriveToolbar: toggle viewer', { isAlt, nextUrl });
                              viewerAltTriedRef.current = true;
                              setViewerLoading(true);
                              setViewerError(null);
                              setViewer((v) => (v ? { ...v, url: nextUrl } : v));
                            }}
                          >
                            {isAlt ? 'Use Drive preview' : 'Try alternate viewer'}
                          </button>
                        )}
                        <a className="underline" href={viewer.url} target="_blank" rel="noreferrer noopener">Open in new tab</a>
                        {viewer.meta?.raw && (
                          <a className="underline" href={viewer.meta.raw} target="_blank" rel="noreferrer noopener">Open original</a>
                        )}
                      </div>
                    </div>
                  );
                } catch { return null; }
              })();

              // Container ensures we can overlay the loader
              const Container = ({ children }: { children: any }) => (
                <div className="relative w-full">
                  {viewerLoading && LoadingOverlay}
                  {DriveToolbar}
                  {ErrorInline}
                  {!viewerError && children}
                </div>
              );

              if (t === 'pdf') {
                return (
                  <Container>
                    <iframe
                      title={`Preview: ${viewer.title}`}
                      src={`${viewer.url}${viewer.url.includes('#') ? '' : '#view=FitH'}`}
                      className="w-full h-[70vh] rounded"
                      loading="eager"
                      referrerPolicy="no-referrer"
                      onLoad={() => setViewerLoading(false)}
                    />
                  </Container>
                );
              }
              if (t === 'image') {
                return (
                  <Container>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={viewer.url}
                      alt={viewer.title}
                      className="max-w-full max-h-[75vh] w-auto h-auto rounded"
                      onLoad={() => setViewerLoading(false)}
                      onError={() => { setViewerLoading(false); setViewerError('Failed to load image.'); }}
                    />
                  </Container>
                );
              }
              if (t === 'video') {
                return (
                  <Container>
                    <video
                      controls
                      className="w-full max-h-[75vh] rounded bg-black"
                      preload="metadata"
                      onLoadedData={() => setViewerLoading(false)}
                      onError={() => { setViewerLoading(false); setViewerError('Failed to load video.'); }}
                    >
                      <source src={viewer.url} />
                    </video>
                  </Container>
                );
              }
              if (t === 'audio') {
                return (
                  <Container>
                    <audio
                      controls
                      className="w-full"
                      onCanPlay={() => setViewerLoading(false)}
                      onError={() => { setViewerLoading(false); setViewerError('Failed to load audio.'); }}
                    >
                      <source src={viewer.url} />
                    </audio>
                  </Container>
                );
              }
              // Add: iframe rendering for Drive/Docs public links
              if (t === 'iframe') {
                const embedUrl = getDriveOrDocsEmbedUrl(viewer.url) || viewer.url;
                return (
                  <Container>
                    <iframe
                      title={`Preview: ${viewer.title}`}
                      src={embedUrl}
                      className="w-full h-[70vh] rounded"
                      loading="eager"
                      referrerPolicy="no-referrer"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => setViewerLoading(false)}
                    />
                  </Container>
                );
              }

              // Fallback: try iframe for unknown types as best-effort preview
              return (
                <Container>
                  <iframe
                    title={`Preview: ${viewer.title}`}
                    src={viewer.url}
                    className="w-full h-[70vh] rounded"
                    loading="eager"
                    referrerPolicy="no-referrer"
                    onLoad={() => setViewerLoading(false)}
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    If the preview doesn’t appear,{' '}
                    <a className="underline" href={viewer.url} target="_blank" rel="noreferrer noopener">open in a new tab</a>.
                  </div>
                  {process.env.NODE_ENV !== 'production' && (
                    <details className="mt-2 text-[11px] text-muted-foreground/80">
                      <summary>Viewer debug</summary>
                      <pre className="mt-2 p-2 rounded bg-muted/40 border border-border/20 overflow-auto max-h-40">{JSON.stringify({ url: viewer.url, type: t, loading: viewerLoading, error: viewerError }, null, 2)}</pre>
                    </details>
                  )}
                </Container>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
