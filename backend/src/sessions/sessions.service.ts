import { Injectable } from '@nestjs/common';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface Session {
  id: string;
  userId: string;
  chat_history: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SessionsService {
  private sessions: Map<string, Session> = new Map();

  async findOne(sessionId: string, userId: string): Promise<Session> {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      // Create new session if it doesn't exist
      session = {
        id: sessionId,
        userId,
        chat_history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.sessions.set(sessionId, session);
    }
    
    return session;
  }

  async create(userId: string): Promise<Session> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: Session = {
      id: sessionId,
      userId,
      chat_history: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.chat_history.push({
        ...message,
        timestamp: new Date(),
      });
      session.updatedAt = new Date();
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      session => session.userId === userId
    );
  }
}
