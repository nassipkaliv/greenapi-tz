import { formatTime } from "../lib/format";
import type { Message } from "../types";
import { AlertIcon } from "./icons";
import { MessageStatusIcon } from "./MessageStatusIcon";
import { MessageText } from "./MessageText";

interface MessageBubbleProps {
  message: Message;
  first: boolean;
  last: boolean;
  onRetry: () => void;
}

function BubbleTail({ outgoing }: { outgoing: boolean }) {
  return (
    <svg
      width="9"
      height="17"
      viewBox="0 0 9 17"
      aria-hidden="true"
      className={`absolute bottom-0 ${outgoing ? "-right-2 fill-bubble-out" : "-left-2 -scale-x-100 fill-bubble-in"}`}
    >
      <path d="M6 17H0V0c.193 2.84.876 5.767 2.05 8.782.904 2.325 2.446 4.485 4.625 6.48A1 1 0 0 1 6 17z" />
    </svg>
  );
}

export function MessageBubble({ message, first, last, onRetry }: MessageBubbleProps) {
  const outgoing = message.direction === "outgoing";

  const corners = outgoing
    ? `${first ? "" : "rounded-tr-md"} ${last ? "rounded-br-none" : "rounded-br-md"}`
    : `${first ? "" : "rounded-tl-md"} ${last ? "rounded-bl-none" : "rounded-bl-md"}`;

  return (
    <div className={`flex items-end gap-2 ${outgoing ? "justify-end" : "justify-start"}`}>
      {message.status === "failed" && (
        <button
          type="button"
          onClick={onRetry}
          title="Не отправлено. Нажмите, чтобы повторить"
          className="mb-1 text-red-500 transition-transform hover:scale-110"
        >
          <AlertIcon />
        </button>
      )}

      <div
        className={`relative max-w-[min(30rem,85%)] rounded-[15px] px-2 pt-1.5 pb-1.5 shadow-[0_1px_2px_rgba(16,35,47,0.15)] ${corners} ${
          outgoing ? "bg-bubble-out" : "bg-bubble-in"
        }`}
      >
        <p className="leading-snug break-words whitespace-pre-wrap">
          <MessageText text={message.text} outgoing={outgoing} />
          <span className={`inline-block ${outgoing ? "w-16" : "w-11"}`} />
        </p>
        <span
          className={`absolute right-2 bottom-1 flex items-center gap-0.5 text-xs ${
            outgoing ? "text-meta-out" : "text-muted"
          }`}
        >
          {formatTime(message.timestamp)}
          {outgoing && message.status !== "failed" && <MessageStatusIcon status={message.status} />}
        </span>
        {last && <BubbleTail outgoing={outgoing} />}
      </div>
    </div>
  );
}
