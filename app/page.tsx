"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockJobs, loadPricingSettings } from "@/lib/mockData";

type Priority = "high" | "mid" | "low";

interface Insight {
  priority: Priority;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
}

function getGreeting(hour: number) {
  if (hour < 12) return "GOOD MORNING,";
  if (hour < 17) return "GOOD AFTERNOON,";
  if (hour < 22) return "GOOD EVENING,";
  return "WORKING LATE,";
}

function deriveInsights(responses: Record<string, string>): Insight[] {
  const insights: Insight[] = [];

  const effectiveStatus = (job: (typeof mockJobs)[0]) => {
    if (responses[job.id] === "accepted") return "Won";
    if (responses[job.id] === "declined") return "Lost";
    return job.status;
  };

  // Ready to price: Draft jobs with parts but no estimate sent
  const readyJobs = mockJobs.filter(
    (j) => effectiveStatus(j) === "Draft" && j.hasParts && !j.hasQuote
  );
  if (readyJobs.length > 0) {
    const first = readyJobs[0];
    const who =
      first.customer && first.customer !== "new"
        ? first.customer
        : "This job";
    const type =
      first.jobType === "WATER_TREATMENT"
        ? "water treatment install"
        : first.jobType === "Appliance Hookup"
        ? "appliance hookup"
        : "job";
    insights.push({
      priority: "high",
      eyebrow: "// READY TO PRICE",
      title: `${readyJobs.length} job${readyJobs.length > 1 ? "s" : ""} ${readyJobs.length > 1 ? "have" : "has"} parts — no estimate sent.`,
      body: `${who}'s ${type} is fully spec'd and ready to go. Every day you wait, they're getting other quotes.`,
      cta: "Build Estimate",
      href: `/jobs/${first.id}`,
    });
  }

  // Estimate pending: Sent jobs with no response
  const pendingJobs = mockJobs.filter(
    (j) => effectiveStatus(j) === "Sent" && j.hasQuote && !responses[j.id]
  );
  if (pendingJobs.length > 0) {
    const j = pendingJobs[0];
    insights.push({
      priority: "mid",
      eyebrow: "// ESTIMATE PENDING",
      title: `${j.jobId} — no response yet.`,
      body: `This estimate is still open.${j.value ? ` $${j.value.toLocaleString()} on the line.` : ""} Estimates go cold after 2 weeks — a direct follow-up goes a long way.`,
      cta: "View Estimate",
      href: `/jobs/${j.id}`,
    });
  }

  // Won recently
  const wonJobs = mockJobs.filter((j) => effectiveStatus(j) === "Won");
  if (wonJobs.length > 0) {
    const j = wonJobs[0];
    const type =
      j.jobType === "Appliance Hookup" ? "appliance hookup" : "job";
    insights.push({
      priority: "low",
      eyebrow: "// RECENTLY WON",
      title: `${j.customer ?? j.jobId} — accepted.`,
      body: `${j.value ? `$${j.value.toLocaleString()} ` : ""}${type} closed.${j.closedAt ? ` ${j.closedAt}.` : ""} Confirm scheduling and collect the deposit before the job starts.`,
      cta: "View Job",
      href: `/jobs/${j.id}`,
    });
  }

  // Padding: pipeline health card
  if (insights.length < 3) {
    const draftCount = mockJobs.filter(
      (j) => effectiveStatus(j) === "Draft"
    ).length;
    insights.push({
      priority: "low",
      eyebrow: "// PIPELINE",
      title: `${draftCount} draft${draftCount !== 1 ? "s" : ""} without an estimate.`,
      body:
        "The faster you price and send, the higher your close rate. Price while the job is fresh — customers don't wait.",
      cta: "View Jobs",
      href: "/jobs",
    });
  }

  return insights.slice(0, 3);
}

const accentColor: Record<Priority, string> = {
  high: "#F26A1B",
  mid: "#1ABFBF",
  low: "#3D6480",
};

