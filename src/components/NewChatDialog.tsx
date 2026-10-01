import { useState, type FormEvent } from "react";
import { isValidPhone, normalizePhone } from "../lib/phone";
import { useChat } from "../store/chatContext";
import { TextField } from "./TextField";

interface NewChatDialogProps {
  onClose: () => void;
}

export function NewChatDialog({ onClose }: NewChatDialogProps) {
  const { createChat } = useChat();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = normalizePhone(phone);
    if (!isValidPhone(digits)) {
      setError("Введите номер в международном формате, например +7 999 123 45 67");
      return;
    }
    createChat(digits, name.trim() || undefined);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/25 p-4"
      onMouseDown={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
        }}
        className="w-full max-w-sm rounded-2xl bg-surface p-4 shadow-[0_4px_32px_rgba(0,0,0,0.2)]"
      >
        <h2 className="mb-5 px-1 text-xl font-medium">Новый чат</h2>

        <div className="space-y-4">
          <TextField
            label="Номер телефона"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(null);
            }}
            autoFocus
          />
          <TextField
            label="Имя (необязательно)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {error && <p className="mt-3 px-1 text-sm text-red-500">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-medium text-accent uppercase hover:bg-accent/10"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="rounded-lg px-4 py-2 font-medium text-accent uppercase hover:bg-accent/10"
          >
            Создать
          </button>
        </div>
      </form>
    </div>
  );
}
