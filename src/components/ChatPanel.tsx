'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import type { ChatMessage } from '@/lib/store';

export default function ChatPanel() {
  const {
    activeSession,
    isGenerating,
    setIsGenerating,
    addChatMessage,
    updateLastMessage,
    setGeneratedCode,
    updateActiveSession,
  } = useAppStore();

  const [input, setInput] = useState('');
  const [eventSource, setEventSource] = useState<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.chat_history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeSession || isGenerating) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message
    addChatMessage(userMessage);
    setInput('');
    setIsGenerating(true);

    // Add placeholder for AI response
    const aiMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    addChatMessage(aiMessage);

    try {
      const es = api.streamGeneration(activeSession.id, userMessage.content);
      setEventSource(es);

      let fullResponse = '';

      es.onmessage = (event) => {
        if (event.data === '[DONE]') {
          es.close();
          setEventSource(null);
          setIsGenerating(false);
          
          // Save session after generation
          saveSession();
          return;
        }

        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'chunk') {
            fullResponse += data.content;
            updateLastMessage(fullResponse);
          } else if (data.type === 'complete') {
            fullResponse = data.content;
            updateLastMessage(fullResponse);
            
            if (data.code) {
              setGeneratedCode(data.code);
            }
          } else if (data.type === 'error') {
            console.error('AI Service Error:', data.error);
            updateLastMessage(`Error: ${data.error}`);
            setIsGenerating(false);
            es.close();
            setEventSource(null);
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err, 'Raw data:', event.data);
          // Don't break the stream for parse errors, just log them
        }
      };

      es.onerror = (error) => {
        console.error('SSE Connection Error:', error);
        console.error('EventSource readyState:', es.readyState);
        console.error('EventSource URL:', es.url);
        
        updateLastMessage('Connection error occurred. Please check your internet connection and try again.');
        setIsGenerating(false);
        es.close();
        setEventSource(null);
      };

      es.onopen = () => {
        console.log('SSE Connection opened successfully');
      };

    } catch (error) {
      console.error('Error starting generation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      updateLastMessage(`Failed to start generation: ${errorMessage}. Please try again.`);
      setIsGenerating(false);
    }
  };

  const saveSession = async () => {
    if (!activeSession) return;
    
    try {
      await api.updateSession(activeSession.id, {
        chat_history: activeSession.chat_history,
        generated_code: activeSession.generated_code,
      });
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const stopGeneration = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Chat</h2>
        <p className="text-sm text-gray-600">
          Describe the component you want to generate
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSession?.chat_history?.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>Start a conversation to generate your first component!</p>
            <p className="text-xs mt-2">Try: "Create a modern button component with a blue gradient"</p>
          </div>
        ) : (
          activeSession?.chat_history?.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  {message.content || (isGenerating && index === activeSession.chat_history!.length - 1 ? '...' : '')}
                </div>
                {message.timestamp && (
                  <div className={`text-xs mt-1 opacity-70`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the component you want to create..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={3}
            disabled={isGenerating}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </span>
            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
