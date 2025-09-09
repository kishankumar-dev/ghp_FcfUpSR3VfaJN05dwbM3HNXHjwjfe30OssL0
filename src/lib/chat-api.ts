'use client';

import type { Message } from '@/ai/flows/chat';
import { getAuthToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches the chat history from the backend.
 */
export async function getChatHistory(): Promise<Message[]> {
  const token = getAuthToken();
  if (!token) {
    console.error('Authentication token not found.');
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/chat`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${response.statusText}`);
    }

    // The backend returns { messages: [...] }
    const data = await response.json();
    return Array.isArray(data.messages) ? data.messages.map((m: any) => ({...m, role: m.role === 'ai' ? 'model' : 'user'})) : [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

/**
 * Saves a chat message to the backend.
 */
export async function saveChatMessage(message: Message, clear: boolean = false): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  // Your backend only accepts role and content.
  const payload: { role: string; content: string; clear?: boolean } = {
    role: message.role,
    content: message.content,
  };

  if (clear) {
    payload.clear = true;
  }

  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save chat message');
  }
}
