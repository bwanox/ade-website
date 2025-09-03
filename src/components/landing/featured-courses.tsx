import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Code, Shield, Zap } from 'lucide-react';

const courses = [
  {
    title: 'CP1: Foundations of Programming',
    slug: 'cp1-foundations',
    description: 'Master the fundamentals of coding with hands-on projects and real-world examples.',
    image: 'https://picsum.photos/600/400?random=1',
    hint: 'code abstract',
    icon: Code,
    difficulty: 'Beginner',
    duration: '8 weeks',
  },
  {
    title: 'CP2: Advanced Data Structures',
    slug: 'cp2-advanced-data-structures',
    description: 'Dive deep into complex data structures and algorithms to solve challenging problems.',
    image: 'https://picsum.photos/600/400?random=2',
    hint: 'data network',
    icon: Zap,
    difficulty: 'Advanced',
    duration: '12 weeks',
  },
  {
    title: 'Software Engineering Principles',
    slug: 'software-engineering-principles',
    description: 'Learn the principles of building robust, scalable, and maintainable software systems.',
    image: 'https://picsum.photos/600/400?random=3',
    hint: 'team collaboration',
    icon: BookOpen,
    difficulty: 'Intermediate',
    duration: '10 weeks',
  },
  {
    title: 'Industrial Design Workshop',
    slug: 'industrial-design-workshop',
    description: 'From concept to prototype, explore the world of product design and innovation.',
    image: 'https://picsum.photos/600/400?random=4',
    hint: 'product sketch',
    icon: BookOpen,
    difficulty: 'Intermediate',
    duration: '6 weeks',
  },
  {
    title: 'Cybersecurity Defense',
    slug: 'cybersecurity-defense',
    description: 'Understand modern threats and learn to defend systems against cyber attacks.',
    image: 'https://picsum.photos/600/400?random=5',
    hint: 'cyber security',
    icon: Shield,
    difficulty: 'Advanced',
    duration: '14 weeks',
  },
];

export function FeaturedCourses() {
  return (
    <section id="featured-courses" className="w-full py-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-accent/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-accent/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/5 via-transparent to-transparent rounded-full animate-pulse delay-500" />
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 via-transparent to-background/50 pointer-events-none" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/20 rounded-full animate-float"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + i}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 mb-12 text-center">
        <div className="inline-block group">
          <h2 className="text-3xl md:text-5xl font-headline font-bold bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent gradient-shift">
            Featured Courses
          </h2>
          <div className="mt-2 h-1 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Expand your knowledge with our top-rated programs designed to shape tomorrow's innovators.
        </p>
      </div>

      <Carousel 
        opts={{ align: 'start', loop: true }} 
        className="w-full group/carousel"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {courses.map((course, index) => (
            <CarouselItem 
              key={index} 
              className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 animate-fade-in-up"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              <div className="p-1 h-full">
                <Card className="h-full flex flex-col overflow-hidden relative group/card cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  {/* wrap card content with Link */}
                  <Link href={`/courses/${course.slug}`} className="absolute inset-0 z-30" aria-label={`View ${course.title}`} />
                  {/* Card background with gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-accent/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                  
                  {/* Border gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent/50 to-accent/20 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" style={{ padding: '1px' }}>
                    <div className="w-full h-full bg-background rounded-lg" />
                  </div>
                  
                  <CardHeader className="p-0 relative z-10">
                    <div className="relative h-56 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10" />
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover transition-all duration-700 group-hover/card:scale-110 group-hover/card:rotate-1"
                        data-ai-hint={course.hint}
                      />
                      
                      {/* Course metadata overlay */}
                      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                          <course.icon className="w-3 h-3" />
                          <span>{course.difficulty}</span>
                        </div>
                        <div className="bg-accent/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-accent-foreground font-medium">
                          {course.duration}
                        </div>
                      </div>
                      
                      {/* Floating accent decorations */}
                      <div className="absolute top-4 right-4 w-3 h-3 bg-accent rounded-full opacity-60 group-hover/card:opacity-100 transition-all duration-300 animate-pulse" />
                      <div className="absolute top-6 right-6 w-2 h-2 bg-accent/50 rounded-full opacity-60 group-hover/card:opacity-100 transition-all duration-300 delay-100 animate-pulse" />
                      <div className="absolute top-8 right-8 w-1 h-1 bg-accent/30 rounded-full opacity-60 group-hover/card:opacity-100 transition-all duration-300 delay-200 animate-pulse" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow p-6 relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <CardTitle className="font-headline text-xl group-hover/card:text-accent transition-colors duration-300 relative flex-1">
                        {course.title}
                        <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-accent to-accent/50 group-hover/card:w-full transition-all duration-500" />
                      </CardTitle>
                      <div className="ml-3 p-2 rounded-full bg-accent/10 group-hover/card:bg-accent group-hover/card:text-accent-foreground transition-all duration-300">
                        <course.icon className="w-4 h-4 text-accent group-hover/card:text-accent-foreground" />
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed group-hover/card:text-foreground/80 transition-colors duration-300 mb-4">
                      {course.description}
                    </p>
                    
                    {/* Course stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground/70">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-accent" />
                        <span>Interactive</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Certified</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-6 pt-0 relative z-10">
                    <Button 
                      variant="ghost" 
                      className="group/button relative overflow-hidden border border-transparent hover:border-accent/20 transition-all duration-300 hover:bg-accent/5 z-40"
                    >
                      <span className="relative z-10 text-accent group-hover/button:text-accent-foreground transition-colors duration-300">
                        Learn More
                      </span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover/button:translate-x-1 group-hover/button:text-accent-foreground" />
                      
                      {/* Button background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent to-accent/0 translate-x-[-100%] group-hover/button:translate-x-0 transition-transform duration-500" />
                    </Button>
                  </CardFooter>
                  
                  {/* Card shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="hidden sm:flex -left-12 bg-background/80 backdrop-blur-sm border-accent/20 hover:bg-accent hover:border-accent text-accent hover:text-accent-foreground transition-all duration-300 shadow-lg hover:shadow-accent/25" />
        <CarouselNext className="hidden sm:flex -right-12 bg-background/80 backdrop-blur-sm border-accent/20 hover:bg-accent hover:border-accent text-accent hover:text-accent-foreground transition-all duration-300 shadow-lg hover:shadow-accent/25" />
      </Carousel>
    </section>
  );
}
