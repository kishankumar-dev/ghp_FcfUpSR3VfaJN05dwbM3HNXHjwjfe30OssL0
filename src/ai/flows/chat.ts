'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

export const ChatHistorySchema = z.array(MessageSchema);

const ChatInputSchema = z.object({
  history: ChatHistorySchema,
  message: z.string(),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  reply: z.string(),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

const chatPrompt = ai.definePrompt(
  {
    name: 'chatPrompt',
    input: {schema: ChatInputSchema},
    output: {schema: ChatOutputSchema},
    prompt: `You are a helpful AI assistant.

Continue the following conversation.

{{#each history}}
### {{role}}
{{content}}
{{/each}}

### user
{{message}}`,
  },
  async (input) => {
    const {output} = await ai.generate(input);
    return {reply: output.text!};
  }
);

export async function chat(
  history: z.infer<typeof ChatHistorySchema>,
  message: string
): Promise<ChatOutput> {
  const result = await chatPrompt({history, message});
  return result;
}
