'use server';

/**
 * @fileOverview AI-powered news summarization flow.
 *
 * - summarizeNews - A function that generates short summaries for news articles.
 * - SummarizeNewsInput - The input type for the summarizeNews function.
 * - SummarizeNewsOutput - The return type for the summarizeNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNewsInputSchema = z.object({
  articleContent: z
    .string()
    .describe('The full content of the news article to summarize.'),
});
export type SummarizeNewsInput = z.infer<typeof SummarizeNewsInputSchema>;

const SummarizeNewsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A short, AI-generated summary of the news article.'),
  headline: z.string().describe('A catchy, AI-generated headline for the article.'),
});
export type SummarizeNewsOutput = z.infer<typeof SummarizeNewsOutputSchema>;

export async function summarizeNews(input: SummarizeNewsInput): Promise<SummarizeNewsOutput> {
  return summarizeNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNewsPrompt',
  input: {schema: SummarizeNewsInputSchema},
  output: {schema: SummarizeNewsOutputSchema},
  prompt: `You are an AI assistant that summarizes news articles and generates catchy headlines.

  Article Content: {{{articleContent}}}

  Summary:
  Headline: `,
});

const summarizeNewsFlow = ai.defineFlow(
  {
    name: 'summarizeNewsFlow',
    inputSchema: SummarizeNewsInputSchema,
    outputSchema: SummarizeNewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
