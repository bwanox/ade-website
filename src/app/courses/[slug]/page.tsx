import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCourseBySlug, courses } from '@/lib/course-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

export const dynamicParams = true;

export function generateStaticParams() {
  return courses.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: 'Course Not Found' };
  return {
    title: course.title,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: [course.heroImage || ''],
    },
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return notFound();
  const Icon = course.icon;
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background" />
        <div className="absolute top-1/3 -left-32 w-[40rem] h-[40rem] bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-[50rem] h-[50rem] bg-accent/5 rounded-full blur-3xl" />
      </div>
      <section className="relative pt-16 md:pt-24 pb-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 text-accent text-xs font-medium">
                <Icon className="w-4 h-4" />
                <span>{course.difficulty}</span>
                <span className="text-muted-foreground">• Year {course.year}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent gradient-shift">
                {course.title}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground max-w-prose">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Badge variant="secondary" className="backdrop-blur border border-accent/20">{course.duration}</Badge>
                <Badge variant="outline" className="border-accent/30">2 Semesters</Badge>
                <Badge variant="outline" className="border-accent/30">12 Modules</Badge>
              </div>
            </div>
            <div className="relative h-72 md:h-96 rounded-xl overflow-hidden group shadow-2xl animate-fade-in-up [animation-delay:150ms]">
              <Image fill src={course.heroImage || 'https://picsum.photos/1200/600'} alt={course.title} className="object-cover transition-transform duration-[4000ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs">
                <div className="px-2 py-1 rounded bg-black/40 backdrop-blur text-white/90">Immersive Learning</div>
                <div className="px-2 py-1 rounded bg-black/40 backdrop-blur text-white/90">Project Based</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container max-w-6xl mx-auto px-4">
          <Tabs defaultValue={course.semesters[0].id} className="w-full">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-background/60 backdrop-blur border border-accent/20">
                {course.semesters.map(s => (
                  <TabsTrigger key={s.id} value={s.id} className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                    {s.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {course.semesters.map(semester => (
              <TabsContent key={semester.id} value={semester.id} className="space-y-8 focus-visible:outline-none">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {semester.modules.map((m, i) => {
                    return (
                      <Card key={m.id} className="group relative overflow-hidden border-accent/20 hover:border-accent/50 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <CardHeader className="pb-2">
                          <h3 className="font-headline font-semibold tracking-tight">{m.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-[20rem]">{m.summary}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Accordion type="multiple" defaultValue={["lesson"]} className="w-full">
                            <AccordionItem value="lesson">
                              <AccordionTrigger className="text-sm">Lesson</AccordionTrigger>
                              <AccordionContent>
                                {m.resources.lesson ? (
                                  <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-accent/10">
                                    <div className="flex items-center gap-2 text-sm">
                                      <FileText className="w-4 h-4 text-accent" />
                                      <span>{m.resources.lesson.title}</span>
                                      {m.resources.lesson.size && <span className="text-xs text-muted-foreground">{m.resources.lesson.size}</span>}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                        <a href={m.resources.lesson.url} target="_blank" rel="noopener noreferrer">View</a>
                                      </Button>
                                      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                        <a href={m.resources.lesson.url} download>Download</a>
                                      </Button>
                                    </div>
                                  </div>
                                ) : <div className="text-xs text-muted-foreground">No lesson uploaded</div>}
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="exercises">
                              <AccordionTrigger className="text-sm">Exercises ({m.resources.exercises?.length || 0})</AccordionTrigger>
                              <AccordionContent className="space-y-2">
                                {m.resources.exercises?.length ? m.resources.exercises.map((r, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-accent/10">
                                    <div className="flex items-center gap-2 text-sm">
                                      <FileText className="w-4 h-4 text-accent" />
                                      <span>{r.title}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                        <a href={r.url} target="_blank" rel="noopener noreferrer">View</a>
                                      </Button>
                                      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                        <a href={r.url} download>Download</a>
                                      </Button>
                                    </div>
                                  </div>
                                )) : <div className="text-xs text-muted-foreground">No exercises</div>}
                              </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="exams">
                              <AccordionTrigger className="text-sm">Past Exams ({m.resources.pastExams?.length || 0})</AccordionTrigger>
                              <AccordionContent className="space-y-2">
                                {m.resources.pastExams?.length ? m.resources.pastExams.map((r, idx) => (
                                  <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-accent/10">
                                    <div className="flex items-center gap-2 text-sm">
                                      <FileText className="w-4 h-4 text-accent" />
                                      <span>{r.title}</span>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                        <a href={r.url} target="_blank" rel="noopener noreferrer">View</a>
                                      </Button>
                                      <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                                        <a href={r.url} download>Download</a>
                                      </Button>
                                    </div>
                                  </div>
                                )) : <div className="text-xs text-muted-foreground">No exams</div>}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </div>
  );
}
