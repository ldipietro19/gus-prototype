"use client";
import { useState } from "react";
import Link from "next/link";

type SettingsTab = "General" | "AI & Developer" | "Organization" | "Plan" | "Dev Logging";

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>("General");
  const [theme, setTheme] = useState<"Dark Navy" | "Dark Gray" | "Light">("Dark Navy");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Settings sidebar */}
      <div style={{ width: "200px", minWidth: "200px", background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)", padding: "12px 8px" }}>
        <Link href="/jobs"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 10px", fontSize: "13px", color: "var(--teal)", textDecoration: "none", borderRadius: "6px", marginBottom: "12px" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
          ← Back to app
        </Link>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 500, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", padding: "4px 10px 8px" }}>// Settings</p>
        {(["General", "AI & Developer", "Organization", "Plan", "Dev Logging"] as SettingsTab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "7px 10px",
              borderRadius: "6px",
              border: "none",
              background: tab === t ? "rgba(242,106,27,0.1)" : "transparent",
              color: tab === t ? "var(--orange)" : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: tab === t ? 600 : 400,
              cursor: "pointer",
              textAlign: "left",
              marginBottom: "1px",
              borderLeft: tab === t ? "2px solid var(--orange)" : "2px solid transparent",
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "28px 40px", background: "var(--bg-page)" }}>
        {tab === "General" && (
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 500, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "12px" }}>// Appearance</p>
            <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "18px 20px", maxWidth: "600px", background: "var(--bg)" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                {(["Dark Navy", "Dark Gray", "Light"] as const).map(t => (
                  <button key={t} onClick={() => setTheme(t)}
                    style={{
                      padding: "7px 18px",
                      borderRadius: "8px",
                      border: `1px solid ${theme === t ? "var(--orange)" : "var(--border)"}`,
                      background: theme === t ? "var(--orange)" : "rgba(255,255,255,0.05)",
                      color: theme === t ? "#fff" : "var(--text-secondary)",
                      fontSize: "13px",
                      fontWeight: theme === t ? 600 : 400,
                      cursor: "pointer",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>// Stored in your browser. Applies immediately.</p>
            </div>
          </div>
        )}
        {tab === "Plan" && (
          <div style={{ maxWidth: "680px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 500, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "12px" }}>// Current Plan</p>
            <div style={{ border: "1px solid var(--border)", borderTop: "2px solid var(--orange)", borderRadius: "10px", padding: "20px", marginBottom: "24px", background: "var(--bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-bebas)", fontSize: "28px", letterSpacing: "0.04em", marginBottom: "6px", color: "var(--text)" }}>Team Pro</p>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>You can create as many jobs as you like.</p>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 500, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em" }}>UNLIMITED JOBS</span>
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 500, color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "12px" }}>// Plans</p>
            <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", background: "var(--bg)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                {[
                  { name: "Basic", price: "Free", desc: "3 jobs per month. Everything you need to try GUS.", current: false },
                  { name: "Solo Pro", price: "$99/mo", desc: "Unlimited jobs for a single plumber.", current: false },
                  { name: "Team Pro", price: "Contact us", desc: "Unlimited jobs and seats for your whole crew.", current: true },
                ].map(plan => (
                  <div key={plan.name} style={{
                    padding: "20px",
                    border: plan.current ? "2px solid var(--orange)" : "none",
                    borderRadius: plan.current ? "8px" : "0",
                    background: plan.current ? "rgba(242,106,27,0.06)" : "transparent",
                    margin: plan.current ? "8px" : "0",
                    position: "relative",
                  }}>
                    {plan.current && (
                      <span style={{ position: "absolute", top: "12px", right: "12px", background: "var(--orange)", color: "#fff", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", padding: "3px 8px", borderRadius: "99px", letterSpacing: "0.06em" }}>CURRENT</span>
                    )}
                    <p style={{ fontFamily: "var(--font-bebas)", fontSize: "22px", letterSpacing: "0.04em", marginBottom: "4px", color: "var(--text)" }}>{plan.name}</p>
                    <p style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px", color: plan.current ? "var(--orange)" : "var(--text)" }}>{plan.price}</p>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{plan.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>// Self-serve upgrades coming soon. Reach out to change your plan.</p>
              </div>
            </div>
          </div>
        )}
        {(tab === "AI & Developer" || tab === "Organization" || tab === "Dev Logging") && (
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "16px" }}>// {tab}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
