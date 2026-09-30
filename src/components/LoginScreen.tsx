import { useState, type FormEvent } from "react";
import { GreenApiError, getStateInstance } from "../api/greenApi";
import type { Credentials } from "../types";

interface LoginScreenProps {
  onLogin: (creds: Credentials) => void;
}

function guessApiUrl(idInstance: string): string {
  const prefix = idInstance.trim().slice(0, 4);
  return /^\d{4}$/.test(prefix) ? `https://${prefix}.api.green-api.com` : "";
}

const inputClass =
  "w-full rounded-xl border border-line bg-sidebar px-4 py-3 outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/10";

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [apiUrl, setApiUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    <main className="flex min-h-full items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-surface p-8 shadow-xl shadow-black/5"
      >
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold">Вход в чат</h1>
          <p className="mt-1 text-sm text-muted">Данные инстанса из личного кабинета GREEN-API</p>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-muted">idInstance</span>
            <input
              className={inputClass}
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              inputMode="numeric"
              placeholder="1101000001"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-muted">apiTokenInstance</span>
            <input
              className={inputClass}
              type="password"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-muted">apiUrl</span>
            <input
              className={inputClass}
              type="url"
              value={effectiveApiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://1101.api.green-api.com"
              required
            />
          </label>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-accent py-3 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Проверяем…" : "Войти"}
        </button>
      </form>
    </main>
  );
}
