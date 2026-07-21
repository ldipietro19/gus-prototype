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
  { label: "Water Treatment",  count: 14, revenue: 11480, margin: 31, color: "#1ABFBF" },
  { label: "Appliance Hookup", count: 16, revenue:  6820, margin: 24, color: "#F26A1B" },
  { label: "Custom Job",       count:  1, revenue:  1220, margin: 18, color: "#3D6480" },
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

        {/* ── Estimate Intelligence ── */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "14px" }}>
          // Estimate Intelligence
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>

          {/* Enhanced Quote Funnel */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "20px" }}>
              // Quote Funnel
            </p>
            {[
              { label: "Job created",        count: 63, stagePct: null,  color: "#3D6480", dropNote: null },
              { label: "Estimate sent",       count: 46, stagePct: 73,   color: "#B0CFE0", dropNote: "27% never estimated" },
              { label: "Customer responded",  count: 38, stagePct: 83,   color: "#F26A1B", dropNote: "17% went cold" },
              { label: "Won",                 count: 32, stagePct: 84,   color: "#1ABFBF", dropNote: null },
            ].map((stage, i) => (
              <div key={stage.label} style={{ marginBottom: i < 3 ? "14px" : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "5px" }}>
                  <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>{stage.label}</span>
                  <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: stage.color, fontWeight: 500 }}>{stage.count}</span>
                </div>
                <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ width: `${stage.stagePct ?? 100}%`, height: "100%", background: stage.color, borderRadius: "99px" }} />
                </div>
                {stage.stagePct && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
                    <p style={{ fontSize: "9.5px", color: stage.color, fontFamily: "var(--font-mono)" }}>
                      {stage.stagePct}% of previous stage
                    </p>
                    {stage.dropNote && (
                      <p style={{ fontSize: "9.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        ↓ {stage.dropNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                When a customer responds, you close <span style={{ color: "#1ABFBF", fontWeight: 600 }}>84%</span> of the time. The leak is getting estimates out.
              </p>
            </div>
          </div>

          {/* Days to acceptance */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "20px" }}>
              // Time to Response
            </p>

            {/* Big number */}
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "64px", color: "#1ABFBF", lineHeight: 1, letterSpacing: "0.02em" }}>
                2.4
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                avg days · won jobs
              </p>
            </div>

            {/* Won vs Lost comparison */}
            {[
              { label: "Won jobs",  days: 2.4, color: "#1ABFBF", max: 8 },
              { label: "Lost jobs", days: 5.1, color: "#ef4444", max: 8 },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>{row.label}</span>
                  <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: row.color }}>
                    {row.days} days avg
                  </span>
                </div>
                <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ width: `${(row.days / row.max) * 100}%`, height: "100%", background: row.color, borderRadius: "99px" }} />
                </div>
              </div>
            ))}

            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Close within 3 days</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#1ABFBF", fontWeight: 600 }}>72%</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Close after 7+ days</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#ef4444" }}>18%</span>
              </div>
            </div>
          </div>

          {/* Estimate aging */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "6px" }}>
              // Pipeline at Risk
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: "16px" }}>
              Open estimates by age
            </p>

            {/* Heat legend */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { label: "Fresh", color: "#10b981", range: "0–3d" },
                { label: "Warm",  color: "#F26A1B", range: "4–7d" },
                { label: "Cold",  color: "#ef4444", range: "8–14d" },
                { label: "Dead",  color: "#3D6480", range: "14d+" },
              ].map(h => (
                <span key={h.label} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: h.color, display: "inline-block" }} />
                  {h.range}
                </span>
              ))}
            </div>

            {/* Estimate rows */}
            {[
              { jobId: "KP-07-17-26-01", customer: "Lindsay DiPietro", value: 540,  days: 2,  color: "#10b981" },
              { jobId: "KP-06-25-26-01", customer: "—",                value: 316,  days: 6,  color: "#F26A1B" },
              { jobId: "KP-06-15-26-01", customer: "M. Sanderson",     value: 1140, days: 13, color: "#ef4444" },
            ].map((est, i, arr) => (
              <div key={est.jobId} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 0",
                borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "none",
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, background: est.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "11.5px", color: "var(--text)", fontFamily: "var(--font-mono)", marginBottom: "1px" }}>
                    {est.jobId}
                  </p>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    {est.customer} · {est.days} days out
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: est.color, fontWeight: 600 }}>
                    ${est.value.toLocaleString()}
                  </p>
                  {/* Age bar */}
                  <div style={{ width: "60px", height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden", marginTop: "4px" }}>
                    <div style={{ width: `${Math.min((est.days / 14) * 100, 100)}%`, height: "100%", background: est.color, borderRadius: "99px" }} />
                  </div>
                </div>
              </div>
            ))}

            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Total at risk</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "#F26A1B", fontWeight: 600 }}>$1,996</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

          {/* Jobs by type + margin */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "20px" }}>
              // Revenue & Margin by Job Type
            </p>
            {JOB_TYPES.map((t, i) => {
              const totalRevenue = JOB_TYPES.reduce((s, x) => s + x.revenue, 0);
              const revPct = Math.round((t.revenue / totalRevenue) * 100);
              const marginColor = t.margin >= 28 ? "#1ABFBF" : t.margin >= 22 ? "#F26A1B" : "#3D6480";
              return (
                <div key={t.label} style={{ marginBottom: i < JOB_TYPES.length - 1 ? "18px" : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: t.color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: marginColor, background: `${marginColor}18`, border: `1px solid ${marginColor}40`, borderRadius: "4px", padding: "1px 6px" }}>
                        {t.margin}% margin
                      </span>
                      <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text)" }}>
                        ${t.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {/* Revenue bar */}
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden", marginBottom: "3px" }}>
                    <div style={{ width: `${revPct}%`, height: "100%", background: t.color, borderRadius: "99px" }} />
                  </div>
                  {/* Margin bar */}
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: `${t.margin}%`, height: "100%", background: marginColor, borderRadius: "99px", opacity: 0.5 }} />
                  </div>
                  <p style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                    {t.count} jobs · {revPct}% of revenue
                  </p>
                </div>
              );
            })}

            {/* Legend */}
            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-light)", display: "flex", gap: "12px" }}>
              <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "16px", height: "3px", background: "var(--text-muted)", borderRadius: "2px", opacity: 0.4 }} /> Revenue share
              </span>
              <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ display: "inline-block", width: "16px", height: "3px", background: "#1ABFBF", borderRadius: "2px", opacity: 0.5 }} /> Margin %
              </span>
            </div>
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
