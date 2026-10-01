import type { Chat, IncomingText, Message } from "../types";

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
}

export type ChatAction =
  | { type: "createChat"; phone: string; name?: string }
  | { type: "selectChat"; chatId: string | null }
  | { type: "addMessage"; chatId: string; message: Message }
  | { type: "updateMessage"; chatId: string; messageId: string; patch: Partial<Message> }
  | { type: "receive"; incoming: IncomingText };

function updateChat(state: ChatState, chatId: string, update: (chat: Chat) => Chat): ChatState {
  return {
    ...state,
    chats: state.chats.map((chat) => (chat.id === chatId ? update(chat) : chat)),
  };
}

function findChatFor(chats: Chat[], incoming: IncomingText): Chat | undefined {
  return chats.find(
    (chat) =>
      chat.remoteId === incoming.chatId ||
      (incoming.phone !== undefined && chat.phone === incoming.phone),
  );
}

function receive(state: ChatState, incoming: IncomingText): ChatState {
  const message: Message = {
    id: incoming.idMessage,
    text: incoming.text,
    direction: "incoming",
    timestamp: incoming.timestamp,
    status: "sent",
  };
  const existing = findChatFor(state.chats, incoming);

  if (!existing) {
    const chat: Chat = {
      id: incoming.phone ?? incoming.chatId,
      phone: incoming.phone ?? "",
      name: incoming.name,
      remoteId: incoming.chatId,
      messages: [message],
      unread: 1,
      createdAt: message.timestamp,
    };
    return { ...state, chats: [chat, ...state.chats] };
  }

  if (existing.messages.some((m) => m.id === message.id)) {
    return state;
  }

  return updateChat(state, existing.id, (chat) => ({
    ...chat,
    name: chat.name ?? incoming.name,
    remoteId: incoming.chatId,
    messages: [...chat.messages, message],
    unread: state.activeChatId === chat.id ? 0 : chat.unread + 1,
  }));
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "createChat": {
      const existing = state.chats.find((chat) => chat.phone === action.phone);
      if (existing) {
        return chatReducer(state, { type: "selectChat", chatId: existing.id });
      }
      const chat: Chat = {
        id: action.phone,
        phone: action.phone,
        name: action.name,
        messages: [],
        unread: 0,
        createdAt: Date.now(),
      };
      return { chats: [chat, ...state.chats], activeChatId: chat.id };
    }

    case "selectChat":
      return {
        activeChatId: action.chatId,
        chats: state.chats.map((chat) =>
          chat.id === action.chatId && chat.unread > 0 ? { ...chat, unread: 0 } : chat,
        ),
      };

    case "addMessage":
      return updateChat(state, action.chatId, (chat) => ({
        ...chat,
        messages: [...chat.messages, action.message],
      }));

    case "updateMessage":
      return updateChat(state, action.chatId, (chat) => ({
        ...chat,
        messages: chat.messages.map((message) =>
          message.id === action.messageId ? { ...message, ...action.patch } : message,
        ),
      }));

    case "receive":
      return receive(state, action.incoming);
  }
}

export function lastActivity(chat: Chat): number {
  return chat.messages.at(-1)?.timestamp ?? chat.createdAt;
}
