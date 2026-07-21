"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import SettingsModal from "./SettingsModal";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <main style={{ flex: 1, overflow: "auto", background: "var(--bg-page)" }}>
        {children}
      </main>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}
