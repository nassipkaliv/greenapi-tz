import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { formatDayLabel, isSameDay } from "../lib/format";
import type { Message } from "../types";
import { ArrowDownIcon } from "./icons";
import { MessageBubble } from "./MessageBubble";

const GROUP_GAP_MS = 5 * 60 * 1000;
const NEAR_BOTTOM_PX = 120;

interface MessageListProps {
  messages: Message[];
  onRetry: (message: Message) => void;
}

function isSameGroup(previous: Message | undefined, current: Message | undefined): boolean {
  if (!previous || !current) return false;
  return (
    previous.direction === current.direction &&
    isSameDay(previous.timestamp, current.timestamp) &&
    current.timestamp - previous.timestamp < GROUP_GAP_MS
  );
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  const [missed, setMissed] = useState(0);
  const lastDirection = messages.at(-1)?.direction;

  function scrollToBottom(behavior: ScrollBehavior) {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior });
    }
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distance < NEAR_BOTTOM_PX;
    atBottomRef.current = nearBottom;
    setAtBottom(nearBottom);
    if (nearBottom) setMissed(0);
  }

  useLayoutEffect(() => {
    scrollToBottom("auto");
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    if (atBottomRef.current || lastDirection === "outgoing") {
      scrollToBottom("smooth");
    } else {
      setMissed((count) => count + 1);
    }
  }, [messages.length, lastDirection]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="max-w-64 rounded-3xl bg-black/20 px-5 py-4 text-center text-white">
          <p className="font-medium">Здесь пока нет сообщений…</p>
          <p className="mt-1 text-sm">Отправьте сообщение, чтобы начать переписку.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-182 flex-col justify-end px-3 pt-2 pb-1 md:px-4">
          {messages.map((message, index) => {
            const previous = messages[index - 1];
            const next = messages[index + 1];
            const showDate = !previous || !isSameDay(previous.timestamp, message.timestamp);
            const first = !isSameGroup(previous, message);
            const last = !isSameGroup(message, next);

            return (
              <Fragment key={message.id}>
                {showDate && (
                  <div className="sticky top-2 z-10 my-2 self-center rounded-full bg-black/20 px-2.5 py-0.5 text-sm font-medium text-white">
                    {formatDayLabel(message.timestamp)}
                  </div>
                )}
                <div className={first ? "mt-2" : "mt-0.5"}>
                  <MessageBubble
                    message={message}
                    first={first}
                    last={last}
                    onRetry={() => onRetry(message)}
                  />
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      {!atBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom("smooth")}
          aria-label="Вниз"
          className="absolute right-4 bottom-2 flex size-12 items-center justify-center rounded-full bg-surface text-muted shadow-[0_1px_2px_rgba(16,35,47,0.15)] transition-colors hover:text-accent md:right-6"
        >
          <ArrowDownIcon />
          {missed > 0 && (
            <span className="absolute -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-sm font-medium text-white">
              {missed}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
