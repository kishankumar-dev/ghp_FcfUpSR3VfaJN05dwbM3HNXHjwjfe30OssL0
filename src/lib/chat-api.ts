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

    const history = await response.json();
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

/**
 * Sends a chat message to the backend.
 */
export async function sendMessage(message: string): Promise<{ reply: string, image?: string, chat: Message[] }> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to send chat');
  }

  return res.json();
}