import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const courses = [
  {
    title: 'CP1: Foundations of Programming',
    description: 'Master the fundamentals of coding with hands-on projects and real-world examples.',
    image: 'https://picsum.photos/600/400?random=1',
    hint: 'code abstract',
  },
  {
    title: 'CP2: Advanced Data Structures',
    description: 'Dive deep into complex data structures and algorithms to solve challenging problems.',
    image: 'https://picsum.photos/600/400?random=2',
    hint: 'data network',
  },
  {
    title: 'Software Engineering Principles',
    description: 'Learn the principles of building robust, scalable, and maintainable software systems.',
    image: 'https://picsum.photos/600/400?random=3',
    hint: 'team collaboration',
  },
  {
    title: 'Industrial Design Workshop',
    description: 'From concept to prototype, explore the world of product design and innovation.',
    image: 'https://picsum.photos/600/400?random=4',
    hint: 'product sketch',
  },
  {
    title: 'Cybersecurity Defense',
    description: 'Understand modern threats and learn to defend systems against cyber attacks.',
    image: 'https://picsum.photos/600/400?random=5',
    hint: 'cyber security',
  },
];

export function FeaturedCourses() {
  return (
    <section id="featured-courses" className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">Featured Courses</h2>
        <p className="mt-2 text-lg text-muted-foreground">Expand your knowledge with our top-rated programs.</p>
      </div>

      <Carousel opts={{ align: 'start', loop: true }} className="w-full">
        <CarouselContent>
          {courses.map((course, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card className="h-full flex flex-col overflow-hidden bg-background/60 dark:bg-primary/60 backdrop-blur-sm border-border/50 shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-accent group">
                  <CardHeader className="p-0">
                    <div className="relative h-56 w-full">
                       <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={course.hint}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-6">
                    <CardTitle className="font-headline text-xl mb-2">{course.title}</CardTitle>
                    <p className="text-muted-foreground">{course.description}</p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button variant="ghost" className="text-accent hover:text-accent group-hover:underline">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </section>
  );
}
