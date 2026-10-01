import { useState, type FormEvent } from "react";
import { GreenApiError, getStateInstance } from "../api/greenApi";
import type { Credentials } from "../types";
import { SendIcon } from "./icons";
import { TextField } from "./TextField";

interface LoginScreenProps {
  notice?: string | null;
  onLogin: (creds: Credentials) => void;
}

function guessApiUrl(idInstance: string): string {
  const prefix = idInstance.trim().slice(0, 4);
  return /^\d{4}$/.test(prefix) ? `https://${prefix}.api.green-api.com` : "";
}

export function LoginScreen({ notice, onLogin }: LoginScreenProps) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(notice ?? null);
  const [loading, setLoading] = useState(false);

  const effectiveApiUrl = apiUrl ?? guessApiUrl(idInstance);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const creds: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: effectiveApiUrl.trim(),
    };

    setLoading(true);
    setError(null);

    try {
      const { stateInstance } = await getStateInstance(creds);
      if (stateInstance !== "authorized") {
        setError(`Инстанс не авторизован (${stateInstance}). Авторизуйте его в консоли GREEN-API.`);
        return;
      }
      onLogin(creds);
    } catch (err) {
      setError(
        err instanceof GreenApiError
          ? err.message
          : "Не удалось подключиться. Проверьте apiUrl и интернет.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-full justify-center overflow-y-auto px-4 py-12 md:items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-90">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 flex size-32 items-center justify-center rounded-full bg-accent text-white md:size-40">
            <SendIcon className="size-16 -rotate-12 md:size-20" />
          </div>
          <h1 className="text-3xl font-medium">GREEN-API Chat</h1>
          <p className="mt-3 text-muted">Введите данные инстанса из личного кабинета GREEN-API</p>
        </div>

        <div className="space-y-5">
          <TextField
            label="idInstance"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            inputMode="numeric"
            autoComplete="username"
            autoFocus
            required
          />
          <TextField
            label="apiTokenInstance"
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            autoComplete="current-password"
            required
          />
          <TextField
            label="apiUrl"
            type="url"
            value={effectiveApiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="mt-4 px-1 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 h-13.5 w-full rounded-xl bg-accent font-medium text-white uppercase transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Проверяем…" : "Войти"}
        </button>
      </form>
    </main>
  );
}
