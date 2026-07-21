"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { mockJobs, loadPricingSettings, defaultPricingSettings } from "@/lib/mockData";

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

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState("Kelsea");
  const [responses, setResponses] = useState<Record<string, string>>({});

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
  const dayName = now
    .toLocaleDateString("en-CA", { weekday: "long" })
    .toUpperCase();
  const dateStr = now
    .toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  const insights = deriveInsights(responses);

  const effectiveStatus = (job: (typeof mockJobs)[0]) => {
    if (responses[job.id] === "accepted") return "Won";
    if (responses[job.id] === "declined") return "Lost";
    return job.status;
  };

  const activeJobs = mockJobs.filter((j) =>
    ["Draft", "Sent"].includes(effectiveStatus(j))
  );
  const pipelineValue = mockJobs
    .filter((j) => effectiveStatus(j) === "Sent" && j.value)
    .reduce((sum, j) => sum + (j.value ?? 0), 0);
  const wonValue = mockJobs
    .filter((j) => effectiveStatus(j) === "Won" && j.value)
    .reduce((sum, j) => sum + (j.value ?? 0), 0);
  const quotedJobs = mockJobs.filter((j) => j.hasQuote);
  const respondedJobs = quotedJobs.filter((j) => responses[j.id]);
  const responseRate =
    quotedJobs.length > 0
      ? Math.round((respondedJobs.length / quotedJobs.length) * 100)
      : 0;

  const metrics = [
    { label: "Active Jobs", value: activeJobs.length.toString(), sub: "draft + sent" },
    { label: "Pipeline", value: pipelineValue > 0 ? `$${pipelineValue.toLocaleString()}` : "—", sub: "estimates out" },
    { label: "Won — All Time", value: wonValue > 0 ? `$${wonValue.toLocaleString()}` : "—", sub: "closed" },
    { label: "Response Rate", value: `${responseRate}%`, sub: "estimates accepted" },
  ];

  const statusDot: Record<string, React.CSSProperties> = {
    Draft: { border: "1.5px dashed var(--text-muted)" },
    Sent: { background: "var(--blue)" },
    Won: { background: "var(--green)" },
    Lost: { background: "var(--red)" },
  };

  return (
    <div style={{ padding: "48px 40px 80px", maxWidth: "1080px" }}>
      {/* Date eyebrow */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--teal)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: "28px",
        }}
      >
        // {dayName} · {dateStr}
      </p>

      {/* Greeting + headline */}
      <div style={{ marginBottom: "52px" }}>
        <h1
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(56px, 8vw, 100px)",
            letterSpacing: "0.02em",
            lineHeight: 0.9,
            color: "var(--text)",
          }}
        >
          {greeting}
        </h1>
        <h1
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(56px, 8vw, 100px)",
            letterSpacing: "0.02em",
            lineHeight: 0.9,
            color: "var(--orange)",
            marginBottom: "28px",
          }}
        >
          {mounted ? firstName : "KELSEA"}.
        </h1>

        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, rgba(26,191,191,0.55), transparent)",
            maxWidth: "280px",
            marginBottom: "22px",
          }}
        />

        <h2
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(24px, 3.2vw, 42px)",
            letterSpacing: "0.06em",
            color: "var(--text-secondary)",
            lineHeight: 1.05,
          }}
        >
          HERE&apos;S WHERE
          <br />
          THINGS STAND.
        </h2>
      </div>

      {/* Insight cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "14px",
          marginBottom: "32px",
        }}
      >
        {insights.map((insight, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderLeft: `3px solid ${accentColor[insight.priority]}`,
              padding: "22px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "7px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: accentColor[insight.priority],
                margin: 0,
              }}
            >
              {insight.eyebrow}
            </p>
            <p
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "20px",
                letterSpacing: "0.04em",
                color: "var(--text)",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {insight.title}
            </p>
            <p
              style={{
                fontSize: "12.5px",
                color: "var(--text-secondary)",
                lineHeight: 1.65,
                flex: 1,
                margin: 0,
              }}
            >
              {insight.body}
            </p>
            <Link
              href={insight.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: accentColor[insight.priority],
                textDecoration: "none",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginTop: "5px",
              }}
            >
              {insight.cta} →
            </Link>
          </div>
        ))}
      </div>

      {/* Metrics row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          border: "1px solid var(--border)",
          marginBottom: "40px",
          overflow: "hidden",
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              padding: "18px 20px",
              background: "var(--bg)",
              borderRight: i < 3 ? "1px solid var(--border)" : "none",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                margin: "0 0 5px",
              }}
            >
              {m.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "30px",
                letterSpacing: "0.04em",
                color: "var(--teal)",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {m.value}
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--text-muted)",
                margin: "3px 0 0",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {m.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Active jobs list */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--teal)",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              margin: 0,
            }}
          >
            // Active Jobs
          </p>
          <Link
            href="/jobs"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            View all →
          </Link>
        </div>

        <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
          {activeJobs.length === 0 && (
            <div
              style={{
                padding: "24px",
                fontSize: "13px",
                color: "var(--text-muted)",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
              }}
            >
              No active jobs right now.
            </div>
          )}
          {activeJobs.slice(0, 7).map((job, i) => {
            const eff = effectiveStatus(job);
            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 18px",
                  borderBottom:
                    i < Math.min(activeJobs.length, 7) - 1
                      ? "1px solid var(--border-light)"
                      : "none",
                  textDecoration: "none",
                  background: "var(--bg)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.03)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "var(--bg)")
                }
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    flexShrink: 0,
                    ...(statusDot[eff] ?? { background: "var(--text-muted)" }),
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    width: "136px",
                    flexShrink: 0,
                  }}
                >
                  {job.jobId}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    flex: 1,
                  }}
                >
                  {job.customer && job.customer !== "new" ? job.customer : "—"}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  {job.jobType}
                </span>
                {job.value ? (
                  <span
                    style={{
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)",
                      color:
                        eff === "Won"
                          ? "var(--green)"
                          : "var(--text-secondary)",
                      minWidth: "58px",
                      textAlign: "right",
                    }}
                  >
                    ${job.value.toLocaleString()}
                  </span>
                ) : (
                  <span style={{ minWidth: "58px" }} />
                )}
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--orange)",
                    marginLeft: "8px",
                  }}
                >
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
