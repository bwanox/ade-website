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
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <TahoeAmbient className="bg-background relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:gap-12">
              <div className="flex flex-col space-y-24 md:space-y-32">
                <FeaturedCourses />
                <StudentClubs />
                <AiNews />
                <ClubRecommender />
              </div>
              <aside className="hidden lg:block relative">
                <div className="sticky top-28 space-y-8">
                  <BoardAndSos />
                </div>
              </aside>
            </div>
          </div>
        </TahoeAmbient>
        <div className="lg:hidden">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="default"
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full fixed bottom-6 right-6 z-50 p-0 h-16 w-16 shadow-lg animate-pulse"
                aria-label="Emergency SOS"
              >
                <ShieldAlert className="h-8 w-8" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-headline text-2xl">Emergency SOS</AlertDialogTitle>
                <AlertDialogDescription>
                  If this is a life-threatening emergency, please call your local emergency number immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <a href="tel:911" className="w-full">
                  <Button variant="destructive" className="w-full">
                    <Phone className="mr-2 h-4 w-4" /> Call Emergency Services
                  </Button>
                </a>
                <a href="tel:123-456-7890" className="w-full">
                   <Button variant="secondary" className="w-full">
                    <Phone className="mr-2 h-4 w-4" /> Call Campus Security
                  </Button>
                </a>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}
