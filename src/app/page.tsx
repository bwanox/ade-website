import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturedCourses } from '@/components/landing/featured-courses';
import { StudentClubs } from '@/components/landing/student-clubs';
import { AiNews } from '@/components/landing/ai-news';
import { ClubRecommender } from '@/components/landing/club-recommender';
import { BoardAndSos } from '@/components/landing/board-and-sos';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogTrigger,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Phone, ShieldAlert } from 'lucide-react';
import { TahoeAmbient } from '@/components/layout/tahoe-ambient';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background overflow-x-hidden">
      <Header />
      <main className="flex-1 overflow-x-hidden">
        {/* Hero variant switcher (user persists choice) */}
        <HeroSection/>
        <TahoeAmbient className="bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 max-w-full">
            {/* Reworked layout: overlay Board + SOS in corner of FeaturedCourses, center the rest below */}
            <div className="flex flex-col w-full space-y-24 md:space-y-32">
              <div className="relative">
                <FeaturedCourses />
                {/* Corner overlay only on large screens */}
                <div className="hidden lg:block absolute top-6 right-6 w-[300px] xl:w-[320px] z-20 space-y-6 pointer-events-auto">
                  <BoardAndSos />
                </div>
              </div>
              <div className="flex flex-col items-center text-center space-y-24 md:space-y-32">
                <StudentClubs />
                <AiNews />
                <ClubRecommender />
              </div>
            </div>
          </div>
        </TahoeAmbient>
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
      </main>
      <Footer />
    </div>
  );
}
