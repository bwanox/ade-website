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
      {/* Engineering-themed background elements */}
      <div className="absolute inset-0 z-0">
        {/* Circuit board pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none">
            <defs>
              <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M20 20h60v20h-60z M30 50h40v20h-40z M10 80h80v5h-80z" fill="currentColor" opacity="0.3"/>
                <circle cx="20" cy="30" r="3" fill="currentColor" opacity="0.5"/>
                <circle cx="80" cy="30" r="3" fill="currentColor" opacity="0.5"/>
                <circle cx="50" cy="70" r="2" fill="currentColor" opacity="0.4"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" className="text-accent"/>
          </svg>
        </div>
        
        {/* Floating engineering elements */}
        <div className="absolute h-32 w-32 opacity-20 -top-10 -left-10 animate-bounce">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-accent">
            <path d="M50 10L90 50L50 90L10 50Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
            <circle cx="50" cy="50" r="8" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="absolute h-24 w-24 opacity-15 top-20 right-16 animate-spin-slow">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-accent">
            <path d="M50 20L80 50L50 80L20 50Z M30 30h40v40h-40z" stroke="currentColor" strokeWidth="2"/>
            <rect x="45" y="45" width="10" height="10" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="absolute h-40 w-40 opacity-10 bottom-20 left-20 animate-pulse">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-white">
            <g stroke="currentColor" strokeWidth="1" fill="none">
              <circle cx="50" cy="50" r="30"/>
              <circle cx="50" cy="50" r="20"/>
              <circle cx="50" cy="50" r="10"/>
              <path d="M20 50h60 M50 20v60"/>
            </g>
          </svg>
        </div>
        
        {/* Geometric shapes */}
        <div className="absolute h-20 w-20 opacity-25 top-1/3 right-1/4 animate-pulse animation-delay-1000">
          <div className="w-full h-full bg-accent/30 transform rotate-45 rounded-lg"></div>
        </div>
        
        <div className="absolute h-16 w-16 opacity-20 bottom-1/3 right-10 animate-bounce animation-delay-500">
          <div className="w-full h-full border-2 border-accent/40 rounded-full"></div>
        </div>
        
        {/* Engineering grid lines */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
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
          .engineering-badge {
            animation: engineeringFloat 3s ease-in-out infinite;
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
          @keyframes engineeringFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
        `}</style>

        {/* Engineering badge */}
        <div className="engineering-badge mb-4 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-6 py-2 fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
            </svg>
            <span className="text-accent font-semibold text-sm">Engineering Excellence</span>
            <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
        </div>

        <div className="typewriter">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold text-shadow relative">
            <span className="relative z-10">SOS-ADE</span>
            {/* Engineering accent behind text */}
            <div className="absolute inset-0 -z-10 opacity-20">
              <div className="text-accent text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-headline font-bold transform translate-x-1 translate-y-1">
                SOS-ADE
              </div>
            </div>
          </h1>
        </div>
        
        {/* Enhanced subtitle with engineering theme */}
        <div className="mt-6 fade-in">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-4xl border border-white/20">
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 text-shadow-sm leading-relaxed">
              <span className="text-accent font-semibold">Empowering Engineers.</span> Building Tomorrow.
            </p>
            <p className="text-sm sm:text-base text-gray-300 mt-2 italic">
              "The future belongs to those who believe in the beauty of their dreams." – Eleanor Roosevelt
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4 fade-in-up">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group">
            <Link href="#" className="relative z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Request Help
              </span>
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl relative overflow-hidden group">
            <Link href="#featured-courses" className="relative z-10">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Explore Courses
              </span>
            </Link>
          </Button>
        </div>
        
        {/* Enhanced countdown with engineering theme */}
        <div className="fade-in-up w-full flex justify-center">
          <div className="relative">
            {/* Engineering frame around countdown */}
            <div className="absolute -inset-4 border border-accent/30 rounded-xl bg-gradient-to-br from-accent/5 to-transparent"></div>
            <div className="absolute -inset-2 border border-accent/20 rounded-lg"></div>
            <Countdown />
          </div>
        </div>
        
        {/* Engineering stats or features */}
        <div className="mt-12 fade-in-up grid grid-cols-3 gap-8 max-w-2xl w-full">
          <div className="text-center group cursor-pointer">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:border-accent/50 transition-colors duration-300">
              <svg className="w-8 h-8 mx-auto text-accent mb-2 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11V21H13V15H11V21H9V11C9 10.45 9.45 10 10 10H14C14.55 10 15 10.45 15 11Z"/>
              </svg>
              <p className="text-sm font-semibold text-accent">Innovation</p>
              <p className="text-xs text-gray-300">Driven</p>
            </div>
          </div>
          
          <div className="text-center group cursor-pointer">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:border-accent/50 transition-colors duration-300">
              <svg className="w-8 h-8 mx-auto text-accent mb-2 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12"/>
              </svg>
              <p className="text-sm font-semibold text-accent">Collaborative</p>
              <p className="text-xs text-gray-300">Learning</p>
            </div>
          </div>
          
          <div className="text-center group cursor-pointer">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:border-accent/50 transition-colors duration-300">
              <svg className="w-8 h-8 mx-auto text-accent mb-2 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM17 12C17 14.76 14.76 17 12 17S7 14.76 7 12S9.24 7 12 7S17 9.24 17 12ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15S15 13.66 15 12S13.66 9 12 9Z"/>
              </svg>
              <p className="text-sm font-semibold text-accent">Future</p>
              <p className="text-xs text-gray-300">Ready</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
