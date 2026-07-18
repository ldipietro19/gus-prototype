"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockJobs, JobStatus } from "@/lib/mockData";

type Filter = "All" | JobStatus;

const STATUS_DISPLAY: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Draft: { label: "Draft", color: "#6b7280", icon: <span style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px dashed #d1d5db", display: "inline-block", flexShrink: 0 }} /> },
  Sent:  { label: "Sent",  color: "#3b82f6", icon: <span style={{ fontSize: "13px" }}>🔵</span> },
  Won:   { label: "Won",   color: "#10b981", icon: <span style={{ fontSize: "13px" }}>✅</span> },
  Lost:  { label: "Lost",  color: "#ef4444", icon: <span style={{ fontSize: "13px" }}>🚩</span> },
};

export default function JobsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");

  const counts = { All: mockJobs.length, Draft: 0, Sent: 0, Won: 0, Lost: 0 };
  mockJobs.forEach(j => { counts[j.status]++; });

  const filtered = mockJobs.filter(j => {
    if (filter !== "All" && j.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return j.jobId.toLowerCase().includes(q) || (j.customer ?? "").toLowerCase().includes(q) || j.jobType.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 24px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "15px", fontWeight: 600 }}>Jobs</h1>
        <button onClick={() => router.push("/jobs/new")} style={{ background: "var(--orange)", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
          Start a job
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", borderBottom: "1px solid var(--border)", gap: "12px" }}>
        <div style={{ display: "flex", gap: "4px" }}>
          {(["All", "Draft", "Sent", "Won", "Lost"] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "5px 12px", borderRadius: "99px", border: `1px solid ${filter === f ? "#d1d5db" : "transparent"}`, background: filter === f ? "#fff" : "transparent", color: filter === f ? "var(--text)" : "var(--text-secondary)", fontSize: "13px", fontWeight: filter === f ? 600 : 400, cursor: "pointer", boxShadow: filter === f ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}>
              {f} <span style={{ opacity: 0.55, fontWeight: 400 }}>{counts[f as keyof typeof counts]}</span>
            </button>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: "6px 12px 6px 28px", borderRadius: "7px", border: "1px solid var(--border)", fontSize: "13px", width: "200px", outline: "none", color: "var(--text)" }} />
        </div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["JOB ID", "STATUS", "CUSTOMER", "JOB TYPE", "PARTS", "QUOTE", "VALUE", "CLOSED AT", ""].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(job => {
            const sd = STATUS_DISPLAY[job.status];
            return (
              <tr key={job.id} onClick={() => router.push(`/jobs/${job.id}`)}
                style={{ borderBottom: "1px solid var(--border-light)", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <td style={{ padding: "11px 16px", fontWeight: 500, fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>{job.jobId}</td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: sd.color, fontWeight: 500, fontSize: "13px" }}>
                    {sd.icon} {sd.label}
                  </span>
                </td>
                <td style={{ padding: "11px 16px", color: job.customer ? "var(--text)" : "var(--text-muted)" }}>{job.customer ?? "—"}</td>
                <td style={{ padding: "11px 16px", color: "var(--text-secondary)" }}>{job.jobType}</td>
                <td style={{ padding: "11px 16px", textAlign: "center" }}>{job.hasParts ? <span style={{ color: "#10b981", fontSize: "15px" }}>✓</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                <td style={{ padding: "11px 16px", textAlign: "center" }}>{job.hasQuote ? <span style={{ color: "#10b981", fontSize: "15px" }}>✓</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                <td style={{ padding: "11px 16px", fontWeight: 500 }}>{job.value != null ? `$${job.value.toLocaleString()}` : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                <td style={{ padding: "11px 16px", color: "var(--text-secondary)", fontSize: "12px" }}>{job.closedAt ?? <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                <td style={{ padding: "11px 16px", color: "var(--text-muted)", fontSize: "12px" }}>{job.createdAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
