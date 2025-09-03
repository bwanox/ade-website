'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'About Us', href: '#' },
  { label: 'Events', href: '#' },
  { label: 'News', href: '#' },
  { label: 'Contact', href: '#' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [mobileMenuOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out overflow-x-hidden',
        scrolled 
          ? 'bg-gradient-to-r from-black/30 via-black/20 to-black/30 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/10' 
          : 'bg-transparent'
      )}
    >
      {/* Animated gradient overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500',
        scrolled && 'opacity-100'
      )} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3 transition-transform duration-300 hover:scale-105">
            <div className="relative">
              <Logo className="text-accent transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span
              className={cn(
                'text-xl font-bold font-headline text-primary-foreground relative',
                'bg-gradient-to-r from-primary-foreground via-accent to-primary-foreground bg-clip-text gradient-shift',
                'group-hover:bg-gradient-to-r group-hover:from-accent group-hover:via-primary-foreground group-hover:to-accent',
                'transition-all duration-300'
              )}
            >
              SOSADE
              <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-accent to-primary-foreground transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'relative font-medium transition-all duration-300 text-primary-foreground/90 hover:text-accent',
                  'before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-0 before:bg-gradient-to-r before:from-accent before:to-primary-foreground',
                  'before:transition-all before:duration-300 hover:before:w-full',
                  'after:absolute after:inset-0 after:bg-accent/10 after:rounded-full after:scale-0 after:opacity-0',
                  'after:transition-all after:duration-300 hover:after:scale-100 hover:after:opacity-100',
                  'px-4 py-2 rounded-full backdrop-blur-sm'
                )}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {/* CTA Button for larger screens */}
            <Button 
              asChild 
              className={cn(
                'hidden sm:flex bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground',
                'shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300',
                'border border-accent/20 hover:border-accent/40 backdrop-blur-sm',
                'before:absolute before:inset-0 before:bg-white/10 before:rounded-lg before:opacity-0 before:transition-opacity before:duration-300',
                'hover:before:opacity-100 relative overflow-hidden'
              )}
            >
              <Link href="#" className="relative z-10 font-semibold">
                Join Now
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'lg:hidden text-primary-foreground hover:bg-white/10 relative overflow-hidden',
                'border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300',
                'hover:scale-105 active:scale-95'
              )}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6 transition-transform duration-300 hover:rotate-180" />
              <span className="sr-only">Open menu</span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-[100] bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-md lg:hidden transition-all duration-500',
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={cn(
            'fixed top-0 left-0 h-full w-4/5 max-w-sm transition-all duration-500 ease-out',
            'bg-gradient-to-br from-sidebar via-sidebar/95 to-sidebar/90 backdrop-blur-xl',
            'border-r border-accent/20 shadow-2xl shadow-black/30',
            'before:absolute before:inset-0 before:bg-gradient-to-br before:from-accent/5 before:via-transparent before:to-accent/10',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <Logo className="text-accent transition-all duration-300 group-hover:rotate-12" />
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-xl font-bold font-headline text-primary-foreground bg-gradient-to-r from-primary-foreground to-accent bg-clip-text">
                SOSADE
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'text-primary-foreground hover:bg-white/10 transition-all duration-300',
                'border border-white/10 hover:border-white/20 backdrop-blur-sm',
                'hover:rotate-90 hover:scale-110'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          
          {/* Mobile navigation */}
          <nav className="flex flex-col p-6 space-y-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'group relative text-xl font-semibold text-primary-foreground/80 hover:text-accent',
                  'transition-all duration-300 py-3 px-4 rounded-xl',
                  'hover:bg-gradient-to-r hover:from-accent/10 hover:to-transparent',
                  'border border-transparent hover:border-accent/20',
                  'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-0',
                  'before:bg-gradient-to-b before:from-accent before:to-accent/50 before:rounded-full',
                  'before:transition-all before:duration-300 hover:before:h-8',
                  'animate-fade-in-up'
                )}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: 'both'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="relative z-10 ml-2">{link.label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Mobile CTA */}
          <div className="absolute bottom-6 left-6 right-6">
            <Button 
              asChild 
              className={cn(
                'w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent',
                'text-accent-foreground font-bold text-lg shadow-xl shadow-accent/30',
                'border border-accent/20 hover:border-accent/40 transition-all duration-300',
                'hover:scale-105 active:scale-95 relative overflow-hidden',
                'before:absolute before:inset-0 before:bg-white/10 before:translate-x-[-100%]',
                'before:transition-transform before:duration-500 hover:before:translate-x-0'
              )}
            >
              <Link href="#" className="relative z-10">
                Join Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
