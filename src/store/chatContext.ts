import { createContext, use } from "react";
import type { Chat, Credentials, Message } from "../types";

export interface ChatContextValue {
  credentials: Credentials;
  chats: Chat[];
  activeChat: Chat | null;
  createChat: (phone: string, name?: string) => void;
  selectChat: (chatId: string | null) => void;
  sendText: (chat: Chat, text: string) => void;
  retry: (chat: Chat, message: Message) => void;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat(): ChatContextValue {
  const context = use(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
