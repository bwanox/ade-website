'use client';

import { Bot, Cpu, HeartHandshake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"

const clubs = [
  {
    name: 'Robotics Club',
    description: 'Build, code, and compete with cutting-edge robots.',
    icon: Bot,
  },
  {
    name: 'Electronics Club',
    description: 'Tinker with circuits, microcontrollers, and create amazing gadgets.',
    icon: Cpu,
  },
  {
    name: 'Humanitarian Club',
    description: 'Make a difference in the community through volunteering and social projects.',
    icon: HeartHandshake,
  },
  {
    name: 'AI Society',
    description: 'Explore the frontiers of artificial intelligence and machine learning.',
    icon: Bot,
  },
  {
    name: 'Hardware Hackers',
    description: 'From IoT to custom keyboards, if it\'s hardware, we love it.',
    icon: Cpu,
  },
];

export function StudentClubs() {
  return (
    <section id="student-clubs" className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">Find Your Community</h2>
        <p className="mt-2 text-lg text-muted-foreground">Connect with like-minded peers in our vibrant student clubs.</p>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
            }),
          ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {clubs.map((club, index) => (
            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="h-full w-full overflow-hidden group transition-all duration-300 border-2 border-transparent hover:border-accent hover:shadow-xl">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="p-4 bg-accent/20 rounded-full mb-4">
                    <club.icon className="h-12 w-12 text-accent" />
                  </div>
                  <h3 className="text-xl font-headline font-semibold mb-2">{club.name}</h3>
                  <p className="text-muted-foreground">{club.description}</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
