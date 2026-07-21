"use client";
import { useEffect } from "react";
import SettingsPanel from "./SettingsPanel";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(6,14,26,0.8)", backdropFilter: "blur(6px)" }}
      />

      {/* Dialog */}
      <div style={{
        position: "relative",
        width: "min(1120px, 96vw)",
        height: "min(840px, 92vh)",
        background: "var(--bg-page)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Title bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--sidebar-bg)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontFamily: "var(--font-bebas)", fontSize: "20px", color: "var(--orange)", letterSpacing: "0.06em", lineHeight: 1 }}>GUS</span>
            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.1em" }}>/ SETTINGS</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              width: "32px", height: "32px",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "18px",
              lineHeight: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"}
          >
            ×
          </button>
        </div>

        {/* Settings content */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          <SettingsPanel />
        </div>
      </div>
    </div>
  );
}
