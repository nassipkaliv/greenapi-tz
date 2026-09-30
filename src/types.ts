export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export type MessageDirection = "incoming" | "outgoing";
export type MessageStatus = "sending" | "sent" | "failed";

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
