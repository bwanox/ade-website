'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { summarizeNewsAction } from '@/app/actions';
import { Loader2, Newspaper } from 'lucide-react';
import { Badge } from '../ui/badge';

const initialArticles = [
  {
    id: 1,
    headline: 'Annual Tech Symposium Breaks Attendance Records',
    summary: 'This year\'s symposium saw over 2,000 students and professionals gather to discuss the future of AI and robotics.',
    image: 'https://picsum.photos/800/600?random=6',
    hint: 'conference crowd',
  },
  {
    id: 2,
    headline: 'NexusConnect Launches New Mentorship Program',
    summary: 'A new peer-to-peer mentorship program aims to connect senior students with newcomers for a smoother transition into university life.',
    image: 'https://picsum.photos/800/600?random=7',
    hint: 'students talking',
  },
  {
    id: 3,
    headline: 'Humanitarian Club\'s Fundraiser a Major Success',
    summary: 'The recent charity bake sale and auction raised over $5,000 for local community shelters, showcasing incredible student generosity.',
    image: 'https://picsum.photos/800/600?random=8',
    hint: 'charity event',
  },
];

export function AiNews() {
  const [state, formAction] = useFormState(summarizeNewsAction, { summary: '', headline: '' });
  const [articleContent, setArticleContent] = useState('After weeks of intense competition, the university\'s robotics team, the "Circuit Breakers," has clinched the top spot at the National Robotics Championship. Their winning creation, an autonomous drone capable of navigating complex obstacle courses, impressed judges with its innovative design and flawless execution. The team credits their success to countless hours of hard work and the collaborative spirit fostered by the university\'s robotics club. They will now advance to the international competition next month.');

  return (
    <section id="news" className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-headline font-bold">News & Announcements</h2>
        <p className="mt-2 text-lg text-muted-foreground">Stay updated with the latest happenings on campus.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {initialArticles.map((article) => (
          <Card key={article.id} className="overflow-hidden group flex flex-col">
            <CardHeader className="p-0">
               <div className="relative h-52 w-full">
                <Image
                  src={article.image}
                  alt={article.headline}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={article.hint}
                />
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-grow">
              <h3 className="font-headline text-lg font-semibold mb-2">{article.headline}</h3>
              <p className="text-muted-foreground text-sm">{article.summary}</p>
            </CardContent>
            <CardFooter className="p-6 pt-0">
               <Badge variant="secondary">Campus Life</Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-16">
         <div className="mb-8 text-center">
          <h3 className="text-2xl md:text-3xl font-headline font-bold">AI News Summarizer</h3>
          <p className="mt-2 text-md text-muted-foreground">Paste any article below to get a quick summary and headline from our AI.</p>
        </div>
        <Card className="bg-secondary/50 dark:bg-primary/50">
          <CardContent className="p-6">
            <form action={formAction} className="space-y-4">
              <Textarea
                name="articleContent"
                value={articleContent}
                onChange={(e) => setArticleContent(e.target.value)}
                placeholder="Paste article content here..."
                rows={8}
              />
              <SubmitButton />
            </form>
            {(state.headline || state.summary) && (
              <Alert className="mt-6 border-accent">
                 <Newspaper className="h-4 w-4" />
                <AlertTitle className="font-headline text-lg">{state.headline}</AlertTitle>
                <AlertDescription className="mt-2">
                  {state.summary}
                </AlertDescription>
              </Alert>
            )}
             {state.error && (
              <Alert variant="destructive" className="mt-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function SubmitButton() {
    const { pending } = useFormState(summarizeNewsAction, { summary: '', headline: '' });
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Summarize
        </Button>
    );
}
