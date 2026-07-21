"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { mockJobs, loadPricingSettings } from "@/lib/mockData";

const NAV = [
  {
    href: "/", label: "Home",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
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

const STATUS_DOT: Record<string, React.CSSProperties> = {
  Draft:  { border: "1.5px solid #3D6480" },
  Sent:   { background: "#3b82f6" },
  Won:    { background: "#10b981" },
  Lost:   { background: "#ef4444" },
};

const BUCKETS = [
  { key: "active", label: "Active",  statuses: ["Draft", "Sent"],  color: "#3b82f6" },
  { key: "won",    label: "Won",     statuses: ["Won"],             color: "#10b981" },
  { key: "lost",   label: "Lost",    statuses: ["Lost"],            color: "#ef4444" },
];
const CAP = 4;
const MIN_WIDTH = 52;
const MAX_WIDTH = 340;
const SNAP_COLLAPSED = 100; // below this → icon-only

export default function Sidebar({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const [width, setWidth] = useState(230);
  const [collapsed, setCollapsed] = useState(false);
  const [openBuckets, setOpenBuckets] = useState<Record<string, boolean>>({ active: true, won: false, lost: false });
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [companyName, setCompanyName] = useState("LC Plumbing Co");
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  // Sync with localStorage responses (cross-tab + same-tab)
  useEffect(() => {
    const loadResponses = () => {
      const r = JSON.parse(localStorage.getItem("gus_responses") || "{}");
      setResponses(r);
      if (Object.values(r).includes("accepted")) setOpenBuckets(b => ({ ...b, won: true }));
      if (Object.values(r).includes("declined")) setOpenBuckets(b => ({ ...b, lost: true }));
    };
    const loadSettings = () => {
      const s = loadPricingSettings();
      if (s.companyName) setCompanyName(s.companyName);
    };
    loadResponses();
    loadSettings();
    window.addEventListener("storage", loadResponses);
    window.addEventListener("gus-settings-changed", loadSettings);
    document.addEventListener("visibilitychange", loadResponses);
    return () => {
      window.removeEventListener("storage", loadResponses);
      window.removeEventListener("gus-settings-changed", loadSettings);
      document.removeEventListener("visibilitychange", loadResponses);
    };
  }, []);

  const effectiveStatus = (job: typeof mockJobs[0]) => {
    if (responses[job.id] === "accepted") return "Won";
    if (responses[job.id] === "declined") return "Lost";
    return job.status ?? "Draft";
  };

  // Hide sidebar on public customer-facing pages
  if (pathname.startsWith("/q/")) return null;

  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;

    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const next = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, startWidth.current + (ev.clientX - startX.current)));
      setWidth(next);
      setCollapsed(next < SNAP_COLLAPSED);
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  // keep collapsed in sync if user resizes wider again
  useEffect(() => {
    if (width >= SNAP_COLLAPSED && collapsed && width > SNAP_COLLAPSED) {
      // only auto-expand if drag pushed it past threshold
    }
  }, [width, collapsed]);

  const toggleCollapse = () => {
    if (collapsed) {
      setWidth(230);
      setCollapsed(false);
    } else {
      setWidth(MIN_WIDTH);
      setCollapsed(true);
    }
  };

  const toggleBucket = (key: string) =>
    setOpenBuckets(b => ({ ...b, [key]: !b[key] }));

  return (
    <aside style={{
      width: `${width}px`,
      minWidth: `${width}px`,
      background: "var(--sidebar-bg)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      height: "100vh",
      overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        padding: collapsed ? "12px 0" : "12px 14px",
        borderBottom: "1px solid var(--border)",
        minHeight: "52px",
        flexShrink: 0,
      }}>
        {collapsed ? (
          <span style={{ fontFamily: "var(--font-bebas)", fontSize: "20px", letterSpacing: "0.06em", color: "var(--orange)", lineHeight: 1 }}>G</span>
        ) : (
          <span style={{ fontFamily: "var(--font-bebas)", fontSize: "28px", letterSpacing: "0.06em", color: "var(--orange)", lineHeight: 1 }}>GUS</span>
        )}
        <div style={{ display: "flex", gap: "4px" }}>
          <button onClick={toggleCollapse} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "3px 5px", borderRadius: "4px", fontSize: "13px", fontWeight: 500 }}>
            {collapsed ? "»" : "«"}
          </button>
          {!collapsed && (
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "3px 5px", borderRadius: "4px", fontSize: "17px", lineHeight: 1 }}>+</button>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* Main nav */}
        <nav style={{ padding: "8px 6px" }}>
          {NAV.map(item => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: "9px",
                padding: collapsed ? "9px 0" : "7px 10px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "7px", marginBottom: "1px",
                fontSize: "13px", fontWeight: active ? 600 : 400,
                color: active ? "var(--orange)" : "var(--text-secondary)",
                background: active ? "rgba(242,106,27,0.1)" : "transparent",
                textDecoration: "none", transition: "background 0.1s",
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

        {/* ── Job buckets ── */}
        {!collapsed && (
          <div style={{ padding: "4px 6px 8px" }}>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 500,
              color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em",
              padding: "6px 10px 5px",
            }}>// Jobs</p>

            {BUCKETS.map(bucket => {
              const jobs = mockJobs.filter(j => bucket.statuses.includes(effectiveStatus(j)));
              const visible = openBuckets[bucket.key] ? jobs.slice(0, CAP) : [];
              const overflow = jobs.length > CAP;

              return (
                <div key={bucket.key} style={{ marginBottom: "2px" }}>
                  {/* Bucket header */}
                  <button
                    onClick={() => toggleBucket(bucket.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: "7px",
                      width: "100%", padding: "5px 10px", borderRadius: "6px",
                      background: "none", border: "none", cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}>
                    <span style={{
                      width: "6px", height: "6px", borderRadius: "50%",
                      background: bucket.color, flexShrink: 0,
                    }} />
                    <span style={{ flex: 1, fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)" }}>
                      {bucket.label}
                    </span>
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginRight: "4px" }}>
                      {jobs.length}
                    </span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: "var(--text-muted)", transform: openBuckets[bucket.key] ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  {/* Job rows */}
                  {openBuckets[bucket.key] && (
                    <div style={{ paddingLeft: "8px" }}>
                      {jobs.length === 0 && (
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)", padding: "4px 10px 6px", fontFamily: "var(--font-mono)" }}>No {bucket.label.toLowerCase()} jobs</div>
                      )}
                      {visible.map(job => (
                        <Link key={job.id} href={`/jobs/${job.id}`} style={{
                          display: "flex", alignItems: "center", gap: "8px",
                          padding: "4px 10px", borderRadius: "5px",
                          fontSize: "12px", color: "var(--text-secondary)",
                          textDecoration: "none",
                        }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                          <span style={{
                            width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                            ...STATUS_DOT[effectiveStatus(job)],
                          }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                            {job.customer ?? job.jobId}
                          </span>
                        </Link>
                      ))}
                      {overflow && (
                        <Link href="/jobs" style={{
                          display: "block", padding: "3px 10px",
                          fontSize: "11px", color: "var(--teal)",
                          textDecoration: "none", fontFamily: "var(--font-mono)",
                          letterSpacing: "0.04em",
                        }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.7"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}>
                          View all {jobs.length} →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Company footer → Settings ── */}
      <button
        onClick={() => onOpenSettings?.()}
        style={{
          padding: collapsed ? "10px 0" : "10px 16px",
          borderTop: "1px solid var(--border)",
          borderLeft: "none", borderRight: "none", borderBottom: "none",
          fontSize: "12px",
          color: "var(--text-muted)",
          background: "transparent",
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: "8px",
          fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
          flexShrink: 0,
          transition: "background 0.1s, color 0.1s",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
      >
        <span style={{
          width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
          background: "rgba(242,106,27,0.15)",
          border: "1px solid rgba(242,106,27,0.3)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", fontWeight: 700, color: "var(--orange)",
        }}>{companyName.charAt(0).toUpperCase()}</span>
        {!collapsed && (
          <span style={{ flex: 1 }}>{companyName}</span>
        )}
        {!collapsed && (
          <i className="ti ti-settings" style={{ fontSize: "13px", opacity: 0.4 }} />
        )}
      </button>

      {/* ── Drag handle ── */}
      <div
        onMouseDown={onDragStart}
        style={{
          position: "absolute", top: 0, right: 0,
          width: "5px", height: "100%",
          cursor: "col-resize",
          zIndex: 10,
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(242,106,27,0.25)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
      />
    </aside>
  );
}
