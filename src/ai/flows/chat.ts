'use server';

import { z } from 'genkit';
import { GoogleGenAI, Modality } from '@google/genai';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string(),
  image: z.string().optional(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(
  history: z.infer<typeof MessageSchema>[],
  message: string
): Promise<ChatOutput> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('❌ GEMINI_API_KEY is missing in .env');

  const ai = new GoogleGenAI({ apiKey });

  const isImagePrompt = (text: string) => {
    const keywords = ['draw', 'generate', 'image', 'picture', 'photo', 'illustration'];
    return keywords.some((word) => text.toLowerCase().includes(word));
  };

  if (isImagePrompt(message)) {
    // ---- IMAGE MODE ----
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: { responseModalities: [Modality.TEXT, Modality.IMAGE] },
    });

    let reply = '';
    let image: string | undefined;

    const parts = response?.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.text) reply += part.text + '\n';
      if (part.inlineData?.data) {
        image = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    return { reply: reply.trim() || '🖼️ Here’s your image:', image };
  } else {
    // ---- CHAT MODE ----
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: message }] }],
    });

    return { reply: response.text || '🤖 No response' };
  }
}