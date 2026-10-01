import { useState } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar } from "./components/Sidebar";
import { clearCredentials, loadCredentials, saveCredentials } from "./lib/storage";
import { ChatProvider } from "./store/ChatProvider";
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
    <ChatProvider key={credentials.idInstance} credentials={credentials}>
      <div className="flex h-full">
        <Sidebar onLogout={handleLogout} />
        <ChatWindow />
      </div>
    </ChatProvider>
  );
}
