import { useCallback, useEffect, useState } from "react";

export type TabLockState = "pending" | "active" | "blocked";

const BLOCKED_DELAY_MS = 300;

function supportsLocks(): boolean {
  return typeof navigator !== "undefined" && "locks" in navigator;
}

export function useTabLock(name: string) {
  const [state, setState] = useState<TabLockState>(supportsLocks() ? "pending" : "active");
  const [attempt, setAttempt] = useState({ steal: false, count: 0 });

  useEffect(() => {
    if (!supportsLocks()) return;

    const controller = new AbortController();
    let disposed = false;
    let release = () => {};
    const timer = setTimeout(() => {
      setState((current) => (current === "active" ? current : "blocked"));
    }, BLOCKED_DELAY_MS);

    navigator.locks
      .request(name, attempt.steal ? { steal: true } : { signal: controller.signal }, () => {
        if (disposed) return;
        clearTimeout(timer);
        setState("active");
        return new Promise<void>((resolve) => {
          release = resolve;
        });
      })
      .catch(() => {
        if (disposed) return;
        setState("blocked");
        setAttempt((current) => ({ steal: false, count: current.count + 1 }));
      });

    return () => {
      disposed = true;
      clearTimeout(timer);
      controller.abort();
      release();
    };
  }, [name, attempt]);

  const takeOver = useCallback(() => {
    setAttempt((current) => ({ steal: true, count: current.count + 1 }));
  }, []);

  return { state, takeOver };
}
