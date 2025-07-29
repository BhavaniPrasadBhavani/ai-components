import axios from 'axios';
import { useAppStore } from './store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAppStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface GeneratedCode {
  tsx: string;
  css: string;
}

export interface UIEditorState {
  [key: string]: unknown;
}

export interface SessionData {
  name?: string;
  chat_history?: ChatMessage[];
  generated_code?: GeneratedCode;
  ui_editor_state?: UIEditorState;
}

export const api = {
  // Authentication
  login: async (data: LoginData) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Sessions
  getSessions: async () => {
    const response = await apiClient.get('/sessions');
    return response.data;
  },

  getSession: async (id: string) => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data;
  },

  createSession: async (data: { name?: string } = {}) => {
    const response = await apiClient.post('/sessions', data);
    return response.data;
  },

  updateSession: async (id: string, data: SessionData) => {
    const response = await apiClient.patch(`/sessions/${id}`, data);
    return response.data;
  },

  deleteSession: async (id: string) => {
    const response = await apiClient.delete(`/sessions/${id}`);
    return response.data;
  },

  downloadSession: async (id: string) => {
    const response = await apiClient.get(`/sessions/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // AI Streaming
  streamGeneration: (sessionId: string, prompt: string) => {
    const token = useAppStore.getState().token;
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const url = `${API_BASE_URL}/ai/stream/${sessionId}?prompt=${encodeURIComponent(prompt)}&token=${encodeURIComponent(token)}`;
    
    console.log('🔍 EventSource URL:', url);
    console.log('🔐 Token exists:', !!token);
    console.log('📝 Session ID:', sessionId);
    console.log('💬 Prompt length:', prompt.length);
    
    const eventSource = new EventSource(url);
    
    // Add error handling to the EventSource
    eventSource.addEventListener('error', (event) => {
      console.error('❌ EventSource error details:', {
        readyState: eventSource.readyState,
        url: eventSource.url,
        event: event
      });
    });
    
    eventSource.addEventListener('open', () => {
      console.log('✅ EventSource connection opened');
    });
    
    return eventSource;
  },

  // Health check
  health: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiClient;
