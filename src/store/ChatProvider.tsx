import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { sendMessage } from "../api/greenApi";
import { phoneToChatId } from "../lib/phone";
import { loadChats, saveChats } from "../lib/storage";
import type { Chat, Credentials, Message } from "../types";
import { ChatContext, type ChatContextValue } from "./chatContext";
import { chatReducer, type ChatState } from "./chatReducer";

interface ChatProviderProps {
  credentials: Credentials;
  children: ReactNode;
}

function initState(idInstance: string): ChatState {
  const chats = loadChats(idInstance).map((chat) => ({
    ...chat,
    messages: chat.messages.map((message) =>
      message.status === "sending" ? { ...message, status: "failed" as const } : message,
    ),
  }));
  return { chats, activeChatId: null };
}

export function ChatProvider({ credentials, children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, credentials.idInstance, initState);

  useEffect(() => {
    saveChats(credentials.idInstance, state.chats);
  }, [credentials.idInstance, state.chats]);

  const createChat = useCallback((phone: string, name?: string) => {
    dispatch({ type: "createChat", phone, name });
  }, []);

  const selectChat = useCallback((chatId: string | null) => {
    dispatch({ type: "selectChat", chatId });
  }, []);

  const deliver = useCallback(
    async (chat: Chat, messageId: string, text: string) => {
      try {
        const { idMessage } = await sendMessage(credentials, phoneToChatId(chat.phone), text);
        dispatch({
          type: "updateMessage",
          chatId: chat.id,
          messageId,
          patch: { id: idMessage, status: "sent" },
        });
      } catch {
        dispatch({
          type: "updateMessage",
          chatId: chat.id,
          messageId,
          patch: { status: "failed" },
        });
      }
    },
    [credentials],
  );

  const sendText = useCallback(
    (chat: Chat, text: string) => {
      const message: Message = {
        id: `local-${crypto.randomUUID()}`,
        text,
        direction: "outgoing",
        timestamp: Date.now(),
        status: "sending",
      };
      dispatch({ type: "addMessage", chatId: chat.id, message });
      void deliver(chat, message.id, text);
    },
    [deliver],
  );

  const retry = useCallback(
    (chat: Chat, message: Message) => {
      dispatch({
        type: "updateMessage",
        chatId: chat.id,
        messageId: message.id,
        patch: { status: "sending" },
      });
      void deliver(chat, message.id, message.text);
    },
    [deliver],
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      credentials,
      chats: state.chats,
      activeChat: state.chats.find((chat) => chat.id === state.activeChatId) ?? null,
      createChat,
      selectChat,
      sendText,
      retry,
    }),
    [credentials, state, createChat, selectChat, sendText, retry],
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}
