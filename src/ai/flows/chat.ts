'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatHistorySchema = z.array(MessageSchema);

const ChatInputSchema = z.object({
  history: ChatHistorySchema,
  message: z.string(),
});

const ChatOutputSchema = z.object({
  reply: z.string(),
});

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
  }
);

export async function chat(
  history: z.infer<typeof ChatHistorySchema>,
  message: string
): Promise<z.infer<typeof ChatOutputSchema>> {
  const {output} = await chatPrompt({history, message});
  return output!;
}
