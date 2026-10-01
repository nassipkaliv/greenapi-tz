import type { Credentials } from "../types";

const RECEIVE_TIMEOUT_SEC = 20;
const REQUEST_TIMEOUT_MS = 15_000;
const RECEIVE_REQUEST_TIMEOUT_MS = (RECEIVE_TIMEOUT_SEC + 10) * 1000;

export class GreenApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GreenApiError";
    this.status = status;
  }
}

export function isAuthError(error: unknown): boolean {
  return error instanceof GreenApiError && (error.status === 401 || error.status === 403);
}

function buildUrl(creds: Credentials, method: string, suffix = ""): string {
  const base = creds.apiUrl.trim().replace(/\/+$/, "");
  return `${base}/waInstance${creds.idInstance.trim()}/${method}/${creds.apiTokenInstance.trim()}${suffix}`;
}

interface RequestOptions extends Omit<RequestInit, "signal"> {
  signal?: AbortSignal;
  timeout?: number;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { signal, timeout = REQUEST_TIMEOUT_MS, ...init } = options;
  const timeoutSignal = AbortSignal.timeout(timeout);

  const response = await fetch(url, {
    ...init,
    signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
  });

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

export function getStateInstance(creds: Credentials, signal?: AbortSignal) {
  return request<{ stateInstance: string }>(buildUrl(creds, "getStateInstance"), { signal });
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
  chatId?: string;
  status?: string;
  senderData?: {
    chatId: string;
    chatType: string;
    chatName?: string;
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
    buildUrl(creds, "receiveNotification", `?receiveTimeout=${RECEIVE_TIMEOUT_SEC}`),
    { signal, timeout: RECEIVE_REQUEST_TIMEOUT_MS },
  );
}

export function deleteNotification(creds: Credentials, receiptId: number, signal?: AbortSignal) {
  return request<{ result: boolean }>(buildUrl(creds, "deleteNotification", `/${receiptId}`), {
    method: "DELETE",
    signal,
  });
}
