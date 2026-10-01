import type { Chat, Message, MessageStatus, RemoteMessage } from "../types";

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
}

export type ChatAction =
  | { type: "createChat"; phone: string; name?: string }
  | { type: "selectChat"; chatId: string | null }
  | { type: "deleteChat"; chatId: string }
  | { type: "addMessage"; chatId: string; message: Message }
  | { type: "updateMessage"; chatId: string; messageId: string; patch: Partial<Message> }
  | { type: "receive"; message: RemoteMessage }
  | { type: "setStatus"; idMessage: string; status: MessageStatus };

const STATUS_RANK: Record<MessageStatus, number> = {
  sending: 0,
  failed: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};

function updateChat(state: ChatState, chatId: string, update: (chat: Chat) => Chat): ChatState {
  return {
    ...state,
    chats: state.chats.map((chat) => (chat.id === chatId ? update(chat) : chat)),
  };
}

function findChatFor(chats: Chat[], remote: RemoteMessage): Chat | undefined {
  return chats.find(
    (chat) =>
      chat.remoteId === remote.chatId ||
      (remote.phone !== undefined && chat.phone === remote.phone),
  );
}

function receive(state: ChatState, remote: RemoteMessage): ChatState {
  const incoming = remote.direction === "incoming";
  const message: Message = {
    id: remote.idMessage,
    text: remote.text,
    direction: remote.direction,
    timestamp: remote.timestamp,
    status: "sent",
  };
  const existing = findChatFor(state.chats, remote);

  if (!existing) {
    if (!incoming) return state;
    const chat: Chat = {
      id: remote.phone ?? remote.chatId,
      phone: remote.phone ?? "",
      name: remote.name,
      remoteId: remote.chatId,
      messages: [message],
      unread: 1,
      createdAt: message.timestamp,
    };
    return { ...state, chats: [chat, ...state.chats] };
  }

  if (existing.messages.some((m) => m.id === message.id)) {
    return state;
  }

  const isOpen = state.activeChatId === existing.id;

  return updateChat(state, existing.id, (chat) => ({
    ...chat,
    name: chat.name ?? (incoming ? remote.name : undefined),
    remoteId: remote.chatId,
    messages: [...chat.messages, message],
    unread: incoming && !isOpen ? chat.unread + 1 : isOpen ? 0 : chat.unread,
  }));
}

function setStatus(state: ChatState, idMessage: string, status: MessageStatus): ChatState {
  const chat = state.chats.find((c) => c.messages.some((m) => m.id === idMessage));
  if (!chat) return state;

  return updateChat(state, chat.id, (current) => ({
    ...current,
    messages: current.messages.map((message) =>
      message.id === idMessage &&
      message.direction === "outgoing" &&
      (status === "failed" || STATUS_RANK[status] > STATUS_RANK[message.status])
        ? { ...message, status }
        : message,
    ),
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

    case "deleteChat":
      return {
        activeChatId: state.activeChatId === action.chatId ? null : state.activeChatId,
        chats: state.chats.filter((chat) => chat.id !== action.chatId),
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
      return receive(state, action.message);

    case "setStatus":
      return setStatus(state, action.idMessage, action.status);
  }
}

export function lastActivity(chat: Chat): number {
  return chat.messages.at(-1)?.timestamp ?? chat.createdAt;
}
