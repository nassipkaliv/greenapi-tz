import type { Credentials } from "../types";

const CREDENTIALS_KEY = "greenapi:credentials";

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
    localStorage.remove(CREDENTIALS_KEY);
  } catch {
    return;
  }
}
