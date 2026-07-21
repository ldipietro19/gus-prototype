"use client";

import { mockJobs } from "@/lib/mockData";

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
  const won   = mockJobs.filter(j => j.status === "Won");
  const lost  = mockJobs.filter(j => j.status === "Lost");
  const sent  = mockJobs.filter(j => j.status === "Sent");
  const draft = mockJobs.filter(j => j.status === "Draft");

  const histWon     = HISTORY.reduce((s, m) => s + m.won, 0);
  const histLost    = HISTORY.reduce((s, m) => s + m.lost, 0);
  const histRevenue = HISTORY.reduce((s, m) => s + m.revenue, 0);
  const histTotal   = HISTORY.reduce((s, m) => s + m.total, 0);

  const allWon      = histWon + won.length;
  const allClosed   = histWon + histLost + won.length + lost.length;
  const ytdRevenue  = histRevenue + won.reduce((s, j) => s + (j.value ?? 0), 0);
  const winRate     = allClosed > 0 ? Math.round((allWon / allClosed) * 100) : 0;
  const pipeline    = sent.reduce((s, j) => s + (j.value ?? 0), 0);
  const avgJobValue = allWon > 0 ? Math.round(ytdRevenue / allWon) : 0;

  // Weighted average margin across job types
  const totalTypeRevenue = JOB_TYPES.reduce((s, t) => s + t.revenue, 0);
  const weightedMargin   = Math.round(
    JOB_TYPES.reduce((s, t) => s + t.revenue * (t.margin / 100), 0) / totalTypeRevenue * 100
  );

  const julRevenue = won.reduce((s, j) => s + (j.value ?? 0), 0);

  const chartData = [
    ...HISTORY,
    { month: "Jul", revenue: julRevenue, won: won.length, lost: lost.length, total: mockJobs.length, current: true },
  ] as { month: string; revenue: number; won: number; lost: number; total: number; current?: boolean }[];

  const maxRevenue = Math.max(...chartData.map(m => m.revenue), 1);

  // SVG chart
  const SVG_W  = 700;
  const SVG_H  = 200;
  const PAD_L  = 44;
  const PAD_B  = 28;
  const PLOT_H = SVG_H - PAD_B;
  const BAR_W  = (SVG_W - PAD_L) / chartData.length;
  const BAR_PAD = 12;

  // Pipeline aging buckets
  const AGING = [
    { label: "Fresh",  range: "0–3 days",  color: "#10b981", count: 1, value: 540  },
    { label: "Warm",   range: "4–7 days",  color: "#F26A1B", count: 1, value: 316  },
    { label: "Cold",   range: "8–14 days", color: "#ef4444", count: 1, value: 1140 },
    { label: "Dead",   range: "14+ days",  color: "#3D6480", count: 0, value: 0    },
  ];
  const totalAtRisk = AGING.reduce((s, b) => s + b.value, 0);

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        padding: "11px 24px", borderBottom: "1px solid var(--border)",
        background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "space-between",
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

        {/* ── KPI cards (5) ── */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "14px" }}>
          // Business Overview · YTD 2026
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "14px" }}>
          {[
            { label: "Revenue Won",   value: `$${ytdRevenue.toLocaleString()}`,    sub: `YTD · ${allWon} jobs`,                  accent: "#F26A1B" },
            { label: "Win Rate",      value: `${winRate}%`,                         sub: `${allWon} won · ${allClosed - allWon} lost`, accent: "#1ABFBF" },
            { label: "Avg Margin",    value: `${weightedMargin}%`,                  sub: "weighted · all job types",              accent: "#1ABFBF" },
            { label: "Open Pipeline", value: `$${pipeline.toLocaleString()}`,       sub: `${sent.length} estimate${sent.length !== 1 ? "s" : ""} out`, accent: "#B0CFE0" },
            { label: "Avg Job Value", value: `$${avgJobValue.toLocaleString()}`,    sub: `across ${allWon} won jobs`,             accent: "#B0CFE0" },
          ].map(card => (
            <div key={card.label} style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderTop: `3px solid ${card.accent}`, borderRadius: "10px", padding: "20px",
            }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "10px" }}>
                {card.label}
              </p>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "38px", color: card.accent, marginBottom: "4px", letterSpacing: "0.02em", lineHeight: 1 }}>
                {card.value}
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {card.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Revenue chart — full width ── */}
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px", marginBottom: "14px" }}>
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
            <line x1={PAD_L} y1={PLOT_H} x2={SVG_W} y2={PLOT_H}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </svg>

          <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-light)", display: "flex", gap: "28px" }}>
            {[
              { label: "Best Month",  value: "May · $6.4k" },
              { label: "Monthly Avg", value: `$${Math.round(histRevenue / HISTORY.length).toLocaleString()}` },
              { label: "Jul vs Avg",  value: julRevenue > 0 ? `${Math.round((julRevenue / (histRevenue / HISTORY.length)) * 100)}% of avg` : "In progress",
                                      color: julRevenue > (histRevenue / HISTORY.length) ? "#1ABFBF" : "#F26A1B" },
            ].map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>{s.label}</p>
                <p style={{ fontSize: "13px", color: (s as {color?: string}).color ?? "var(--text)", fontFamily: "var(--font-mono)" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Estimate Intelligence ── */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "14px" }}>
          // Estimate Intelligence
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>

          {/* Enhanced Quote Funnel */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "20px" }}>
              // Quote Funnel
            </p>
            {[
              { label: "Job created",       count: 63, stagePct: null, color: "#3D6480", drop: null },
              { label: "Estimate sent",      count: 46, stagePct: 73,  color: "#B0CFE0", drop: "27% never estimated" },
              { label: "Customer responded", count: 38, stagePct: 83,  color: "#F26A1B", drop: "17% went cold" },
              { label: "Won",                count: 32, stagePct: 84,  color: "#1ABFBF", drop: null },
            ].map((stage, i) => (
              <div key={stage.label} style={{ marginBottom: i < 3 ? "16px" : 0 }}>
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
                      {stage.stagePct}% of previous
                    </p>
                    {stage.drop && (
                      <p style={{ fontSize: "9.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        ↓ {stage.drop}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-light)" }}>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                When a customer responds, you close <span style={{ color: "#1ABFBF", fontWeight: 600 }}>84%</span> of the time. The gap is getting estimates out faster.
              </p>
            </div>
          </div>

          {/* Days to acceptance */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "20px" }}>
              // Time to Response
            </p>
            <div style={{ marginBottom: "24px" }}>
              <p style={{ fontFamily: "var(--font-bebas)", fontSize: "64px", color: "#1ABFBF", lineHeight: 1, letterSpacing: "0.02em" }}>2.4</p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>avg days · won jobs</p>
            </div>
            {[
              { label: "Won jobs",  days: 2.4, color: "#1ABFBF" },
              { label: "Lost jobs", days: 5.1, color: "#ef4444" },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>{row.label}</span>
                  <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: row.color }}>{row.days} days avg</span>
                </div>
                <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ width: `${(row.days / 8) * 100}%`, height: "100%", background: row.color, borderRadius: "99px" }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-light)", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Close within 3 days", value: "72%", color: "#1ABFBF" },
                { label: "Close after 7+ days",  value: "18%", color: "#ef4444" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{s.label}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: s.color, fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline at Risk — buckets only */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "20px" }}>
              // Pipeline at Risk
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {AGING.map(bucket => (
                <div key={bucket.label} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 14px",
                  background: bucket.count > 0 ? `${bucket.color}0f` : "rgba(255,255,255,0.02)",
                  border: `1px solid ${bucket.count > 0 ? bucket.color + "30" : "var(--border)"}`,
                  borderRadius: "6px",
                }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "50%", flexShrink: 0, background: bucket.color, opacity: bucket.count > 0 ? 1 : 0.25 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "12px", color: bucket.count > 0 ? "var(--text)" : "var(--text-muted)", fontWeight: 500, marginBottom: "1px" }}>
                      {bucket.range}
                    </p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)" }}>
                      {bucket.count} estimate{bucket.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p style={{ fontFamily: "var(--font-bebas)", fontSize: "22px", color: bucket.count > 0 ? bucket.color : "var(--text-muted)", letterSpacing: "0.04em", lineHeight: 1 }}>
                    {bucket.value > 0 ? `$${bucket.value.toLocaleString()}` : "—"}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Total at risk
              </span>
              <span style={{ fontFamily: "var(--font-bebas)", fontSize: "28px", color: "#F26A1B", letterSpacing: "0.04em", lineHeight: 1 }}>
                ${totalAtRisk.toLocaleString()}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
