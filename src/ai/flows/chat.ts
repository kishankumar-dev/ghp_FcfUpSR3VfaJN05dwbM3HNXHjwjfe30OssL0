// 'use server';
// /**
//  * @fileOverview A flow to handle chat interactions.
//  *
//  * - chat - The main chat function.
//  * - ChatInput - The input type for the chat function.
//  * - ChatOutput - The return type for the chat function.
//  */

// import { ai } from '@/ai/genkit';
// import { z } from 'genkit';

// const MessageSchema = z.object({
//   role: z.enum(['user', 'model']),
//   content: z.string(),
// });

// const ChatInputSchema = z.object({
//   history: z.array(MessageSchema),
//   message: z.string().describe('The user\'s current message.'),
// });
// export type ChatInput = z.infer<typeof ChatInputSchema>;

// const ChatOutputSchema = z.object({
//   reply: z.string().describe('The AI\'s response to the user.'),
// });
// export type ChatOutput = z.infer<typeof ChatOutputSchema>;

// export async function chat(history: z.infer<typeof MessageSchema>[], message: string): Promise<ChatOutput> {
//   const input: ChatInput = { history, message };
//   return chatFlow(input);
// }

// const chatFlow = ai.defineFlow(
//   {
//     name: 'chatFlow',
//     inputSchema: ChatInputSchema,
//     outputSchema: ChatOutputSchema,
//   },
//   async (input) => {
//     const prompt = `
// You are a helpful AI assistant integrated into the NewGen AI dashboard.
// Your responses should be helpful, accurate, and use markdown for formatting when appropriate.
// Keep your responses concise and to the point.

// Conversation History:
// {{#each history}}
// - {{role}}: {{{content}}}
// {{/each}}

// User's new message:
// {{{message}}}
// `;
    
//     const llmResponse = await ai.generate({
//       prompt,
//       model: 'googleai/gemini-2.5-flash',
//       history: input.history,
//       input: {
//         message: input.message,
//         history: input.history,
//       },
//     });

//     const text = llmResponse.text;
//     return { reply: text };
//   }
// );


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
  const apiKey = process.env.GEMINI_API_KEY; // 👈 server-side .env
  if (!apiKey) throw new Error('❌ GEMINI_API_KEY is missing in .env');

  const ai = new GoogleGenAI({ apiKey });

  // Simple heuristic: check if it's an image prompt
  const isImagePrompt = (text: string) => {
    const keywords = ['draw', 'generate', 'image', 'picture', 'photo', 'illustration'];
    return keywords.some((word) => text.toLowerCase().includes(word));
  };

  if (isImagePrompt(message)) {
    // ---- IMAGE MODE ----
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: message,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    let reply = '';
    let image: string | undefined;

    for (const part of response.candidates[0].content.parts) {
      if (part.text) reply += part.text + '\n';
      else if (part.inlineData) {
        image = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    return { reply: reply || '🖼️ Here’s your image:', image };
  } else {
    // ---- CHAT MODE ----
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: message,
    });

    return { reply: response.text || '🤖 No response' };
  }
}
