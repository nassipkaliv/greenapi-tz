import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { SendIcon } from "./icons";

const MAX_LENGTH = 4000;
const MAX_HEIGHT = 200;

interface MessageComposerProps {
  onSend: (text: string) => void;
}

export function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = text.trim().length > 0;

  function resize() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
  }

  function submit(event?: FormEvent) {
    event?.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText("");
    requestAnimationFrame(resize);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      submit(event);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-182 items-end gap-2 px-3 pt-1 pb-3 md:px-4 md:pb-5"
    >
      <div className="relative flex-1 rounded-[15px] rounded-br-none bg-surface shadow-[0_1px_2px_rgba(16,35,47,0.15)]">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            resize();
          }}
          onKeyDown={handleKeyDown}
          maxLength={MAX_LENGTH}
          rows={1}
          autoFocus
          placeholder="Сообщение"
          className="block max-h-50 w-full resize-none bg-transparent px-4 py-3.5 leading-snug outline-none placeholder:text-muted"
        />
        <svg
          width="9"
          height="17"
          viewBox="0 0 9 17"
          aria-hidden="true"
          className="absolute -right-2 bottom-0 fill-surface"
        >
          <path d="M6 17H0V0c.193 2.84.876 5.767 2.05 8.782.904 2.325 2.446 4.485 4.625 6.48A1 1 0 0 1 6 17z" />
        </svg>
      </div>

      <button
        type="submit"
        disabled={!canSend}
        aria-label="Отправить"
        className="ml-1 flex size-13.5 shrink-0 items-center justify-center rounded-full bg-surface text-accent shadow-[0_1px_2px_rgba(16,35,47,0.15)] transition-colors hover:bg-accent hover:text-white disabled:text-muted disabled:hover:bg-surface"
      >
        <SendIcon />
      </button>
    </form>
  );
}
