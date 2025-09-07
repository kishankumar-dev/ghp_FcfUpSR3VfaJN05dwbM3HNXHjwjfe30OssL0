'use server';

/**
 * @fileOverview A flow to generate AI insights from performance trends and usage statistics.
 *
 * - generateAIInsights - A function that generates AI insights.
 * - GenerateAIInsightsInput - The input type for the generateAIInsights function.
 * - GenerateAIInsightsOutput - The return type for the generateAIInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAIInsightsInputSchema = z.object({
  performanceTrends: z.string().describe('AI performance trends data in JSON format.'),
  usageStatistics: z.string().describe('AI usage statistics data in JSON format.'),
});
export type GenerateAIInsightsInput = z.infer<typeof GenerateAIInsightsInputSchema>;

const GenerateAIInsightsOutputSchema = z.object({
  insights: z.string().describe('A summary of patterns of interest and notable outliers from the AI performance trends and usage statistics.'),
});
export type GenerateAIInsightsOutput = z.infer<typeof GenerateAIInsightsOutputSchema>;

export async function generateAIInsights(input: GenerateAIInsightsInput): Promise<GenerateAIInsightsOutput> {
  return generateAIInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAIInsightsPrompt',
  input: {schema: GenerateAIInsightsInputSchema},
  output: {schema: GenerateAIInsightsOutputSchema},
  prompt: `You are an AI insights generator. Analyze the provided AI performance trends and usage statistics to identify patterns of interest and notable outliers.

AI Performance Trends: {{{performanceTrends}}}
AI Usage Statistics: {{{usageStatistics}}}

Generate a concise summary of key insights.`,
});

const generateAIInsightsFlow = ai.defineFlow(
  {
    name: 'generateAIInsightsFlow',
    inputSchema: GenerateAIInsightsInputSchema,
    outputSchema: GenerateAIInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
