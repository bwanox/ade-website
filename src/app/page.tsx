import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/landing/hero-section';
import LazySections from '@/components/home/lazy-sections';

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background overflow-x-hidden">
      <main className="flex-1 overflow-x-hidden">
        <HeroSection />
        <LazySections />
      </main>
      <Footer />
    </div>
  );
}