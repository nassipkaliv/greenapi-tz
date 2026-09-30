import { useState } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { clearCredentials, loadCredentials, saveCredentials } from "./lib/storage";
import type { Credentials } from "./types";

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials);

  function handleLogin(creds: Credentials) {
    saveCredentials(creds);
    setCredentials(creds);
  }

  function handleLogout() {
    clearCredentials();
    setCredentials(null);
  }

  if (!credentials) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p>Вы вошли в инстанс {credentials.idInstance}</p>
      <button
        onClick={handleLogout}
        className="rounded-xl bg-accent px-4 py-2 text-white hover:bg-accent-hover"
      >
        Выйти
      </button>
    </div>
  );
}
