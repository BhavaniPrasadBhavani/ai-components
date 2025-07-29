import React, { useState, useCallback, useEffect } from 'react';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GeneratedCode {
  tsx: string;
  css: string;
}

export interface Session {
  id: string;
  name: string;
  chat_history: ChatMessage[];
  generated_code?: GeneratedCode;
  created_at: string;
  updated_at: string;
}

// Simple global state management without external dependencies
class AppStore {
  private sessions: Session[] = [];
  private activeSession: Session | null = null;
  private isGenerating: boolean = false;
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getState() {
    return {
      sessions: this.sessions,
      activeSession: this.activeSession,
      isGenerating: this.isGenerating,
    };
  }

  setSessions(sessions: Session[]) {
    this.sessions = sessions;
    this.notify();
  }

  setActiveSession(session: Session | null) {
    this.activeSession = session;
    this.notify();
  }

  createSession(name: string = 'New Session'): Session {
    const newSession: Session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      chat_history: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.sessions = [...this.sessions, newSession];
    this.activeSession = newSession;
    this.notify();
    
    return newSession;
  }

  setIsGenerating(generating: boolean) {
    this.isGenerating = generating;
    this.notify();
  }

  addChatMessage(message: ChatMessage) {
    if (!this.activeSession) return;
    
    const updatedSession = {
      ...this.activeSession,
      chat_history: [...this.activeSession.chat_history, message],
      updated_at: new Date().toISOString(),
    };
    
    this.activeSession = updatedSession;
    this.sessions = this.sessions.map(s => 
      s.id === updatedSession.id ? updatedSession : s
    );
    this.notify();
  }

  updateLastMessage(content: string) {
    if (!this.activeSession || this.activeSession.chat_history.length === 0) {
      return;
    }
    
    const updatedHistory = [...this.activeSession.chat_history];
    const lastMessage = updatedHistory[updatedHistory.length - 1];
    
    if (lastMessage) {
      updatedHistory[updatedHistory.length - 1] = {
        ...lastMessage,
        content,
      };
    }
    
    const updatedSession = {
      ...this.activeSession,
      chat_history: updatedHistory,
      updated_at: new Date().toISOString(),
    };
    
    this.activeSession = updatedSession;
    this.sessions = this.sessions.map(s => 
      s.id === updatedSession.id ? updatedSession : s
    );
    this.notify();
  }

  setGeneratedCode(code: GeneratedCode) {
    if (!this.activeSession) return;
    
    const updatedSession = {
      ...this.activeSession,
      generated_code: code,
      updated_at: new Date().toISOString(),
    };
    
    this.activeSession = updatedSession;
    this.sessions = this.sessions.map(s => 
      s.id === updatedSession.id ? updatedSession : s
    );
    this.notify();
  }
}

const appStore = new AppStore();

export function useAppStore() {
  const [, forceUpdate] = useState({});
  
  const rerender = useCallback(() => forceUpdate({}), []);
  
  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = appStore.subscribe(rerender);
    return unsubscribe;
  }, [rerender]);

  const state = appStore.getState();

  return {
    ...state,
    setSessions: appStore.setSessions.bind(appStore),
    setActiveSession: appStore.setActiveSession.bind(appStore),
    createSession: appStore.createSession.bind(appStore),
    setIsGenerating: appStore.setIsGenerating.bind(appStore),
    addChatMessage: appStore.addChatMessage.bind(appStore),
    updateLastMessage: appStore.updateLastMessage.bind(appStore),
    setGeneratedCode: appStore.setGeneratedCode.bind(appStore),
  };
}
