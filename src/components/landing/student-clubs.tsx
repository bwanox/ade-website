'use client';

import * as React from 'react'
import { Bot, Cpu, HeartHandshake, Users, Zap, Code, Palette, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import Autoplay from "embla-carousel-autoplay"

const clubs = [
  {
    name: 'Robotics Club',
    description: 'Build, code, and compete with cutting-edge robots.',
    icon: Bot,
    members: '120+',
    category: 'Technology',
    color: 'from-blue-500 to-cyan-500',
    bgPattern: 'circuits'
  },
  {
    name: 'Electronics Club',
    description: 'Tinker with circuits, microcontrollers, and create amazing gadgets.',
    icon: Cpu,
    members: '85+',
    category: 'Engineering',
    color: 'from-green-500 to-emerald-500',
    bgPattern: 'waves'
  },
  {
    name: 'Humanitarian Club',
    description: 'Make a difference in the community through volunteering and social projects.',
    icon: HeartHandshake,
    members: '200+',
    category: 'Social Impact',
    color: 'from-pink-500 to-rose-500',
    bgPattern: 'hearts'
  },
  {
    name: 'AI Society',
    description: 'Explore the frontiers of artificial intelligence and machine learning.',
    icon: Zap,
    members: '150+',
    category: 'Technology',
    color: 'from-purple-500 to-violet-500',
    bgPattern: 'neural'
  },
  {
    name: 'Hardware Hackers',
    description: 'From IoT to custom keyboards, if it\'s hardware, we love it.',
    icon: Code,
    members: '90+',
    category: 'Innovation',
    color: 'from-orange-500 to-amber-500',
    bgPattern: 'hexagons'
  },
  {
    name: 'Design Collective',
    description: 'Creative minds unite to explore UI/UX, graphic design, and digital art.',
    icon: Palette,
    members: '110+',
    category: 'Creative',
    color: 'from-indigo-500 to-blue-500',
    bgPattern: 'artistic'
  },
];

export function StudentClubs() {
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    )
  return (
    <section id="student-clubs" className="w-full py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/5 w-72 h-72 bg-gradient-to-r from-accent/15 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-gradient-to-l from-accent/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-accent/8 via-transparent to-transparent rounded-full animate-pulse delay-500" />
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-accent/12 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/40 pointer-events-none" />
      
      {/* Community connection lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1000 800">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M100,200 Q300,100 500,200 T900,200" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="text-accent animate-pulse" />
          <path d="M150,400 Q350,300 550,400 T850,400" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="text-accent animate-pulse delay-1000" />
          <path d="M200,600 Q400,500 600,600 T800,600" stroke="url(#connectionGradient)" strokeWidth="2" fill="none" className="text-accent animate-pulse delay-2000" />
        </svg>
      </div>
      
      <div className="relative z-10 mb-16 text-center">
        <div className="inline-block group">
          <h2 className="text-3xl md:text-5xl font-headline font-bold bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent gradient-shift">
            Find Your Community
          </h2>
          <div className="mt-3 h-1 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Connect with like-minded peers in our vibrant student clubs. Build lasting friendships, develop skills, and make an impact together.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground/70">
          <Users className="w-4 h-4 text-accent" />
          <span>900+ Active Members Across All Clubs</span>
        </div>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[plugin.current]}
        className="w-full group/carousel"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {clubs.map((club, index) => (
            <CarouselItem 
              key={index} 
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 animate-fade-in-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <Card className="h-full w-full overflow-hidden group/card cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-3 relative">
                {/* Dynamic background pattern */}
                <div className="absolute inset-0 opacity-5 group-hover/card:opacity-10 transition-opacity duration-500">
                  <div className={`w-full h-full bg-gradient-to-br ${club.color}`} />
                </div>
                
                {/* Card background with gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/90 backdrop-blur-xl" />
                <div className={`absolute inset-0 bg-gradient-to-br ${club.color} opacity-0 group-hover/card:opacity-10 transition-opacity duration-500`} />
                
                {/* Border gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${club.color} rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500`} style={{ padding: '2px' }}>
                  <div className="w-full h-full bg-background rounded-lg" />
                </div>
                
                <CardContent className="flex flex-col items-center justify-center p-8 text-center relative z-10 h-full">
                  {/* Category badge */}
                  <div className="absolute top-4 right-4 bg-accent/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-accent font-medium border border-accent/20">
                    {club.category}
                  </div>
                  
                  {/* Icon container with enhanced effects */}
                  <div className={`relative p-6 rounded-full mb-6 bg-gradient-to-br ${club.color} shadow-lg group-hover/card:shadow-xl transition-all duration-500 group-hover/card:scale-110`}>
                    <div className="absolute inset-0 bg-white/20 rounded-full backdrop-blur-sm" />
                    <club.icon className="h-12 w-12 text-white relative z-10 group-hover/card:rotate-12 transition-transform duration-500" />
                    
                    {/* Floating accent decorations around icon */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/60 rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-300 animate-pulse" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/40 rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-300 delay-100 animate-pulse" />
                  </div>
                  
                  {/* Club name with gradient effect */}
                  <h3 className="text-xl font-headline font-semibold mb-3 group-hover/card:text-accent transition-colors duration-300 relative">
                    {club.name}
                    <div className={`absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r ${club.color} group-hover/card:w-full transition-all duration-500`} />
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed mb-4 group-hover/card:text-foreground/80 transition-colors duration-300">
                    {club.description}
                  </p>
                  
                  {/* Member count with icon */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground/70 mb-4">
                    <Users className="w-4 h-4 text-accent" />
                    <span>{club.members} Members</span>
                  </div>
                  
                  {/* Join button */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`group/button relative overflow-hidden border border-transparent hover:border-accent/20 transition-all duration-300 bg-gradient-to-r ${club.color} bg-clip-text text-transparent hover:text-white`}
                  >
                    <span className="relative z-10 font-medium">
                      Join Club
                    </span>
                    <div className={`absolute inset-0 bg-gradient-to-r ${club.color} translate-y-full group-hover/button:translate-y-0 transition-transform duration-300`} />
                  </Button>
                </CardContent>
                
                {/* Card shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      
      {/* Call to action section */}
      <div className="mt-16 text-center relative z-10">
        <div className="inline-block group">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 border border-accent/20 hover:border-accent/40 backdrop-blur-sm relative overflow-hidden"
          >
            <span className="relative z-10 font-semibold">
              Explore All Clubs
            </span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          </Button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground/70">
          Can't find what you're looking for? Start your own club!
        </p>
      </div>
    </section>
  );
}
