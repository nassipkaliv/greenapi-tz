import type { Credentials } from "../types";

export class GreenApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GreenApiError";
    this.status = status;
  }
}

function buildUrl(creds: Credentials, method: string, suffix = ""): string {
  const base = creds.apiUrl.trim().replace(/\/+$/, "");
  return `${base}/waInstance${creds.idInstance.trim()}/${method}/${creds.apiTokenInstance.trim()}${suffix}`;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const message =
      response.status === 401 || response.status === 403
        ? "Неверный idInstance или apiTokenInstance"
        : `Ошибка GREEN-API (${response.status})`;
    throw new GreenApiError(message, response.status);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export function getStateInstance(creds: Credentials) {
  return request<{ stateInstance: string }>(buildUrl(creds, "getStateInstance"));
}

export function sendMessage(creds: Credentials, chatId: string, message: string) {
  return request<{ idMessage: string }>(buildUrl(creds, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });
}

export interface NotificationBody {
  typeWebhook: string;
  timestamp: number;
  idMessage?: string;
  senderData?: {
    chatId: string;
    chatType: string;
    senderName?: string;
    senderPhoneNumber?: number;
  };
  messageData?: {
    typeMessage: string;
    textMessageData?: { textMessage: string };
    extendedTextMessageData?: { text: string };
  };
}

export interface Notification {
  receiptId: number;
  body: NotificationBody;
}

export function receiveNotification(creds: Credentials, signal?: AbortSignal) {
  return request<Notification | null>(
    buildUrl(creds, "receiveNotification", "?receiveTimeout=20"),
    { signal },
  );
}

export function deleteNotification(creds: Credentials, receiptId: number, signal?: AbortSignal) {
  return request<{ result: boolean }>(buildUrl(creds, "deleteNotification", `/${receiptId}`), {
    method: "DELETE",
    signal,
  });
}
