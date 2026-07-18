"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockJobs } from "@/lib/mockData";

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
    <aside style={{
      width: collapsed ? "52px" : "230px",
      minWidth: collapsed ? "52px" : "230px",
      background: "var(--sidebar-bg)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.18s ease, min-width 0.18s ease",
      overflow: "hidden",
      height: "100vh",
    }}>

      {/* Header / Logo */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? "12px 0" : "12px 14px",
        borderBottom: "1px solid var(--border)",
        minHeight: "52px",
      }}>
        {!collapsed && (
          <span style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "28px",
            letterSpacing: "0.06em",
            color: "var(--orange)",
            lineHeight: 1,
          }}>GUS</span>
        )}
        {collapsed && (
          <span style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "20px",
            letterSpacing: "0.06em",
            color: "var(--orange)",
            lineHeight: 1,
          }}>G</span>
        )}
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "3px 5px",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: 500,
            }}>
            {collapsed ? "»" : "«"}
          </button>
          {!collapsed && (
            <button style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: "3px 5px",
              borderRadius: "4px",
              fontSize: "17px",
              lineHeight: 1,
            }}>+</button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Nav */}
        <nav style={{ padding: "8px 6px" }}>
          {NAV.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: collapsed ? "9px 0" : "7px 10px",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "7px",
                  marginBottom: "1px",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--orange)" : "var(--text-secondary)",
                  background: active ? "rgba(242, 106, 27, 0.1)" : "transparent",
                  textDecoration: "none",
                  transition: "background 0.1s",
                  borderLeft: active && !collapsed ? "2px solid var(--orange)" : "2px solid transparent",
                  paddingLeft: active && !collapsed ? "8px" : "10px",
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.5, color: active ? "var(--orange)" : "var(--text-secondary)" }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Recent Jobs */}
        {!collapsed && (
          <div style={{ padding: "4px 6px" }}>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              fontWeight: 500,
              color: "var(--teal)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              padding: "6px 10px 5px",
            }}>// Recent Jobs</p>
            {mockJobs.slice(0, 8).map(job => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.4 }}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, color: "var(--text-secondary)" }}>
                  {job.customer ?? job.jobId}
                </span>
                <span style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  ...(job.status === "Draft"
                    ? { border: "1.5px solid var(--text-muted)" }
                    : { background: job.status === "Won" ? "#10b981" : job.status === "Sent" ? "#3b82f6" : "#9ca3af" })
                }} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Company footer → Settings */}
      <Link
        href="/settings"
        style={{
          padding: collapsed ? "10px 0" : "10px 16px",
          borderTop: "1px solid var(--border)",
          fontSize: "12px",
          color: isActive("/settings") ? "var(--orange)" : "var(--text-muted)",
          background: isActive("/settings") ? "rgba(242,106,27,0.08)" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: "8px",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
          textDecoration: "none",
          flexShrink: 0,
          transition: "background 0.1s, color 0.1s",
        }}
        onMouseEnter={e => { if (!isActive("/settings")) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={e => { if (!isActive("/settings")) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <span style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: isActive("/settings") ? "rgba(242,106,27,0.25)" : "rgba(242,106,27,0.15)",
          border: `1px solid ${isActive("/settings") ? "rgba(242,106,27,0.5)" : "rgba(242,106,27,0.3)"}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: 700,
          color: "var(--orange)",
          flexShrink: 0,
        }}>L</span>
        {!collapsed && <span>LC Plumbing Co</span>}
      </Link>
    </aside>
  );
}
