'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from '../ui/sidebar';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <header
      className={cn(
        'sticky top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out',
        scrolled ? 'bg-background/80 backdrop-blur-lg border-b' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="lg:hidden" />
            <div className="relative w-full max-w-xs">
              <Input type="search" placeholder="Search..." className={cn('pr-10', scrolled ? 'bg-secondary' : 'bg-white/20 text-white placeholder:text-gray-300 border-gray-400')} />
              <Search className={cn('absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5', scrolled ? 'text-muted-foreground' : 'text-gray-300')} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className={cn(scrolled ? 'text-primary' : 'text-primary-foreground hover:bg-white/10')}>
              <Bell className="h-6 w-6" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className={cn(scrolled ? 'text-primary' : 'text-primary-foreground hover:bg-white/10')}>
              <User className="h-6 w-6" />
              <span className="sr-only">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
