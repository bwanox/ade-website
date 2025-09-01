'use client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date('2024-09-01T00:00:00');

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mt-8 max-w-lg w-full">
      <h3 className="text-center font-semibold text-white mb-3">Next Big Event Starts In:</h3>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <span className="text-3xl font-bold font-headline text-accent">{String(timeLeft.days).padStart(2, '0')}</span>
          <p className="text-xs text-gray-300">Days</p>
        </div>
        <div>
          <span className="text-3xl font-bold font-headline text-accent">{String(timeLeft.hours).padStart(2, '0')}</span>
          <p className="text-xs text-gray-300">Hours</p>
        </div>
        <div>
          <span className="text-3xl font-bold font-headline text-accent">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <p className="text-xs text-gray-300">Minutes</p>
        </div>
        <div>
          <span className="text-3xl font-bold font-headline text-accent">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <p className="text-xs text-gray-300">Seconds</p>
        </div>
      </div>
    </div>
  );
};

export function HeroSection() {
  return (
    <section className="relative w-full h-[95dvh] min-h-[600px] max-h-[900px] flex items-center justify-center text-white overflow-hidden bg-primary">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute h-64 w-64 rounded-full bg-accent/50 -top-20 -left-20 animate-pulse"></div>
        <div className="absolute h-80 w-80 rounded-full bg-accent/30 -bottom-32 -right-16 animate-pulse animation-delay-300"></div>
        <div className="absolute h-48 w-48 rounded-lg bg-white/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <style jsx>{`
          .typewriter h1 {
            overflow: hidden;
            border-right: .15em solid hsl(var(--accent));
            white-space: nowrap;
            margin: 0 auto;
            letter-spacing: .05em;
            animation: 
              typing 3.5s steps(40, end),
              blink-caret .75s step-end infinite;
          }
          @keyframes typing {
            from { width: 0 }
            to { width: 100% }
          }
          @keyframes blink-caret {
            from, to { border-color: transparent }
            50% { border-color: hsl(var(--accent)); }
          }
          .fade-in {
            animation: fadeIn 2s 3.5s ease-in-out forwards;
            opacity: 0;
          }
           .fade-in-up {
            animation: fadeInUp 1s 4s ease-out forwards;
            opacity: 0;
          }
          @keyframes fadeIn {
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div className="typewriter">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold text-shadow">
            NexusConnect
          </h1>
        </div>
        
        <p className="mt-6 text-lg sm:text-xl md:text-2xl max-w-3xl text-gray-200 text-shadow-sm fade-in">
          "The future belongs to those who believe in the beauty of their dreams." – <span className="italic">Eleanor Roosevelt</span>
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4 fade-in-up">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
            <Link href="#">Join Now</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
            <Link href="#featured-courses">Explore Courses</Link>
          </Button>
        </div>
        
        <div className="fade-in-up w-full flex justify-center">
          <Countdown />
        </div>
      </div>
    </section>
  );
}
