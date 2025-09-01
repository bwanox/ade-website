'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        'sticky top-0 z-50 transition-all duration-300 ease-in-out',
        scrolled ? 'bg-background/80 backdrop-blur-lg border-b' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className={cn(scrolled ? 'text-primary' : 'text-accent')} />
            <span
              className={cn(
                'text-xl font-bold font-headline',
                scrolled ? 'text-primary' : 'text-primary-foreground'
              )}
            >
              NexusConnect
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  'font-medium transition-colors',
                  scrolled
                    ? 'text-foreground hover:text-accent'
                    : 'text-primary-foreground hover:text-accent'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Input
                type="search"
                placeholder="Search..."
                className={cn(
                  'pr-10 w-48',
                  scrolled
                    ? 'bg-secondary'
                    : 'bg-white/20 text-white placeholder:text-gray-300 border-gray-400'
                )}
              />
              <Search
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5',
                  scrolled ? 'text-muted-foreground' : 'text-gray-300'
                )}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                scrolled ? 'text-primary' : 'text-primary-foreground hover:bg-white/10'
              )}
            >
              <Bell className="h-6 w-6" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'lg:hidden',
                scrolled ? 'text-primary' : 'text-primary-foreground hover:bg-white/10'
              )}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden',
          mobileMenuOpen ? 'block' : 'hidden'
        )}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
             <Link href="/" className="flex items-center gap-2">
                <Logo className="text-accent" />
                <span className="text-xl font-bold font-headline text-primary">NexusConnect</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-lg font-medium text-foreground hover:text-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
