'use client';

import { useState, useRef, useEffect } from 'react';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import AppSidebar from '@/components/dashboard/sidebar';
import Header from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import { chat, type Message } from '@/ai/flows/chat';
import { getChatHistory, saveChatMessage } from '@/lib/chat-api';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setIsHistoryLoading(true);
      try {
        const history = await getChatHistory();
        setMessages(history);
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your chat history.',
        });
      } finally {
        setIsHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user, toast]);


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;
  
    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
  
    try {
      // 1. Save the user's message first
      await saveChatMessage(userMessage);
  
      // 2. Call the AI with the full history including the new user message
      const response = await chat(newMessages, currentInput);
      
      const aiMessage: Message = {
        role: 'model',
        content: response.reply,
        image: response.image,
      };
  
      // 3. Save the AI's response
      await saveChatMessage(aiMessage);
  
      // 4. Update the UI with the AI's message
      setMessages((prev) => [...prev, aiMessage]);
  
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
      });
      // Revert the optimistic UI update if something went wrong
      setMessages((prev) => prev.slice(0, prev.length - 1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    // This should also clear the chat on the backend in a real implementation
    setMessages([]);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-screen flex-col">
          <Header />
          <main className="flex-1 flex flex-col p-4 md:p-6">
            <div className="flex-1 flex flex-col bg-card border rounded-lg shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">AI Chat</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  disabled={messages.length === 0}
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Clear Chat</span>
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {isHistoryLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                     <div className="flex justify-center items-center h-full">
                        <p className="text-muted-foreground">Start a conversation to see your chat history.</p>
                     </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-start gap-4',
                          message.role === 'user' ? 'justify-end' : ''
                        )}
                      >
                        {message.role === 'model' && (
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback>
                              <Bot className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'max-w-[75%] rounded-lg p-3 text-sm',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          {message.content && (
                            <ReactMarkdown
                              className="prose dark:prose-invert prose-p:leading-relaxed prose-p:m-0 prose-headings:m-0 prose-ul:m-0 prose-ol:m-0 prose-li:m-0"
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                          {message.image && (
                            <img
                              src={message.image}
                              alt="AI generated"
                              className="generated-img max-w-[400px] mt-2 rounded-lg border"
                            />
                          )}
                        </div>
                        {message.role === 'user' && (
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage
                              src={user?.photoURL ?? ''}
                              alt={user?.displayName ?? 'User'}
                            />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex items-start gap-4">
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback>
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[75%] rounded-lg p-3 text-sm bg-muted">
                        <span className="animate-pulse">AI is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="relative">
                  <Textarea
                    placeholder="Type your message here..."
                    className="pr-16 min-h-[48px] resize-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    rows={1}
                    disabled={isHistoryLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={handleSendMessage}
                    disabled={isLoading || input.trim() === '' || isHistoryLoading}
                  >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
