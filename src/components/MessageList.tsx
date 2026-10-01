import { Fragment, useEffect, useRef } from "react";
import { formatDayLabel, isSameDay } from "../lib/format";
import type { Message } from "../types";
import { MessageBubble } from "./MessageBubble";

const GROUP_GAP_MS = 5 * 60 * 1000;

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

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
    <div className="flex-1 overflow-y-auto">
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
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
