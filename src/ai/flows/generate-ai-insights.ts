'use server';

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const GenerateAIInsightsInputSchema = z.object({
  performanceTrends: z.string(),
  usageStatistics: z.string(),
});

const GenerateAIInsightsOutputSchema = z.object({
  insights: z.string(),
});

const insightsPrompt = ai.definePrompt({
  name: 'insightsPrompt',
  input: { schema: GenerateAIInsightsInputSchema },
  output: { schema: GenerateAIInsightsOutputSchema },
  prompt: `You are an AI insights generator. Analyze the provided AI performance trends and usage statistics to identify patterns of interest and notable outliers.

AI Performance Trends: {{{performanceTrends}}}
AI Usage Statistics: {{{usageStatistics}}}

Generate a concise summary of key insights.`,
});

export async function generateAIInsights(input: {
  performanceTrends: string;
  usageStatistics: string;
}): Promise<{ insights: string }> {
  const { output } = await insightsPrompt(input);
  return output!;
}
