export interface ChatMessageView {
  id: number;
  role: string; // "USER" | "BOT"
  content: string;
  status: string | null;
  sources: string[];
  helpful: boolean | null;
}

export interface ChatReply {
  conversationId: number;
  messageId: number;
  answer: string;
  status: string;
  sources: string[];
}

export interface KnowledgeDoc {
  id: number;
  title: string;
  category: string | null;
  content: string;
  updatedAt: string;
}

export interface UnansweredQuestion {
  id: number;
  question: string;
  createdAt: string;
  resolved: boolean;
}