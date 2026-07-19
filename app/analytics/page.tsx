"use client";

import { mockJobs } from "@/lib/mockData";

// Historical monthly data — fills in a realistic 6-month picture
const HISTORY = [
  { month: "Feb", revenue: 3240, won: 5, lost: 2, total: 9  },
  { month: "Mar", revenue: 4850, won: 7, lost: 2, total: 12 },
  { month: "Apr", revenue: 4120, won: 6, lost: 3, total: 11 },
  { month: "May", revenue: 6380, won: 8, lost: 2, total: 13 },
  { month: "Jun", revenue: 3680, won: 5, lost: 3, total: 10 },
];

const JOB_TYPES = [
  { label: "Water Treatment",  count: 14, revenue: 11480, color: "#1ABFBF" },
  { label: "Appliance Hookup", count: 16, revenue:  6820, color: "#F26A1B" },
  { label: "Custom Job",       count:  1, revenue:  1220, color: "#3D6480" },
];

export default function AnalyticsPage() {
  const won    = mockJobs.filter(j => j.status === "Won");
  const lost   = mockJobs.filter(j => j.status === "Lost");
  const sent   = mockJobs.filter(j => j.status === "Sent");
  const draft  = mockJobs.filter(j => j.status === "Draft");
  const closed = [...won, ...lost];

  // Aggregates (history + live mock data)
  const histWon      = HISTORY.reduce((s, m) => s + m.won, 0);
  const histLost     = HISTORY.reduce((s, m) => s + m.lost, 0);
  const histRevenue  = HISTORY.reduce((s, m) => s + m.revenue, 0);
  const histTotal    = HISTORY.reduce((s, m) => s + m.total, 0);

  const allWon       = histWon  + won.length;
  const allClosed    = histWon  + histLost + won.length + lost.length;
  const ytdRevenue   = histRevenue + won.reduce((s, j) => s + (j.value ?? 0), 0);
  const winRate      = allClosed > 0 ? Math.round((allWon / allClosed) * 100) : 0;
  const pipeline     = sent.reduce((s, j) => s + (j.value ?? 0), 0);
  const avgJobValue  = allWon > 0 ? Math.round(ytdRevenue / allWon) : 0;

  // Current month live revenue from mock jobs
  const julRevenue = won.reduce((s, j) => s + (j.value ?? 0), 0);

  const chartData = [
    ...HISTORY,
    { month: "Jul", revenue: julRevenue, won: won.length, lost: lost.length, total: mockJobs.length, current: true },
  ] as { month: string; revenue: number; won: number; lost: number; total: number; current?: boolean }[];

  const maxRevenue = Math.max(...chartData.map(m => m.revenue), 1);

  // Funnel counts (history + live)
  const funnelCreated = histTotal + mockJobs.length;
  const funnelSent    = histWon + histLost + won.length + lost.length + sent.length;
  const funnelWon     = allWon;

  // SVG chart dimensions
  const SVG_W  = 600;
  const SVG_H  = 180;
  const PAD_L  = 44;
  const PAD_B  = 28;
  const PLOT_H = SVG_H - PAD_B;
  const BAR_W  = (SVG_W - PAD_L) / chartData.length;
  const BAR_PAD = 10;

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        padding: "11px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "28px", letterSpacing: "0.06em", color: "var(--text)" }}>Analytics</h1>
        <select style={{
          padding: "6px 12px", border: "1px solid var(--border)", borderRadius: "7px",
          fontSize: "12px", background: "var(--bg)", outline: "none",
          color: "var(--text-secondary)", fontFamily: "var(--font-mono)",
        }}>
          <option>YTD 2026</option>
          <option>Last 6 months</option>
          <option>Last 30 days</option>
        </select>
      </div>

      <div style={{ padding: "24px", maxWidth: "1280px" }}>

        <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "14px" }}>
          // Business Overview · YTD 2026
        </p>

        {/* ── KPI cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "14px" }}>
          {[
            {
              label: "Revenue Won",
              value: `$${ytdRevenue.toLocaleString()}`,
              sub: `YTD 2026 · ${allWon} jobs`,
              accent: "#F26A1B",
            },
            {
              label: "Win Rate",
              value: `${winRate}%`,
              sub: `${allWon} won · ${allClosed - allWon} lost`,
              accent: "#1ABFBF",
            },
            {
              label: "Open Pipeline",
              value: `$${pipeline.toLocaleString()}`,
              sub: `${sent.length} quote${sent.length !== 1 ? "s" : ""} awaiting response`,
              accent: "#B0CFE0",
            },
            {
              label: "Avg Job Value",
              value: `$${avgJobValue.toLocaleString()}`,
              sub: `across ${allWon} won jobs`,
              accent: "#B0CFE0",
            },
          ].map(card => (
            <div key={card.label} style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderTop: `3px solid ${card.accent}`,
              borderRadius: "10px",
              padding: "20px",
            }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "10px" }}>
                {card.label}
              </p>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "40px", color: card.accent, marginBottom: "4px", letterSpacing: "0.02em", lineHeight: 1 }}>
                {card.value}
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {card.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Revenue chart + win rate ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "12px", marginBottom: "14px" }}>

          {/* Revenue bar chart */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                // Monthly Revenue Won
              </p>
              <div style={{ display: "flex", gap: "14px" }}>
                {[
                  { label: "Won", color: "#1ABFBF", dashed: false },
                  { label: "Current month", color: "#F26A1B", dashed: true },
                ].map(l => (
                  <span key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    <span style={{
                      width: "10px", height: "10px", borderRadius: "2px", display: "inline-block",
                      background: l.dashed ? "rgba(242,106,27,0.25)" : l.color,
                      border: l.dashed ? "1px solid #F26A1B" : "none",
                    }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
              {/* Grid lines + Y labels */}
              {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                const y = PLOT_H - pct * PLOT_H;
                return (
                  <g key={pct}>
                    <line x1={PAD_L} y1={y} x2={SVG_W} y2={y}
                      stroke={pct === 0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}
                      strokeWidth="1" />
                    {pct > 0 && (
                      <text x={PAD_L - 6} y={y + 3.5} textAnchor="end"
                        fontSize="9" fill="#3D6480" fontFamily="DM Mono, monospace">
                        ${Math.round(maxRevenue * pct / 1000)}k
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Bars */}
              {chartData.map((m, i) => {
                const h = m.revenue > 0 ? Math.max((m.revenue / maxRevenue) * PLOT_H, 4) : 3;
                const x = PAD_L + i * BAR_W + BAR_PAD / 2;
                const w = BAR_W - BAR_PAD;
                const y = PLOT_H - h;
                const isCurrent = !!m.current;

                return (
                  <g key={m.month}>
                    <rect x={x} y={y} width={w} height={h} rx="2"
                      fill={isCurrent ? "rgba(242,106,27,0.2)" : "#1ABFBF"}
                      stroke={isCurrent ? "#F26A1B" : "none"}
                      strokeWidth="1"
                      opacity={m.revenue === 0 ? 0.25 : 1}
                    />
                    {m.revenue > 0 && (
                      <text x={x + w / 2} y={y - 5} textAnchor="middle"
                        fontSize="8.5" fill={isCurrent ? "#F26A1B" : "#B0CFE0"}
                        fontFamily="DM Mono, monospace">
                        ${(m.revenue / 1000).toFixed(1)}k
                      </text>
                    )}
                    <text x={x + w / 2} y={SVG_H - 6} textAnchor="middle"
                      fontSize="9.5"
                      fill={isCurrent ? "#F26A1B" : "#3D6480"}
                      fontFamily="DM Mono, monospace"
                      fontWeight={isCurrent ? "600" : "400"}>
                      {m.month}
                    </text>
                  </g>
                );
              })}

              {/* X axis */}
              <line x1={PAD_L} y1={PLOT_H} x2={SVG_W} y2={PLOT_H}
                stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </svg>

            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-light)", display: "flex", gap: "20px" }}>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Best Month</p>
                <p style={{ fontSize: "13px", color: "var(--text)", fontFamily: "var(--font-mono)" }}>May · $6.4k</p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Monthly Avg</p>
                <p style={{ fontSize: "13px", color: "var(--text)", fontFamily: "var(--font-mono)" }}>${Math.round(histRevenue / HISTORY.length).toLocaleString()}</p>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Jul vs Avg</p>
                <p style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: julRevenue > (histRevenue / HISTORY.length) ? "#1ABFBF" : "#F26A1B" }}>
                  {julRevenue > 0
                    ? `${Math.round((julRevenue / (histRevenue / HISTORY.length)) * 100)}% of avg`
                    : "In progress"}
                </p>
              </div>
            </div>
          </div>

          {/* Win rate card */}
          <div style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderTop: "3px solid #1ABFBF",
            borderRadius: "10px",
            padding: "20px",
            display: "flex", flexDirection: "column",
          }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "20px" }}>
              // Win Rate
            </p>

            <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "80px", color: "#1ABFBF", lineHeight: 1, letterSpacing: "0.02em", marginBottom: "6px" }}>
                {winRate}%
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "16px" }}>
                {allWon} won · {allClosed - allWon} lost · {allClosed} total
              </p>

              {/* Progress bar */}
              <div style={{ width: "100%", height: "6px", background: "rgba(239,68,68,0.15)", borderRadius: "99px", marginBottom: "24px", overflow: "hidden" }}>
                <div style={{ width: `${winRate}%`, height: "100%", background: "#1ABFBF", borderRadius: "99px" }} />
              </div>

              <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                {[
                  { label: "Won",  value: allWon,              color: "#1ABFBF" },
                  { label: "Lost", value: allClosed - allWon,  color: "#ef4444" },
                  { label: "Open", value: draft.length + sent.length, color: "#3D6480" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <p style={{ fontFamily: "var(--font-bebas)", fontSize: "32px", color: s.color, letterSpacing: "0.02em", lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: "9.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "3px" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>

          {/* Quote funnel */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "20px" }}>
              // Quote Funnel
            </p>
            {[
              { label: "Created",          count: funnelCreated, pct: 100,                                                       color: "#3D6480" },
              { label: "Sent to Customer", count: funnelSent,    pct: Math.round((funnelSent / funnelCreated) * 100),             color: "#B0CFE0" },
              { label: "Won",              count: funnelWon,     pct: Math.round((funnelWon  / funnelCreated) * 100),             color: "#1ABFBF" },
            ].map((stage, i) => (
              <div key={stage.label} style={{ marginBottom: i < 2 ? "18px" : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{stage.label}</span>
                  <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: stage.color, fontWeight: 500 }}>{stage.count}</span>
                </div>
                <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ width: `${stage.pct}%`, height: "100%", background: stage.color, borderRadius: "99px" }} />
                </div>
                <p style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                  {stage.pct}% of created
                </p>
              </div>
            ))}
          </div>

          {/* Jobs by type */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "20px" }}>
              // Revenue by Job Type
            </p>
            {JOB_TYPES.map((t, i) => {
              const totalRevenue = JOB_TYPES.reduce((s, x) => s + x.revenue, 0);
              const pct = Math.round((t.revenue / totalRevenue) * 100);
              return (
                <div key={t.label} style={{ marginBottom: i < JOB_TYPES.length - 1 ? "18px" : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: t.color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.label}</span>
                    </div>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                      ${t.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: t.color, borderRadius: "99px" }} />
                  </div>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    {t.count} jobs · {pct}% of revenue
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent closes */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "16px" }}>
              // Recent Closes
            </p>

            {/* Mock closes + live closes */}
            {[
              { customer: "Patrick DiPietro",      type: "Appliance Hookup",  value:  351, status: "Won",  date: "Jun 24" },
              { customer: "Lindsay DiPietro",       type: "Water Treatment",   value: 1288, status: "Lost", date: "Jun 24" },
              { customer: "Mike Sanderson",         type: "Water Treatment",   value:  890, status: "Won",  date: "Jun 19" },
              { customer: "Sandra Kowalski",        type: "Appliance Hookup",  value:  415, status: "Won",  date: "Jun 14" },
              { customer: "Raj Mehta",              type: "Custom Job",        value: 1220, status: "Won",  date: "Jun 10" },
            ].map((j, i, arr) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "none",
              }}>
                <span style={{
                  width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                  background: j.status === "Won" ? "#1ABFBF" : "#ef4444",
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "12.5px", color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {j.customer}
                  </p>
                  <p style={{ fontSize: "10.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {j.type} · {j.date}
                  </p>
                </div>
                <span style={{
                  fontSize: "13px", fontFamily: "var(--font-mono)",
                  color: j.status === "Won" ? "#1ABFBF" : "#ef4444",
                  fontWeight: 500, flexShrink: 0,
                }}>
                  {j.status === "Won" ? "+" : "−"}${j.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
