import { useEffect, useRef, useState } from "react";
import { deleteNotification, receiveNotification } from "../api/greenApi";
import { parseIncomingText } from "../lib/notifications";
import type { Credentials, IncomingText } from "../types";

export type ConnectionStatus = "connecting" | "online" | "offline";

const RETRY_DELAY_MS = 3000;

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
  onIncoming: (incoming: IncomingText) => void,
): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const onIncomingRef = useRef(onIncoming);

  useEffect(() => {
    onIncomingRef.current = onIncoming;
  }, [onIncoming]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function poll() {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, signal);
          setStatus("online");
          if (!notification) continue;

          const incoming = parseIncomingText(notification.body);
          if (incoming) onIncomingRef.current(incoming);

          await deleteNotification(credentials, notification.receiptId, signal);
        } catch {
          if (signal.aborted) return;
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
