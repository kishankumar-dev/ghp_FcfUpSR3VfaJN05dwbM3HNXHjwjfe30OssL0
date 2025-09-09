'use server';

import { z } from 'genkit';
import { GoogleGenAI, Modality } from '@google/genai';
import { getAuthToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('❌ GEMINI_API_KEY is missing in .env');

  const ai = new GoogleGenAI({ apiKey });

  const isImagePrompt = (text: string) => {
    const keywords = ['draw', 'generate', 'image', 'picture', 'photo', 'illustration'];
    return keywords.some((word) => text.toLowerCase().includes(word));
  };
  
  // Map history to the format expected by GoogleGenAI
  const googleHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.content }]
  }));

  if (isImagePrompt(message)) {
    // ---- IMAGE MODE ----
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation',
      contents: [...googleHistory, { role: 'user', parts: [{ text: message }] }],
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
     const chatSession = ai.models.startChat({
        model: 'gemini-2.0-flash',
        history: googleHistory,
    });
    const response = await chatSession.sendMessage(message);
    return { reply: response.text || '🤖 No response' };
  }
}

/**
 * Fetches the chat history from the backend.
 */
export async function getChatHistory() {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const response = await fetch(`${API_URL}/chat`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch chat history');
  }

  return response.json();
}

/**
 * Saves a chat message to the backend.
 */
export async function saveChatMessage(message: Message) {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save chat message');
  }

  return response.json();
}