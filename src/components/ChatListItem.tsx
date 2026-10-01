import { chatTitle, formatListTime } from "../lib/format";
import type { Chat } from "../types";
import { Avatar } from "./Avatar";
import { MessageStatusIcon } from "./MessageStatusIcon";

interface ChatListItemProps {
  chat: Chat;
  active: boolean;
  onSelect: () => void;
}

export function ChatListItem({ chat, active, onSelect }: ChatListItemProps) {
  const title = chatTitle(chat);
  const last = chat.messages.at(-1);
  const secondary = active ? "text-white/80" : "text-muted";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors ${
        active ? "bg-accent text-white" : "hover:bg-hover"
      }`}
    >
      <Avatar seed={chat.id} name={title} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="flex-1 truncate font-medium">{title}</span>
          {last?.direction === "outgoing" && (
            <MessageStatusIcon
              status={last.status}
              className={active ? "text-white" : "text-green"}
            />
          )}
          {last && (
            <span className={`shrink-0 text-xs ${secondary}`}>
              {formatListTime(last.timestamp)}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={`flex-1 truncate ${secondary}`}>{last?.text ?? "Нет сообщений"}</span>
          {chat.unread > 0 && (
            <span
              className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 text-sm font-medium ${
                active ? "bg-white text-accent" : "bg-green text-white"
              }`}
            >
              {chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
