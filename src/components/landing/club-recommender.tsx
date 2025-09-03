'use client';

import { useActionState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { getClubRecommendationsAction } from '@/app/actions';
import { Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function ClubRecommender() {
  const [state, formAction, pending] = useActionState(getClubRecommendationsAction, { recommendations: [] });

  return (
    <section id="club-recommender" className="w-full">
      <Card className="bg-gradient-to-br from-primary to-slate-800 text-primary-foreground">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl md:text-4xl text-white">Discover Your Passion</CardTitle>
          <CardDescription className="text-lg text-gray-300 mt-2">Let our AI help you find the perfect student club.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6 max-w-2xl mx-auto">
            <div className="space-y-2">
              <label htmlFor="interests" className="font-semibold text-gray-300">Your Interests</label>
              <Input
                id="interests"
                name="interests"
                placeholder="e.g., coding, hiking, chess, painting"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-accent"
                required
              />
            </div>
            <div className="space-y-2">
               <label htmlFor="profile" className="font-semibold text-gray-300">Tell us about yourself (optional)</label>
              <Textarea
                id="profile"
                name="profile"
                placeholder="e.g., I'm a first-year computer science student who loves the outdoors."
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:ring-accent"
                rows={3}
              />
            </div>
            <div className="text-center">
              <SubmitButton pending={pending} />
            </div>
          </form>

          {state.recommendations && state.recommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="text-center font-headline text-2xl text-white mb-4">Here are your recommendations:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.recommendations.map((rec: { clubName: string; description: string }, index: number) => (
                  <Card key={index} className="bg-primary/80 border-white/20 text-white">
                    <CardHeader>
                      <CardTitle className="font-headline text-accent">{rec.clubName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">{rec.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
           {state.error && (
              <Alert variant="destructive" className="mt-6 bg-red-900/50 border-red-500/50 text-white">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
    </section>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
    return (
        <Button type="submit" size="lg" disabled={pending} className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
            {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
            Find My Clubs
        </Button>
    );
}
