'use server';
/**
 * @fileOverview AI-powered personalized club recommendations for students.
 *
 * - getPersonalizedClubRecommendations - A function that generates club recommendations based on user interests.
 * - PersonalizedClubRecommendationsInput - The input type for the getPersonalizedClubRecommendations function.
 * - PersonalizedClubRecommendationsOutput - The return type for the getPersonalizedClubRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedClubRecommendationsInputSchema = z.object({
  interests: z.string().describe('A comma-separated list of the student\'s interests.'),
  profile: z.string().describe('A description of the student\'s profile and background.'),
});
export type PersonalizedClubRecommendationsInput = z.infer<typeof PersonalizedClubRecommendationsInputSchema>;

const PersonalizedClubRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      clubName: z.string().describe('The name of the recommended club.'),
      description: z.string().describe('A short description of the club and why it is recommended.'),
    })
  ).describe('A list of personalized club recommendations.'),
});
export type PersonalizedClubRecommendationsOutput = z.infer<typeof PersonalizedClubRecommendationsOutputSchema>;

export async function getPersonalizedClubRecommendations(input: PersonalizedClubRecommendationsInput): Promise<PersonalizedClubRecommendationsOutput> {
  return personalizedClubRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedClubRecommendationsPrompt',
  input: {schema: PersonalizedClubRecommendationsInputSchema},
  output: {schema: PersonalizedClubRecommendationsOutputSchema},
  prompt: `You are an AI assistant that provides personalized club recommendations to university students.

  Based on the student's interests and profile, recommend a few clubs that they might be interested in joining. Explain why each club is a good fit for them.

  Interests: {{{interests}}}
  Profile: {{{profile}}}

  Format your output as a list of club recommendations.
  `,
});

const personalizedClubRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedClubRecommendationsFlow',
    inputSchema: PersonalizedClubRecommendationsInputSchema,
    outputSchema: PersonalizedClubRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
