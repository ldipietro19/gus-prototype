"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockJobs } from "@/lib/mockData";

const STATUS_DOT: Record<string, string> = {
  Draft: "border: 1.5px solid #9ca3af; background: transparent;",
  Sent: "background: #3b82f6;",
  Won: "background: #10b981;",
  Lost: "background: #9ca3af;",
};

const NAV = [
  {
    href: "/jobs", label: "Jobs",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  },
  {
    href: "/customers", label: "Customers",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    href: "/parts", label: "Parts",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  },
  {
    href: "/analytics", label: "Analytics",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside style={{ width: collapsed ? "52px" : "230px", minWidth: collapsed ? "52px" : "230px", background: "var(--sidebar-bg)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", transition: "width 0.18s ease, min-width 0.18s ease", overflow: "hidden", height: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "14px 0" : "14px 14px", borderBottom: "1px solid var(--border)", minHeight: "52px" }}>
        {!collapsed && <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em" }}>GUS</span>}
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "3px 5px", borderRadius: "4px", fontSize: "13px", fontWeight: 500 }}>
            {collapsed ? "»" : "«"}
          </button>
          {!collapsed && <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "3px 5px", borderRadius: "4px", fontSize: "17px", lineHeight: 1 }}>+</button>}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Nav */}
        <nav style={{ padding: "8px 6px" }}>
          {NAV.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                style={{ display: "flex", alignItems: "center", gap: "9px", padding: collapsed ? "9px 0" : "7px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: "7px", marginBottom: "1px", fontSize: "13px", fontWeight: active ? 600 : 400, color: active ? "var(--text)" : "var(--text-secondary)", background: active ? "#f3f4f6" : "transparent", textDecoration: "none", transition: "background 0.1s" }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.6 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Recent Jobs */}
        {!collapsed && (
          <div style={{ padding: "4px 6px" }}>
            <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "6px 10px 5px" }}>Recent Jobs</p>
            {mockJobs.slice(0, 8).map(job => (
              <Link key={job.id} href={`/jobs/${job.id}`}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 10px", borderRadius: "6px", fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.4 }}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {job.customer ?? job.jobId}
                </span>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, ...(job.status === "Draft" ? { border: "1.5px solid #9ca3af" } : { background: job.status === "Won" ? "#10b981" : job.status === "Sent" ? "#3b82f6" : "#9ca3af" }) }} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Company */}
      {!collapsed && (
        <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#f3f4f6", border: "1px solid var(--border)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "var(--text-secondary)" }}>L</span>
          LC Plumbing Co
        </div>
      )}
    </aside>
  );
}
