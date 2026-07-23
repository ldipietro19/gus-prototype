"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import SettingsModal from "./SettingsModal";
import { loadPricingSettings } from "@/lib/mockData";

function applyTheme() {
  const s = loadPricingSettings();
  const t = s.theme ?? "dark";
  const effective =
    t === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : t;
  document.documentElement.setAttribute("data-theme", effective);
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    applyTheme();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    window.addEventListener("gus-settings-changed", applyTheme);
    mq.addEventListener("change", applyTheme);
    return () => {
      window.removeEventListener("gus-settings-changed", applyTheme);
      mq.removeEventListener("change", applyTheme);
    };
  }, []);

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