const JOB_TYPES = [
  { label: "Water Treatment", type: "WATER_TREATMENT" },
  { label: "Appliance Hookup", type: "Appliance Hookup" },
  { label: "Custom Job", type: "Custom job" },
];

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState("Kelsea");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const s = loadPricingSettings();
    if (s.email) {
      const raw = s.email.split("@")[0].split(/[._-]/)[0];
      setFirstName(raw.charAt(0).toUpperCase() + raw.slice(1));
    }
    const r = JSON.parse(localStorage.getItem("gus_responses") || "{}");
    setResponses(r);
    setMounted(true);
  }, []);

  const now = new Date();
  const greeting = getGreeting(now.getHours());
  const dayName = now.toLocaleDateString("en-CA", { weekday: "long" }).toUpperCase();
  const dateStr = now.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();

  const insights = deriveInsights(responses);

  const effectiveStatus = (job: (typeof mockJobs)[0]) => {
    if (responses[job.id] === "accepted") return "Won";
    if (responses[job.id] === "declined") return "Lost";
    return job.status;
  };

  const activeJobs = mockJobs.filter((j) =>
    ["Draft", "Sent"].includes(effectiveStatus(j))
  );

  const handleStart = () => {
    if (draft.trim()) {
      localStorage.setItem("gus_new_job_prompt", draft.trim());
    }
    router.push("/jobs");
  };

  const statusDot: Record<string, React.CSSProperties> = {
    Draft: { border: "1.5px dashed var(--text-muted)" },
    Sent: { background: "var(--blue)" },
    Won: { background: "var(--green)" },
    Lost: { background: "var(--red)" },
  };

  return (
    <div style={{ padding: "48px 40px 80px", maxWidth: "760px" }}>

      {/* Date eyebrow */}
      <p style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "var(--teal)",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginBottom: "24px",
      }}>
        // {dayName} · {dateStr}
      </p>

      {/* Greeting — one line */}
      <h1 style={{
        fontFamily: "var(--font-bebas)",
        fontSize: "clamp(38px, 5vw, 62px)",
        letterSpacing: "0.03em",
        lineHeight: 1,
        marginBottom: "10px",
      }}>
        <span style={{ color: "var(--text)" }}>{greeting} </span>
        <span style={{ color: "var(--orange)" }}>{mounted ? firstName : "Kelsea"}.</span>
      </h1>

      {/* Sub-line */}
      <p style={{
        fontSize: "15px",
        color: "var(--text-secondary)",
        marginBottom: "20px",
        lineHeight: 1.5,
      }}>
        What are we working on today?
      </p>

      {/* New job input */}
      <div style={{
        background: "var(--bg)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "2px",
        marginBottom: "12px",
        position: "relative",
      }}>
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleStart();
            }
          }}
          placeholder="Describe a new job... (e.g. RO install for new customer, no existing shutoff)"
          rows={3}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            padding: "16px 52px 16px 18px",
            fontSize: "14px",
            color: "var(--text)",
            fontFamily: "var(--font-sans)",
            lineHeight: 1.6,
          }}
        />
        <button
          onClick={handleStart}
          style={{
            position: "absolute",
            right: "12px",
            bottom: "12px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: draft.trim() ? "var(--orange)" : "rgba(255,255,255,0.07)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={draft.trim() ? "white" : "#3D6480"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* Job type chips */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "48px", flexWrap: "wrap" }}>
        {JOB_TYPES.map((t) => (
          <button
            key={t.type}
            onClick={() => router.push("/jobs")}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "6px 12px",
              cursor: "pointer",
              transition: "border-color 0.1s, color 0.1s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--orange)";
              (e.currentTarget as HTMLElement).style.color = "var(--orange)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            + {t.label}
          </button>
        ))}
      </div>

      {/* GUS insights */}
      <div style={{ marginBottom: "40px" }}>
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color: "var(--teal)",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          marginBottom: "14px",
        }}>
          // GUS Says
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {insights.map((insight, i) => (
            <Link
              key={i}
              href={insight.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderLeft: `3px solid ${accentColor[insight.priority]}`,
                padding: "16px 20px",
                textDecoration: "none",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: accentColor[insight.priority],
                  margin: "0 0 4px",
                }}>
                  {insight.eyebrow}
                </p>
                <p style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "18px",
                  letterSpacing: "0.04em",
                  color: "var(--text)",
                  margin: "0 0 3px",
                  lineHeight: 1.1,
                }}>
                  {insight.title}
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  {insight.body}
                </p>
              </div>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: accentColor[insight.priority],
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}>
                {insight.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Active jobs — compact */}
      <div>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}>
          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "var(--teal)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            margin: 0,
          }}>
            // Active Jobs
          </p>
          <Link href="/jobs" style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            textDecoration: "none",
          }}>
            View all →
          </Link>
        </div>

        <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
          {activeJobs.length === 0 && (
            <div style={{
              padding: "20px",
              fontSize: "12px",
              color: "var(--text-muted)",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
            }}>
              No active jobs. Start one above.
            </div>
          )}
          {activeJobs.slice(0, 6).map((job, i) => {
            const eff = effectiveStatus(job);
            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 16px",
                  borderBottom: i < Math.min(activeJobs.length, 6) - 1 ? "1px solid var(--border-light)" : "none",
                  textDecoration: "none",
                  background: "var(--bg)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--bg)")}
              >
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                  ...(statusDot[eff] ?? { background: "var(--text-muted)" }),
                }} />
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  width: "128px",
                  flexShrink: 0,
                }}>
                  {job.jobId}
                </span>
                <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", flex: 1 }}>
                  {job.customer && job.customer !== "new" ? job.customer : "—"}
                </span>
                <span style={{
                  fontSize: "10px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-muted)",
                }}>
                  {job.jobType}
                </span>
                <span style={{ fontSize: "11px", color: "var(--orange)", marginLeft: "10px" }}>→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
