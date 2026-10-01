import { useCallback, useState } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar } from "./components/Sidebar";
import { TabBlockedScreen } from "./components/TabBlockedScreen";
import { useTabLock } from "./hooks/useTabLock";
import { clearCredentials, loadCredentials, saveCredentials } from "./lib/storage";
import { ChatProvider } from "./store/ChatProvider";
import type { Credentials } from "./types";

interface MessengerProps {
  credentials: Credentials;
  onLogout: () => void;
  onUnauthorized: () => void;
}

function Messenger({ credentials, onLogout, onUnauthorized }: MessengerProps) {
  const { state, takeOver } = useTabLock(`greenapi-chat:${credentials.idInstance}`);

  if (state === "pending") return null;
  if (state === "blocked") return <TabBlockedScreen onTakeOver={takeOver} />;

  return (
    <ChatProvider credentials={credentials} onUnauthorized={onUnauthorized}>
      <div className="flex h-full">
        <Sidebar onLogout={onLogout} />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials);
  const [notice, setNotice] = useState<string | null>(null);

  function handleLogin(creds: Credentials) {
    saveCredentials(creds);
    setNotice(null);
    setCredentials(creds);
  }

  const handleLogout = useCallback(() => {
    clearCredentials();
    setCredentials(null);
  }, []);

  const handleUnauthorized = useCallback(() => {
    clearCredentials();
    setNotice("Токен инстанса больше не действует. Войдите заново.");
    setCredentials(null);
  }, []);

  if (!credentials) {
    return <LoginScreen notice={notice} onLogin={handleLogin} />;
  }

  return (
    <Messenger
      key={credentials.idInstance}
      credentials={credentials}
      onLogout={handleLogout}
      onUnauthorized={handleUnauthorized}
    />
  );
}
