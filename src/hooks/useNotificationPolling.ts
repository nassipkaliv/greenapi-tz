import { useEffect, useRef, useState } from "react";
import {
  deleteNotification,
  getStateInstance,
  isAuthError,
  receiveNotification,
} from "../api/greenApi";
import { parseNotification } from "../lib/notifications";
import type { ChatEvent, Credentials } from "../types";

export type ConnectionStatus = "connecting" | "online" | "offline";

const RETRY_DELAY_MS = 3000;

interface PollingHandlers {
  onEvent: (event: ChatEvent) => void;
  onUnauthorized: () => void;
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

export function useNotificationPolling(
  credentials: Credentials,
  handlers: PollingHandlers,
): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function poll() {
      let connected = false;

      while (!signal.aborted) {
        try {
          if (!connected) {
            await getStateInstance(credentials, signal);
            connected = true;
            setStatus("online");
          }

          const notification = await receiveNotification(credentials, signal);
          if (!notification) continue;

          const event = parseNotification(notification.body);
          if (event) handlersRef.current.onEvent(event);

          await deleteNotification(credentials, notification.receiptId, signal);
        } catch (error) {
          if (signal.aborted) return;
          if (isAuthError(error)) {
            handlersRef.current.onUnauthorized();
            return;
          }
          connected = false;
          setStatus("offline");
          await wait(RETRY_DELAY_MS, signal);
        }
      }
    }

    void poll();
    return () => controller.abort();
  }, [credentials]);

  return status;
}
