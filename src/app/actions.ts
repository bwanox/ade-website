'use server';

import { summarizeNews, SummarizeNewsInput } from '@/ai/flows/ai-news-summaries';
import { getPersonalizedClubRecommendations, PersonalizedClubRecommendationsInput } from '@/ai/flows/personalized-club-recommendations';
import { z } from 'zod';

const NewsSchema = z.object({
  articleContent: z.string().min(50, 'Article content must be at least 50 characters.'),
});

const ClubSchema = z.object({
    interests: z.string().min(3, 'Please enter at least one interest.'),
    profile: z.string().optional(),
})

export async function summarizeNewsAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = NewsSchema.safeParse({
      articleContent: formData.get('articleContent'),
    });

    if (!validatedFields.success) {
      return {
        ...prevState,
        error: validatedFields.error.flatten().fieldErrors.articleContent?.[0],
      };
    }
    
    const input: SummarizeNewsInput = {
      articleContent: validatedFields.data.articleContent,
    };

    const result = await summarizeNews(input);
    return { ...result, error: null };
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

export async function getClubRecommendationsAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = ClubSchema.safeParse({
      interests: formData.get('interests'),
      profile: formData.get('profile'),
    });

    if (!validatedFields.success) {
      return {
        ...prevState,
        error: validatedFields.error.flatten().fieldErrors.interests?.[0],
      };
    }

     const input: PersonalizedClubRecommendationsInput = {
      interests: validatedFields.data.interests,
      profile: validatedFields.data.profile || '',
    };
    
    const result = await getPersonalizedClubRecommendations(input);
    return { ...result, error: null };
  } catch (error) {
    console.error(error);
    return {
      ...prevState,
      error: 'Could not fetch recommendations. The AI model might be busy. Please try again later.',
    }
  }
}
