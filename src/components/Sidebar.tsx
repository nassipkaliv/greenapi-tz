import { useMemo, useState } from "react";
import { chatTitle } from "../lib/format";
import { useChat } from "../store/chatContext";
import { lastActivity } from "../store/chatReducer";
import { ChatListItem } from "./ChatListItem";
import { CloseIcon, LogoutIcon, MenuIcon, PencilIcon, SearchIcon } from "./icons";
import { NewChatDialog } from "./NewChatDialog";

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { credentials, chats, activeChat, connection, selectChat } = useChat();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const visibleChats = useMemo(() => {
    const text = query.trim().toLowerCase();
    const digits = text.replace(/\D/g, "");
    return chats
      .filter(
        (chat) =>
          !text ||
          chatTitle(chat).toLowerCase().includes(text) ||
          (digits !== "" && chat.phone.includes(digits)),
      )
      .sort((a, b) => lastActivity(b) - lastActivity(a));
  }, [chats, query]);

  return (
    <aside
      className={`${activeChat ? "hidden md:flex" : "flex"} relative w-full flex-col border-r border-line bg-surface md:w-105 md:shrink-0`}
    >
      <header className="flex items-center gap-2 px-3 py-1.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Меню"
            className="rounded-full p-2 text-muted transition-colors hover:bg-hover"
          >
            <MenuIcon />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute top-full left-0 z-20 mt-1 w-64 rounded-xl bg-surface/95 py-1 shadow-[0_4px_24px_rgba(0,0,0,0.15)] backdrop-blur">
                <p className="px-4 py-2 text-sm text-muted">Инстанс {credentials.idInstance}</p>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-5 px-4 py-2 text-left text-sm font-medium text-red-500 hover:bg-hover"
                >
                  <LogoutIcon className="size-5" />
                  Выйти
                </button>
              </div>
            </>
          )}
        </div>

        <label className="group flex flex-1 items-center gap-2 rounded-full border-2 border-transparent bg-hover px-3 py-1.5 transition-colors focus-within:border-accent focus-within:bg-surface">
          <SearchIcon className="size-5 shrink-0 text-muted group-focus-within:text-accent" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск"
            className="w-full bg-transparent outline-none placeholder:text-muted"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Очистить"
              className="text-muted"
            >
              <CloseIcon className="size-5" />
            </button>
          )}
        </label>
      </header>

      {connection !== "online" && (
        <div className="flex items-center gap-2 px-5 pb-2 text-sm text-muted">
          <span className="size-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          {connection === "connecting" ? "Соединение…" : "Ожидание сети…"}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 pb-24">
        {visibleChats.length === 0 ? (
          <p className="px-6 py-12 text-center text-muted">
            {query
              ? "Ничего не найдено"
              : "Чатов пока нет. Нажмите на карандаш, чтобы начать новый."}
          </p>
        ) : (
          visibleChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              active={chat.id === activeChat?.id}
              onSelect={() => selectChat(chat.id)}
            />
          ))
        )}
      </nav>

      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        aria-label="Новый чат"
        className="absolute right-5 bottom-5 flex size-14 items-center justify-center rounded-full bg-accent text-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] transition-colors hover:bg-accent-hover"
      >
        <PencilIcon />
      </button>

      {dialogOpen && <NewChatDialog onClose={() => setDialogOpen(false)} />}
    </aside>
  );
}
