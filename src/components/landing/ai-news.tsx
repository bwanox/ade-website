'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { summarizeNewsAction } from '@/app/actions';
import { Loader2, Newspaper, Calendar, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';

const initialArticles = [
  {
    id: 1,
    headline: 'Annual Tech Symposium Breaks Attendance Records',
    summary: 'This year\'s symposium saw over 2,000 students and professionals gather to discuss the future of AI and robotics.',
    image: 'https://picsum.photos/800/600?random=6',
    hint: 'conference crowd',
    category: 'Events',
    date: 'Aug 28, 2025',
    readTime: '3 min read',
    trending: true,
  },
  {
    id: 2,
    headline: 'NexusConnect Launches New Mentorship Program',
    summary: 'A new peer-to-peer mentorship program aims to connect senior students with newcomers for a smoother transition into university life.',
    image: 'https://picsum.photos/800/600?random=7',
    hint: 'students talking',
    category: 'Programs',
    date: 'Aug 25, 2025',
    readTime: '2 min read',
    trending: false,
  },
  {
    id: 3,
    headline: 'Humanitarian Club\'s Fundraiser a Major Success',
    summary: 'The recent charity bake sale and auction raised over $5,000 for local community shelters, showcasing incredible student generosity.',
    image: 'https://picsum.photos/800/600?random=8',
    hint: 'charity event',
    category: 'Campus Life',
    date: 'Aug 22, 2025',
    readTime: '4 min read',
    trending: true,
  },
];

export function AiNews() {
  const [state, formAction] = useFormState(summarizeNewsAction, { summary: '', headline: '' });
  const [articleContent, setArticleContent] = useState('After weeks of intense competition, the university\'s robotics team, the "Circuit Breakers," has clinched the top spot at the National Robotics Championship. Their winning creation, an autonomous drone capable of navigating complex obstacle courses, impressed judges with its innovative design and flawless execution. The team credits their success to countless hours of hard work and the collaborative spirit fostered by the university\'s robotics club. They will now advance to the international competition next month.');

  return (
    <section id="news" className="w-full py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-gradient-to-r from-accent/12 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-gradient-to-l from-accent/8 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-accent/6 via-transparent to-transparent rounded-full animate-pulse delay-500" />
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/8 via-transparent to-accent/12 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-background/40 pointer-events-none" />
      
      {/* News ticker effect */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
      
      <div className="relative z-10 mb-16 text-center">
        <div className="inline-block group">
          <h2 className="text-3xl md:text-5xl font-headline font-bold bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent gradient-shift">
            News & Announcements
          </h2>
          <div className="mt-3 h-1 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Stay updated with the latest happenings on campus and discover what's making headlines in our community.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground/70">
          <TrendingUp className="w-4 h-4 text-accent" />
          <span>Breaking stories and campus updates</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {initialArticles.map((article, index) => (
          <Card 
            key={article.id} 
            className="overflow-hidden group/card flex flex-col cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 relative animate-fade-in-up"
            style={{
              animationDelay: `${index * 150}ms`,
              animationFillMode: 'both'
            }}
          >
            {/* Card background with gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/85 to-background/90 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/5 to-accent/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
            
            {/* Border gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-accent/50 to-accent/20 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" style={{ padding: '1px' }}>
              <div className="w-full h-full bg-background rounded-lg" />
            </div>
            
            <CardHeader className="p-0 relative z-10">
              <div className="relative h-52 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10" />
                <Image
                  src={article.image}
                  alt={article.headline}
                  fill
                  className="object-cover transition-all duration-700 group-hover/card:scale-110 group-hover/card:rotate-1"
                  data-ai-hint={article.hint}
                />
                
                {/* Article metadata overlay */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  <Badge 
                    variant="secondary" 
                    className="bg-black/60 backdrop-blur-sm text-white border-white/20 hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
                  >
                    {article.category}
                  </Badge>
                  {article.trending && (
                    <div className="flex items-center gap-1 bg-accent/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-accent-foreground">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trending</span>
                    </div>
                  )}
                </div>
                
                {/* Floating accent decorations */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-accent rounded-full opacity-60 group-hover/card:opacity-100 transition-all duration-300 animate-pulse" />
                <div className="absolute top-6 right-6 w-2 h-2 bg-accent/50 rounded-full opacity-60 group-hover/card:opacity-100 transition-all duration-300 delay-100 animate-pulse" />
              </div>
            </CardHeader>
            
            <CardContent className="p-6 flex-grow relative z-10">
              <h3 className="font-headline text-lg font-semibold mb-3 group-hover/card:text-accent transition-colors duration-300 relative leading-tight">
                {article.headline}
                <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-accent to-accent/50 group-hover/card:w-full transition-all duration-500" />
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 group-hover/card:text-foreground/80 transition-colors duration-300">
                {article.summary}
              </p>
              
              {/* Article metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="p-6 pt-0 relative z-10">
              <Button 
                variant="ghost" 
                size="sm"
                className="group/button relative overflow-hidden border border-transparent hover:border-accent/20 transition-all duration-300 hover:bg-accent/5 w-full"
              >
                <span className="relative z-10 text-accent group-hover/button:text-accent-foreground transition-colors duration-300 font-medium">
                  Read More
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent to-accent/0 translate-x-[-100%] group-hover/button:translate-x-0 transition-transform duration-500" />
              </Button>
            </CardFooter>
            
            {/* Card shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover/card:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
          </Card>
        ))}
      </div>
      
      <div className="mt-16 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-block group">
            <h3 className="text-2xl md:text-4xl font-headline font-bold bg-gradient-to-r from-foreground via-accent to-foreground bg-clip-text text-transparent gradient-shift">
              AI News Summarizer
            </h3>
            <div className="mt-2 h-1 bg-gradient-to-r from-transparent via-accent to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          </div>
          <p className="mt-4 text-md text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Paste any article below to get a quick summary and headline from our AI-powered analysis tool.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground/70">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Powered by advanced AI technology</span>
          </div>
        </div>
        
        <Card className="relative overflow-hidden group/ai-card">
          {/* AI Card background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-accent/10 to-accent/5 opacity-50" />
          
          {/* Border gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent/30 via-accent/60 to-accent/30 rounded-lg opacity-0 group-hover/ai-card:opacity-100 transition-opacity duration-500" style={{ padding: '2px' }}>
            <div className="w-full h-full bg-background rounded-lg" />
          </div>
          
          <CardContent className="p-8 relative z-10">
            <form action={formAction} className="space-y-6">
              <div className="relative">
                <Textarea
                  name="articleContent"
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  placeholder="Paste article content here..."
                  rows={8}
                  className="bg-background/50 backdrop-blur-sm border-accent/20 focus:border-accent transition-all duration-300 resize-none"
                />
                <div className="absolute top-3 right-3 text-xs text-muted-foreground/50">
                  {articleContent.length} characters
                </div>
              </div>
              
              <div className="flex justify-center">
                <SubmitButton />
              </div>
            </form>
            
            {(state.headline || state.summary) && (
              <Alert className="mt-8 border-accent/50 bg-accent/5 backdrop-blur-sm relative overflow-hidden group/alert">
                <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10" />
                <Newspaper className="h-5 w-5 text-accent relative z-10" />
                <div className="relative z-10">
                  <AlertTitle className="font-headline text-lg text-accent mb-2">
                    {state.headline}
                  </AlertTitle>
                  <AlertDescription className="text-foreground/80 leading-relaxed">
                    {state.summary}
                  </AlertDescription>
                </div>
                
                {/* Alert shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover/alert:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
              </Alert>
            )}
            
            {state.error && (
              <Alert variant="destructive" className="mt-8 backdrop-blur-sm">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          {/* Card shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover/ai-card:translate-x-[100%] transition-transform duration-1500 pointer-events-none" />
        </Card>
      </div>
    </section>
  );
}

function SubmitButton() {
    const { pending } = useFormState(summarizeNewsAction, { summary: '', headline: '' });
    return (
        <Button 
          type="submit" 
          disabled={pending} 
          size="lg"
          className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 border border-accent/20 hover:border-accent/40 backdrop-blur-sm relative overflow-hidden group/submit px-8"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin relative z-10" />
              <span className="relative z-10">Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4 relative z-10 group-hover/submit:rotate-12 transition-transform duration-300" />
              <span className="relative z-10 font-semibold">Summarize with AI</span>
            </>
          )}
          
          {/* Button background effect */}
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/submit:translate-x-0 transition-transform duration-500" />
        </Button>
    );
}
