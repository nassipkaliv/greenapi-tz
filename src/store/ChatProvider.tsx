import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { sendMessage } from "../api/greenApi";
import { useNotificationPolling } from "../hooks/useNotificationPolling";
import { phoneToChatId } from "../lib/phone";
import { loadChats, saveChats } from "../lib/storage";
import type { Chat, ChatEvent, Credentials, Message } from "../types";
import { ChatContext, type ChatContextValue } from "./chatContext";
import { chatReducer, type ChatState } from "./chatReducer";

const APP_TITLE = "GREEN-API Chat";

interface ChatProviderProps {
  credentials: Credentials;
  onUnauthorized: () => void;
  children: ReactNode;
}

function recipientOf(chat: Chat): string {
  return chat.phone ? phoneToChatId(chat.phone) : (chat.remoteId ?? chat.id);
}

function createLocalId(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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

export function ChatProvider({ credentials, onUnauthorized, children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, credentials.idInstance, initState);

  useEffect(() => {
    saveChats(credentials.idInstance, state.chats);
  }, [credentials.idInstance, state.chats]);

  const unreadTotal = state.chats.reduce((sum, chat) => sum + chat.unread, 0);

  useEffect(() => {
    document.title = unreadTotal > 0 ? `(${unreadTotal}) ${APP_TITLE}` : APP_TITLE;
    return () => {
      document.title = APP_TITLE;
    };
  }, [unreadTotal]);

  const createChat = useCallback((phone: string, name?: string) => {
    dispatch({ type: "createChat", phone, name });
  }, []);

  const selectChat = useCallback((chatId: string | null) => {
    dispatch({ type: "selectChat", chatId });
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    dispatch({ type: "deleteChat", chatId });
  }, []);

  const pollingHandlers = useMemo(
    () => ({
      onEvent: (event: ChatEvent) => {
        if (event.type === "message") {
          dispatch({ type: "receive", message: event.message });
        } else {
          dispatch({ type: "setStatus", idMessage: event.idMessage, status: event.status });
        }
      },
      onUnauthorized,
    }),
    [onUnauthorized],
  );

  const connection = useNotificationPolling(credentials, pollingHandlers);

  const deliver = useCallback(
    async (chat: Chat, messageId: string, text: string) => {
      try {
        const { idMessage } = await sendMessage(credentials, recipientOf(chat), text);
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
        id: createLocalId(),
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
      connection,
      createChat,
      selectChat,
      deleteChat,
      sendText,
      retry,
    }),
    [credentials, state, connection, createChat, selectChat, deleteChat, sendText, retry],
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}
