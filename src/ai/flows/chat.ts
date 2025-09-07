'use server';
/**
 * @fileOverview A flow to handle chat interactions.
 *
 * - chat - The main chat function.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string().describe('The user\'s current message.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string().describe('The AI\'s response to the user.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(history: z.infer<typeof MessageSchema>[], message: string): Promise<ChatOutput> {
  const input: ChatInput = { history, message };
  return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const prompt = `
You are a helpful AI assistant integrated into the NewGen AI dashboard.
Your responses should be helpful, accurate, and use markdown for formatting when appropriate.
Keep your responses concise and to the point.

Conversation History:
{{#each history}}
- {{role}}: {{{content}}}
{{/each}}

User's new message:
{{{message}}}
`;
    
    const llmResponse = await ai.generate({
      prompt,
      model: 'googleai/gemini-2.5-flash',
      history: input.history,
      input: {
        message: input.message,
        history: input.history,
      },
    });

    const text = llmResponse.text;
    return { reply: text };
  }
);
