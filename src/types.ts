export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export type MessageDirection = "incoming" | "outgoing";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface Message {
  id: string;
  text: string;
  direction: MessageDirection;
  timestamp: number;
  status: MessageStatus;
}

export interface Chat {
  id: string;
  phone: string;
  name?: string;
  remoteId?: string;
  messages: Message[];
  unread: number;
  createdAt: number;
}

export interface RemoteMessage {
  idMessage: string;
  chatId: string;
  direction: MessageDirection;
  phone?: string;
  name?: string;
  text: string;
  timestamp: number;
}

export type ChatEvent =
  | { type: "message"; message: RemoteMessage }
  | { type: "status"; idMessage: string; status: MessageStatus };
