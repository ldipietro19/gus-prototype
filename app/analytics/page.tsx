"use client";
import { mockJobs } from "@/lib/mockData";

const MONTHS = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const MONTHLY = [
  { month: "Feb", won: 0, lost: 0, sent: 0 },
  { month: "Mar", won: 0, lost: 0, sent: 0 },
  { month: "Apr", won: 0, lost: 0, sent: 0 },
  { month: "May", won: 0, lost: 0, sent: 0 },
  { month: "Jun", won: 1, lost: 1, sent: 1 },
  { month: "Jul", won: 0, lost: 0, sent: 0 },
];

export default function AnalyticsPage() {
  const won = mockJobs.filter(j => j.status === "Won");
  const lost = mockJobs.filter(j => j.status === "Lost");
  const closed = [...won, ...lost];
  const sent = mockJobs.filter(j => j.status === "Sent");
  const winRate = closed.length > 0 ? Math.round((won.length / closed.length) * 100) : 0;
  const avgValue = closed.length > 0 ? closed.reduce((s, j) => s + (j.value ?? 0), 0) / closed.length : 0;
  const openPipeline = sent.reduce((s, j) => s + (j.value ?? 0), 0);
  const maxBar = Math.max(...MONTHLY.map(m => m.won + m.lost + m.sent), 1);
  const barH = 120;

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <div style={{ padding: "11px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <h1 style={{ fontSize: "15px", fontWeight: 600 }}>Analytics</h1>
      </div>
      <div style={{ padding: "28px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600 }}>Business Overview</h2>
          <select style={{ padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "7px", fontSize: "13px", background: "#fff", outline: "none" }}>
            <option>Last 6 months</option><option>Last 30 days</option><option>This year</option>
          </select>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
          {[
            { label: "WIN RATE",          value: `${winRate}%`,                      sub: `${won.length} of ${closed.length} closed`,      color: "#10b981" },
            { label: "AVG QUOTE VALUE",   value: `$${Math.round(avgValue).toLocaleString()}`, sub: `across ${closed.length} closed quotes`, color: "var(--text)" },
            { label: "REVENUE WON (MTD)", value: "$0",                               sub: "nothing closed this month yet",                  color: "var(--text)" },
            { label: "OPEN PIPELINE",     value: `$${openPipeline.toLocaleString()}`, sub: `${sent.length} quote awaiting response`,        color: "#3b82f6" },
          ].map(c => (
            <div key={c.label} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "10px", padding: "18px 20px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>{c.label}</p>
              <p style={{ fontSize: "26px", fontWeight: 700, color: c.color, marginBottom: "3px" }}>{c.value}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{c.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "10px" }}>
          {/* Bar chart */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>QUOTE VOLUME BY MONTH</p>
              <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#10b981", display: "inline-block" }} />Won</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#fca5a5", display: "inline-block" }} />Lost</span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", borderRadius: "2px", background: "#bfdbfe", display: "inline-block" }} />Sent</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", height: `${barH}px`, gap: "0" }}>
              {MONTHLY.map(m => {
                const total = m.won + m.lost + m.sent;
                const h = total > 0 ? (total / maxBar) * barH : 0;
                return (
                  <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    {total > 0 && (
                      <div style={{ width: "28px", display: "flex", flexDirection: "column" }}>
                        {m.won > 0 && <div style={{ height: `${(m.won / total) * h}px`, background: "#10b981", borderRadius: "2px 2px 0 0" }} />}
                        {m.lost > 0 && <div style={{ height: `${(m.lost / total) * h}px`, background: "#fca5a5" }} />}
                        {m.sent > 0 && <div style={{ height: `${(m.sent / total) * h}px`, background: "#bfdbfe", borderRadius: (!m.won && !m.lost) ? "2px 2px 0 0" : "0" }} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", marginTop: "8px" }}>
              {MONTHS.map(m => <div key={m} style={{ flex: 1, textAlign: "center", fontSize: "11px", color: "var(--text-muted)" }}>{m}</div>)}
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "14px" }}>Avg time to close: 0.0 days</p>
          </div>

          {/* Win rate */}
          <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>WIN RATE</p>
            <p style={{ fontSize: "48px", fontWeight: 700, color: "#10b981", lineHeight: 1, marginBottom: "14px" }}>{winRate}%</p>
            <div style={{ width: "100%", height: "6px", background: "#fee2e2", borderRadius: "99px", marginBottom: "18px" }}>
              <div style={{ width: `${winRate}%`, height: "100%", background: "#10b981", borderRadius: "99px" }} />
            </div>
            <div style={{ display: "flex", gap: "20px", textAlign: "center" }}>
              <div><p style={{ fontSize: "18px", fontWeight: 700, color: "#10b981" }}>{won.length}</p><p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Won</p></div>
              <div><p style={{ fontSize: "18px", fontWeight: 700 }}>{closed.length}</p><p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total closed</p></div>
              <div><p style={{ fontSize: "18px", fontWeight: 700, color: "#ef4444" }}>{lost.length}</p><p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Lost</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
