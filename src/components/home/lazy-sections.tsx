'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState, useRef } from 'react';
import { TahoeAmbient } from '@/components/layout/tahoe-ambient';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Phone, ShieldAlert } from 'lucide-react';

// Dynamically imported client-heavy sections (below the fold)
const FeaturedCourses = dynamic(() => import('@/components/landing/featured-courses').then(m => ({ default: m.FeaturedCourses })), { loading: () => <div className="h-[520px]" aria-hidden /> });
const StudentClubs = dynamic(() => import('@/components/landing/student-clubs').then(m => ({ default: m.StudentClubs })), { loading: () => <div className="h-40" aria-hidden /> });
const AiNews = dynamic(() => import('@/components/landing/ai-news').then(m => ({ default: m.AiNews })), { loading: () => <div className="h-40" aria-hidden /> });
const ClubRecommender = dynamic(() => import('@/components/landing/club-recommender').then(m => ({ default: m.ClubRecommender })), { loading: () => <div className="h-40" aria-hidden /> });
const BoardAndSos = dynamic(() => import('@/components/landing/board-and-sos').then(m => ({ default: m.BoardAndSos })), { loading: () => <div className="h-40" aria-hidden /> });

function useOnScreen(ref: React.RefObject<Element>, rootMargin = '0px') {
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIntersecting(true);
        observer.disconnect();
      }
    }, { rootMargin, threshold: 0.15 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return isIntersecting;
}

export default function LazySections() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const showBoard = useOnScreen(boardRef, '250px');
  return (
    <TahoeAmbient className="bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 max-w-full">
        <div className="flex flex-col w-full space-y-24 md:space-y-32">
          <div className="relative" ref={boardRef}>
            <Suspense fallback={<div className="h-[520px]" aria-hidden />}> 
              <FeaturedCourses />
            </Suspense>
            <div className="hidden lg:block absolute top-6 right-6 w-[300px] xl:w-[320px] z-20 space-y-6 pointer-events-auto">
              {showBoard && <BoardAndSos />}
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-24 md:space-y-32">
            <Suspense fallback={<div className="h-40" aria-hidden />}> <StudentClubs /> </Suspense>
            <Suspense fallback={<div className="h-40" aria-hidden />}> <AiNews /> </Suspense>
            <Suspense fallback={<div className="h-40" aria-hidden />}> <ClubRecommender /> </Suspense>
          </div>
        </div>
      </div>
      {/* Mobile SOS */}
      <div className="lg:hidden overflow-x-hidden">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full fixed bottom-6 right-6 z-50 p-0 h-16 w-16 shadow-lg animate-pulse max-w-fit"
              aria-label="Emergency SOS"
            >
              <ShieldAlert className="h-8 w-8 flex-shrink-0" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] w-full mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline text-2xl">Emergency SOS</AlertDialogTitle>
              <AlertDialogDescription className="break-words">
                If this is a life-threatening emergency, please call your local emergency number immediately.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 w-full">
              <a href="tel:911" className="w-full block">
                <Button variant="destructive" className="w-full">
                  <Phone className="mr-2 h-4 w-4 flex-shrink-0" /> Call Emergency Services
                </Button>
              </a>
              <a href="tel:123-456-7890" className="w-full block">
                <Button variant="secondary" className="w-full">
                  <Phone className="mr-2 h-4 w-4 flex-shrink-0" /> Call Campus Security
                </Button>
              </a>
            </div>
            <AlertDialogFooter className="w-full">
              <AlertDialogCancel className="w-full sm:w-auto">Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TahoeAmbient>
  );
}
