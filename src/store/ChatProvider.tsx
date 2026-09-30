import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { loadChats, saveChats } from "../lib/storage";
import type { Credentials } from "../types";
import { ChatContext, type ChatContextValue } from "./chatContext";
import { chatReducer } from "./chatReducer";

interface ChatProviderProps {
  credentials: Credentials;
  children: ReactNode;
}

export function ChatProvider({ credentials, children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, credentials.idInstance, (idInstance) => ({
    chats: loadChats(idInstance),
    activeChatId: null,
  }));

  useEffect(() => {
    saveChats(credentials.idInstance, state.chats);
  }, [credentials.idInstance, state.chats]);

  const createChat = useCallback((phone: string, name?: string) => {
    dispatch({ type: "createChat", phone, name });
  }, []);

  const selectChat = useCallback((chatId: string | null) => {
    dispatch({ type: "selectChat", chatId });
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      credentials,
      chats: state.chats,
      activeChat: state.chats.find((chat) => chat.id === state.activeChatId) ?? null,
      createChat,
      selectChat,
    }),
    [credentials, state, createChat, selectChat],
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}
