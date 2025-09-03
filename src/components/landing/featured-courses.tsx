'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Code, Shield, Zap } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, onSnapshot, where } from 'firebase/firestore';
import { courseSchema, translateFirestoreError, sleep, CourseDoc } from '@/types/firestore-content';
import { useCollectionData } from '@/hooks/use-collection-data';

// Map difficulty (or index) to an icon so UI keeps variety even if Firestore docs lack icon info
const pickIcon = (difficulty?: string, index?: number) => {
  const d = (difficulty || '').toLowerCase();
  if (d.includes('beginner')) return Code;
  if (d.includes('advanced')) return Zap;
  if (d.includes('security')) return Shield;
  if (d.includes('cyber')) return Shield;
  if (d.includes('intermediate')) return BookOpen;
  // fallback rotate
  const icons = [Code, Zap, BookOpen, Shield];
  return icons[index ? index % icons.length : 0];
};

interface FirestoreCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty?: string;
  duration?: string;
  heroImage?: string;
  year?: number;
  // semesters, etc. ignored for listing
}

// New configuration/options type
interface FeaturedCoursesProps {
  enableRealtime?: boolean;
  featuredOnly?: boolean;
  limitCount?: number;
  retryAttempts?: number;
}

export function FeaturedCourses({ enableRealtime = true, featuredOnly = false, limitCount = 9, retryAttempts = 3 }: FeaturedCoursesProps) {
  // Removed local state logic; now using hook
  const buildQuery = () => {
    const baseCol = collection(db, 'courses');
    const constraints: any[] = [orderBy('title', 'asc'), limit(limitCount)];
    constraints.unshift(where('published', '==', true));
    if (featuredOnly) constraints.unshift(where('featured', '==', true));
    return query(baseCol, ...constraints);
  };

  const { data: courses, loading, error, reload } = useCollectionData<FirestoreCourse>({
    query: buildQuery,
    enableRealtime,
    retryAttempts,
    parser: (raw: any) => {
      const parsed = courseSchema.safeParse(raw);
      if (!parsed.success) return null;
      return parsed.data as CourseDoc;
    },
  });
  const [attempt, setAttempt] = useState(0); // maintain for Retry button animation timing

  const skeletonItems = Array.from({ length: 5 });

  return (
    <section id="featured-courses" className="w-full py-16 relative overflow-hidden" aria-busy={loading} aria-live="polite">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-accent/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-accent/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/5 via-transparent to-transparent rounded-full animate-pulse delay-500" />
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/50 pointer-events-none" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/20 rounded-full animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + i}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 mb-12 text-center">
        <div className="inline-block group">
          <h2 className="text-3xl md:text-5xl font-headline font-bold bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent gradient-shift">
            Featured Courses
          </h2>
          <div className="mt-2 h-1 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Expand your knowledge with our top-rated programs designed to shape tomorrow's innovators.
        </p>
        {error && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <p className="text-sm text-destructive max-w-md">{error}</p>
            <Button variant="outline" size="sm" onClick={() => { setAttempt(a => a + 1); reload(); }} disabled={loading} aria-label="Retry loading courses">
              Retry
            </Button>
          </div>
        )}
      </div>

      <Carousel 
        opts={{ align: 'start', loop: true }} 
        className="w-full group/carousel"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {(loading ? skeletonItems : courses).map((raw, index) => {
            const isSkeleton = loading;
            // When loading, raw is an empty object placeholder; otherwise it's FirestoreCourse
            const course = (raw as FirestoreCourse) || ({} as FirestoreCourse);
            const Icon = isSkeleton ? BookOpen : pickIcon(course?.difficulty, index);
            const title = isSkeleton ? 'Loading…' : course.title;
            const description = isSkeleton ? 'Preparing course information...' : course.description;
            const image = isSkeleton ? `https://picsum.photos/600/400?blur=2&random=${index+1}` : (course.heroImage || `https://picsum.photos/600/400?random=${index+7}`);
            const slug = isSkeleton ? '#' : course.slug;
            const difficulty = isSkeleton ? '—' : (course.difficulty || '');
            const duration = isSkeleton ? '' : (course.duration || '');
            return (
              <CarouselItem 
                key={isSkeleton ? index : course.id} 
                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: 'both'
                }}
              >
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col overflow-hidden relative group/card cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                    {!isSkeleton && (
                      <Link href={`/courses/${slug}`} className="absolute inset-0 z-30" aria-label={`View ${title}`} />
                    )}
                    {/* Card background with gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-accent/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                    
                    {/* Border gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent/50 to-accent/20 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" style={{ padding: '1px' }}>
                      <div className="w-full h-full bg-background rounded-lg" />
                    </div>
                    
                    <CardHeader className="p-0 relative z-10">
                      <div className="relative h-56 w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10" />
                        <Image
                          src={image}
                          alt={title}
                          fill
                          className={`object-cover transition-all duration-700 ${isSkeleton ? 'grayscale animate-pulse' : 'group-hover/card:scale-110 group-hover/card:rotate-1'}`}
                        />
                        {/* Course metadata overlay */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                            <Icon className="w-3 h-3" />
                            <span>{difficulty}</span>
                          </div>
                          {duration && (
                            <div className="bg-accent/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-accent-foreground font-medium">
                              {duration}
                            </div>
                          )}
                        </div>
                        {/* Floating accent decorations */}
                        <div className="absolute top-4 right-4 w-3 h-3 bg-accent rounded-full opacity-60 group-hover/card:opacity-100 transition-all duration-300 animate-pulse" />
                        <div className="absolute top-6 right-6 w-2 h-2 bg-accent/50 rounded-full opacity-60 group-hover/card:opacity-100 transition-all duration-300 delay-100 animate-pulse" />
                        <div className="absolute top-8 right-8 w-1 h-1 bg-accent/30 rounded-full opacity-60 group-hover/card:opacity-100 transition-all duration-300 delay-200 animate-pulse" />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-grow p-6 relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <CardTitle className="font-headline text-xl group-hover/card:text-accent transition-colors duration-300 relative flex-1">
                          {title}
                          <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-accent to-accent/50 group-hover/card:w-full transition-all duration-500" />
                        </CardTitle>
                        <div className="ml-3 p-2 rounded-full bg-accent/10 group-hover/card:bg-accent group-hover/card:text-accent-foreground transition-all duration-300">
                          <Icon className="w-4 h-4 text-accent group-hover/card:text-accent-foreground" />
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed group-hover/card:text-foreground/80 transition-colors duration-300 mb-4 line-clamp-4">
                        {description}
                      </p>
                      {/* Course stats (static placeholders for now) */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground/70">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-accent" />
                          <span>{isSkeleton ? '—' : 'Interactive'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>{isSkeleton ? '' : 'Certified'}</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-6 pt-0 relative z-10">
                      <Button 
                        variant="ghost" 
                        disabled={isSkeleton}
                        className="group/button relative overflow-hidden border border-transparent hover:border-accent/20 transition-all duration-300 hover:bg-accent/5 z-40"
                      >
                        <span className="relative z-10 text-accent group-hover/button:text-accent-foreground transition-colors duration-300">
                          {isSkeleton ? 'Loading' : 'Learn More'}
                        </span>
                        <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:text-accent-foreground" />
                        <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent to-accent/0 translate-x-[-100%] group-hover/button:translate-x-0 transition-transform duration-500" />
                      </Button>
                    </CardFooter>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                  </Card>
                </div>
              </CarouselItem>
            );
          })}
          {!loading && courses.length === 0 && (
            <div className="p-8 text-center w-full">
              <p className="text-muted-foreground">No courses available yet. Check back soon.</p>
            </div>
          )}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-12 bg-background/80 backdrop-blur-sm border-accent/20 hover:bg-accent hover:border-accent text-accent hover:text-accent-foreground transition-all duration-300 shadow-lg hover:shadow-accent/25" />
        <CarouselNext className="hidden sm:flex -right-12 bg-background/80 backdrop-blur-sm border-accent/20 hover:bg-accent hover:border-accent text-accent hover:text-accent-foreground transition-all duration-300 shadow-lg hover:shadow-accent/25" />
      </Carousel>
    </section>
  );
}
