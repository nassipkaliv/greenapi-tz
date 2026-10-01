import { useEffect, useState } from "react";
import { chatTitle } from "../lib/format";
import { formatPhone } from "../lib/phone";
import { useChat } from "../store/chatContext";
import type { Chat } from "../types";
import { Avatar } from "./Avatar";
import { ConfirmDialog } from "./ConfirmDialog";
import { BackIcon, MoreIcon, TrashIcon } from "./icons";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";

interface ChatHeaderProps {
  chat: Chat;
  onBack: () => void;
  onDelete: () => void;
}

function ChatHeader({ chat, onBack, onDelete }: ChatHeaderProps) {
  const title = chatTitle(chat);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 bg-surface px-2 shadow-[0_1px_2px_rgba(0,0,0,0.08)] md:px-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="Назад"
        className="rounded-full p-2 text-muted hover:bg-hover md:hidden"
      >
        <BackIcon />
      </button>
      <Avatar seed={chat.id} name={title} size="sm" />
      <div className="min-w-0 flex-1">
        <h2 className="truncate leading-tight font-medium">{title}</h2>
        <p className="truncate text-sm text-muted">
          {chat.name && chat.phone ? formatPhone(chat.phone) : "личный чат"}
        </p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Ещё"
          className="rounded-full p-2 text-muted transition-colors hover:bg-hover"
        >
          <MoreIcon />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-full right-0 z-20 mt-1 w-52 rounded-xl bg-surface/95 py-1 shadow-[0_4px_24px_rgba(0,0,0,0.15)] backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                className="flex w-full items-center gap-5 px-4 py-2 text-left text-sm font-medium text-red-500 hover:bg-hover"
              >
                <TrashIcon className="size-5" />
                Удалить чат
              </button>
            </div>
          </>
        )}
      </div>

      {confirmOpen && (
        <ConfirmDialog
          title="Удалить чат"
          message={`Удалить чат с ${title}? История удалится только в этом браузере.`}
          confirmLabel="Удалить"
          onConfirm={onDelete}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </header>
  );
}

export function ChatWindow() {
  const { activeChat, selectChat, deleteChat, sendText, retry } = useChat();
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
      <ChatHeader
        key={`header-${activeChat.id}`}
        chat={activeChat}
        onBack={() => selectChat(null)}
        onDelete={() => deleteChat(activeChat.id)}
      />
      <MessageList
        key={`list-${activeChat.id}`}
        messages={activeChat.messages}
        onRetry={(message) => retry(activeChat, message)}
      />
      <MessageComposer
        key={`composer-${activeChat.id}`}
        onSend={(text) => sendText(activeChat, text)}
      />
    </section>
  );
}
