import { useEffect } from "react";
import { chatTitle } from "../lib/format";
import { formatPhone } from "../lib/phone";
import { useChat } from "../store/chatContext";
import type { Chat } from "../types";
import { Avatar } from "./Avatar";
import { BackIcon } from "./icons";

interface ChatHeaderProps {
  chat: Chat;
  onBack: () => void;
}

function ChatHeader({ chat, onBack }: ChatHeaderProps) {
  const title = chatTitle(chat);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 bg-surface px-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)] md:px-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="Назад"
        className="rounded-full p-2 text-muted hover:bg-hover md:hidden"
      >
        <BackIcon />
      </button>
      <Avatar seed={chat.id} name={title} size="sm" />
      <div className="min-w-0">
        <h2 className="truncate leading-tight font-medium">{title}</h2>
        <p className="truncate text-sm text-muted">
          {chat.name ? formatPhone(chat.phone) : "личный чат"}
        </p>
      </div>
    </header>
  );
}

export function ChatWindow() {
  const { activeChat, selectChat } = useChat();
  const hasActiveChat = activeChat !== null;

  useEffect(() => {
    if (!hasActiveChat) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        selectChat(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasActiveChat, selectChat]);

  if (!activeChat) {
    return (
      <section className="hidden flex-1 items-center justify-center chat-wallpaper md:flex">
        <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-medium text-white">
          Выберите чат, чтобы начать общение
        </span>
      </section>
    );
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col chat-wallpaper">
      <ChatHeader chat={activeChat} onBack={() => selectChat(null)} />
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="max-w-64 rounded-3xl bg-black/20 px-5 py-4 text-center text-white">
          <p className="font-medium">Здесь пока нет сообщений…</p>
          <p className="mt-1 text-sm">Отправьте сообщение, чтобы начать переписку.</p>
        </div>
      </div>
    </section>
  );
}
