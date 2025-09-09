'use server';

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
  image: z.string().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

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


/**
 * Sends a message to the AI and gets a response.
 */
export async function chat(
  history: Message[],
  message: string
): Promise<ChatOutput> {

  const isImagePrompt = (text: string) => {
    const keywords = ['draw', 'generate', 'image', 'picture', 'photo', 'illustration'];
    return keywords.some((word) => text.toLowerCase().includes(word));
  };
  
  const modelHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }]
  }));

  if (isImagePrompt(message)) {
    // ---- IMAGE MODE ----
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash-latest',
      prompt: `${history.map(m => `${m.role}: ${m.content}`).join('\n')}\nuser: ${message}`,
      config: { responseMimeType: "image/png" },
    });
    
    let reply = '🖼️ Here’s your image:';
    let image: string | undefined;

    if (output) {
      const {media, text} = output;
      if (media?.url) image = media.url;
      if (text) reply = text;
    }

    return { reply, image };
  } else {
    // ---- CHAT MODE ----
     const { text } = await ai.generate({
        prompt: `${history.map(m => `${m.role}: ${m.content}`).join('\n')}`,
    });
    return { reply: text || '🤖 No response' };
  }
}
