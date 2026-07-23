"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import SettingsModal from "./SettingsModal";
import { loadPricingSettings } from "@/lib/mockData";

function applyDisplaySettings() {
  const s = loadPricingSettings();
  // Theme
  const t = s.theme ?? "dark";
  const effective =
    t === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : t;
  document.documentElement.setAttribute("data-theme", effective);
  // Compact view
  document.documentElement.setAttribute("data-compact", s.compactView ? "true" : "false");
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    applyDisplaySettings();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    window.addEventListener("gus-settings-changed", applyDisplaySettings);
    mq.addEventListener("change", applyDisplaySettings);
    return () => {
      window.removeEventListener("gus-settings-changed", applyDisplaySettings);
      mq.removeEventListener("change", applyDisplaySettings);
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
