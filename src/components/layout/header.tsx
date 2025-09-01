'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, Bell, User, X, Home, BookOpen, Bot, Shield, GraduationCap, Code, ShieldCheck, HardHat, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetHeader } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    {
      label: 'Home',
      href: '#',
      icon: Home,
    },
    {
      label: 'Programs & Courses',
      icon: GraduationCap,
      sublinks: [
        { label: 'CP1', href: '#' },
        { label: 'CP2', href: '#' },
        { label: 'Software Engineering', href: '#' },
        { label: 'Industrial', href: '#' },
        { label: 'Cybersecurity', href: '#' },
      ],
    },
    {
      label: 'Student Clubs',
      icon: Bot,
      sublinks: [
        { label: 'Robotics', href: '#student-clubs' },
        { label: 'Electronics', href: '#student-clubs' },
        { label: 'Humanitarian', href: '#student-clubs' },
      ],
    },
    {
      label: 'Resources & SOS',
      href: '#',
      icon: Shield,
    },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        scrolled ? 'bg-background/80 backdrop-blur-lg border-b' : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="text-primary-foreground" />
            <span className={cn('text-xl font-bold font-headline', scrolled ? 'text-primary' : 'text-primary-foreground')}>NexusConnect</span>
          </Link>

          <div className="hidden lg:flex items-center gap-4">
            <div className="relative w-full max-w-xs">
              <Input type="search" placeholder="Search..." className={cn('pr-10', scrolled ? 'bg-secondary' : 'bg-white/20 text-white placeholder:text-gray-300 border-gray-400')} />
              <Search className={cn('absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5', scrolled ? 'text-muted-foreground' : 'text-gray-300')} />
            </div>
            <Button variant="ghost" size="icon" className={cn(scrolled ? 'text-primary' : 'text-primary-foreground hover:bg-white/10')}>
              <Bell className="h-6 w-6" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className={cn(scrolled ? 'text-primary' : 'text-primary-foreground hover:bg-white/10')}>
              <User className="h-6 w-6" />
              <span className="sr-only">Profile</span>
            </Button>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className={cn('text-2xl', scrolled ? 'text-primary' : 'text-primary-foreground hover:bg-white/10')}>
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-primary text-primary-foreground p-0 w-80">
              <SheetHeader className="p-4 border-b border-white/20">
                <div className="flex justify-between items-center">
                   <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <Logo className="text-accent"/>
                    <span className="text-xl font-bold font-headline text-primary-foreground">NexusConnect</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </SheetHeader>
              <nav className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {navLinks.map((link) =>
                    link.sublinks ? (
                      <AccordionItem value={link.label} key={link.label} className="border-b-0">
                        <AccordionTrigger className="py-4 text-lg font-semibold hover:no-underline">
                          <div className="flex items-center gap-3">
                            <link.icon className="h-5 w-5 text-accent" />
                            {link.label}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pl-8">
                          <ul className="space-y-2">
                            {link.sublinks.map((sublink) => (
                              <li key={sublink.label}>
                                <Link
                                  href={sublink.href}
                                  className="block text-base text-gray-300 hover:text-white"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {sublink.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="flex items-center gap-3 py-4 text-lg font-semibold border-t border-white/20"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="h-5 w-5 text-accent" />
                        {link.label}
                      </Link>
                    )
                  )}
                </Accordion>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
