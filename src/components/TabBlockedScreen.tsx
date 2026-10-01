import { ChatBubbleIcon } from "./icons";

interface TabBlockedScreenProps {
  onTakeOver: () => void;
}

export function TabBlockedScreen({ onTakeOver }: TabBlockedScreenProps) {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-24 items-center justify-center rounded-full bg-accent text-white">
        <ChatBubbleIcon className="size-12" />
      </div>
      <h1 className="text-xl font-medium">Чат открыт в другой вкладке</h1>
      <p className="max-w-sm text-muted">
        Сообщения можно получать только в одной вкладке. Нажмите «Открыть здесь», чтобы продолжить в
        этой.
      </p>
      <button
        type="button"
        onClick={onTakeOver}
        className="rounded-xl bg-accent px-6 py-3 font-medium text-white uppercase transition-colors hover:bg-accent-hover"
      >
        Открыть здесь
      </button>
    </main>
  );
}
