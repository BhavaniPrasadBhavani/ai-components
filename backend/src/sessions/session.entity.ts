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
