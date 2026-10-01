import type { Chat, Credentials } from "../types";

const CREDENTIALS_KEY = "greenapi:credentials";
const MAX_STORED_MESSAGES = 500;

export function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    return raw ? (JSON.parse(raw) as Credentials) : null;
  } catch {
    return null;
  }
}

export function saveCredentials(creds: Credentials): void {
  try {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
  } catch {
    return;
  }
}

export function clearCredentials(): void {
  try {
    localStorage.removeItem(CREDENTIALS_KEY);
  } catch {
    return;
  }
}

function chatsKey(idInstance: string): string {
  return `greenapi:chats:${idInstance}`;
}

export function loadChats(idInstance: string): Chat[] {
  try {
    const raw = localStorage.getItem(chatsKey(idInstance));
    return raw ? (JSON.parse(raw) as Chat[]) : [];
  } catch {
    return [];
  }
}

export function saveChats(idInstance: string, chats: Chat[]): void {
  try {
    const trimmed = chats.map((chat) => ({
      ...chat,
      messages: chat.messages.slice(-MAX_STORED_MESSAGES),
    }));
    localStorage.setItem(chatsKey(idInstance), JSON.stringify(trimmed));
  } catch {
    return;
  }
}
