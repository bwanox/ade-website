'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit as fsLimit, query, where, getDoc, doc } from 'firebase/firestore';
import { courseSchema, slugify } from '@/types/firestore-content';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface Props { slug: string; prefetchedCourse?: any; }

export function FirestoreCourseFallback({ slug, prefetchedCourse }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<any | null>(prefetchedCourse || null);
  const [debug, setDebug] = useState<any>(null);

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
            <div className="pt-12 space-y-10">
              {course.semesters.map((sem: any, si: number) => (
                <div key={sem.id || si} className="space-y-6">
                  <h2 className="text-2xl font-headline font-semibold tracking-tight">
                    {sem.title || `Semester ${si + 1}`}
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(sem.modules || []).map((m: any, mi: number) => (
                      <Card key={m.id || mi} className="group relative overflow-hidden border-accent/20 hover:border-accent/50 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <CardHeader className="pb-2">
                          <h3 className="font-headline font-semibold tracking-tight text-sm">
                            {m.title || `Module ${mi + 1}`}
                          </h3>
                          {m.summary && <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[20rem]">{m.summary}</p>}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Accordion type="multiple" className="w-full">
                            <AccordionItem value="lesson">
                              <AccordionTrigger className="text-xs">Lesson</AccordionTrigger>
                              <AccordionContent>
                                {m.resources?.lesson ? (
                                  <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-accent/10">
                                    <div className="flex items-center gap-2 text-xs">
                                      <FileText className="w-3 h-3 text-accent" />
                                      <span>{m.resources.lesson.title || 'Lesson'}</span>
                                      {m.resources.lesson.size && <span className="text-[10px] text-muted-foreground">{m.resources.lesson.size}</span>}
                                    </div>
                                    {m.resources.lesson.url && (
                                      <div className="flex gap-1">
                                        <a className="text-[10px] underline" href={m.resources.lesson.url} target="_blank" rel="noopener noreferrer">View</a>
                                      </div>
                                    )}
                                  </div>
                                ) : <div className="text-[10px] text-muted-foreground">No lesson uploaded</div>}
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="exercises">
                              <AccordionTrigger className="text-xs">Exercises ({m.resources?.exercises?.length || 0})</AccordionTrigger>
                              <AccordionContent className="space-y-2">
                                {m.resources?.exercises?.length ? m.resources.exercises.map((r: any, ei: number) => (
                                  <div key={ei} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-accent/10">
                                    <div className="flex items-center gap-2 text-xs">
                                      <FileText className="w-3 h-3 text-accent" />
                                      <span>{r.title || `Exercise ${ei + 1}`}</span>
                                    </div>
                                    {r.url && <a className="text-[10px] underline" href={r.url} target="_blank" rel="noopener noreferrer">View</a>}
                                  </div>
                                )) : <div className="text-[10px] text-muted-foreground">No exercises</div>}
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="exams">
                              <AccordionTrigger className="text-xs">Past Exams ({m.resources?.pastExams?.length || 0})</AccordionTrigger>
                              <AccordionContent className="space-y-2">
                                {m.resources?.pastExams?.length ? m.resources.pastExams.map((r: any, pi: number) => (
                                  <div key={pi} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-accent/10">
                                    <div className="flex items-center gap-2 text-xs">
                                      <FileText className="w-3 h-3 text-accent" />
                                      <span>{r.title || `Exam ${pi + 1}`}</span>
                                    </div>
                                    {r.url && <a className="text-[10px] underline" href={r.url} target="_blank" rel="noopener noreferrer">View</a>}
                                  </div>
                                )) : <div className="text-[10px] text-muted-foreground">No exams</div>}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
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
    </div>
  );
}
