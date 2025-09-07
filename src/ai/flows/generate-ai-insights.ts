'use server';

import { z } from 'genkit';
import { GoogleGenAI } from '@google/genai';

const GenerateAIInsightsInputSchema = z.object({
  performanceTrends: z.string(),
  usageStatistics: z.string(),
});
export type GenerateAIInsightsInput = z.infer<typeof GenerateAIInsightsInputSchema>;

const GenerateAIInsightsOutputSchema = z.object({
  insights: z.string(),
});
export type GenerateAIInsightsOutput = z.infer<typeof GenerateAIInsightsOutputSchema>;

export async function generateAIInsights(
  input: GenerateAIInsightsInput
): Promise<GenerateAIInsightsOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('❌ GEMINI_API_KEY is missing in .env');

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an AI insights generator. Analyze the provided AI performance trends and usage statistics to identify patterns of interest and notable outliers.

AI Performance Trends: ${input.performanceTrends}
AI Usage Statistics: ${input.usageStatistics}

Generate a concise summary of key insights.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });

  return { insights: response.text || '⚠️ No insights generated' };
}
