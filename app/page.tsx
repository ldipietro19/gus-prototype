"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadPricingSettings, saveDynamicJob, loadDynamicJobs } from "@/lib/mockData";
import type { Job, JobType } from "@/lib/mockData";

const GREETING_POOLS: Record<string, string[]> = {
  morning: ["GOOD MORNING,", "BACK AT IT,", "RISE AND PRICE,", "LET'S GET AFTER IT,", "EARLY BIRD,"],
  afternoon: ["GOOD AFTERNOON,", "AFTERNOON,", "MIDDAY PUSH,", "STILL GRINDING,", "BACK AT IT,"],
  evening: ["GOOD EVENING,", "EVENING,", "LATE PUSH,", "FINISHING STRONG,", "STILL AT IT,"],
  night: ["WORKING LATE,", "NIGHT OWL,", "STILL AT IT,", "BURNING MIDNIGHT OIL,", "GRINDING,"],
};

function pickGreeting(hour: number): string {
  const pool =
    hour < 12 ? GREETING_POOLS.morning
    : hour < 17 ? GREETING_POOLS.afternoon
    : hour < 22 ? GREETING_POOLS.evening
    : GREETING_POOLS.night;
  return pool[Math.floor(Math.random() * pool.length)];
}

function guessJobType(description: string): JobType {
  const d = description.toLowerCase();
  if (d.includes("appliance") || d.includes("dishwasher") || d.includes("hookup") || d.includes("washer") || d.includes("fridge"))
    return "Appliance Hookup";
  if (d.includes("ro") || d.includes("reverse osmosis") || d.includes("water") || d.includes("filter") || d.includes("softener"))
    return "WATER_TREATMENT";
  return "Custom job";
}

function generateJobId(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(2);
  const prefix = `KP-${mm}-${dd}-${yy}`;
  const existing = loadDynamicJobs().filter(j => j.jobId.startsWith(prefix));
  const seq = String(existing.length + 1).padStart(2, "0");
  return `${prefix}-${seq}`;
}

const JOB_TYPES: { label: string; type: JobType }[] = [
  { label: "Water Treatment", type: "WATER_TREATMENT" },
  { label: "Appliance Hookup", type: "Appliance Hookup" },
  { label: "Custom Job", type: "Custom job" },
];

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);
  const [firstName, setFirstName] = useState("Kelsea");
  const [greeting, setGreeting] = useState("BACK AT IT,");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setGreeting(pickGreeting(new Date().getHours()));
    const s = loadPricingSettings();
    if (s.displayName && s.displayName.trim()) {
      setFirstName(s.displayName.trim());
    } else if (s.email) {
      const raw = s.email.split("@")[0].split(/[._-]/)[0];
      setFirstName(raw.charAt(0).toUpperCase() + raw.slice(1));
    }
    setMounted(true);
    inputRef.current?.focus();
  }, []);

  const now = new Date();
  const dayName = now.toLocaleDateString("en-CA", { weekday: "long" }).toUpperCase();
  const dateStr = now.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" }).toUpperCase();

  const createAndNavigate = (description: string, jobType: JobType) => {
    const id = `dynamic-${Date.now()}`;
    const newJob: Job = {
      id,
      jobId: generateJobId(),
      status: "Draft",
      customer: null,
      jobType,
      hasParts: false,
      hasQuote: false,
      value: null,
      closedAt: null,
      createdAt: now.toLocaleDateString("en-CA", { month: "short", day: "numeric" }),
      description: description || undefined,
    };
    saveDynamicJob(newJob);
    router.push(`/jobs/${id}`);
  };

  const handleStart = () => {
    const d = draft.trim();
    createAndNavigate(d, guessJobType(d));
  };

  const handleChip = (type: JobType) => {
    createAndNavigate("", type);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%", padding: "40px" }}>
      <div style={{ width: "100%", maxWidth: "580px" }}>

        {/* Date eyebrow */}
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color: "var(--text-muted)",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: "24px",
          textAlign: "center",
        }}>
          // {dayName} · {dateStr}
        </p>

        {/* Greeting */}
        <h1 style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(44px, 6vw, 70px)",
          letterSpacing: "0.03em",
          lineHeight: 1,
          marginBottom: "36px",
          textAlign: "center",
        }}>
          <span style={{ color: "var(--text)" }}>{greeting} </span>
          <span style={{ color: "var(--orange)" }}>{mounted ? firstName : "Kelsea"}.</span>
        </h1>

        {/* Input */}
        <div style={{
          background: "var(--bg)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "3px",
          marginBottom: "14px",
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
            placeholder="What's the job?"
            rows={3}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              padding: "18px 56px 18px 20px",
              fontSize: "15px",
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
              cursor: draft.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke={draft.trim() ? "white" : "#3D6480"}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>

        {/* Job type chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
          {JOB_TYPES.map((t) => (
            <button
              key={t.type}
              onClick={() => handleChip(t.type)}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "7px 14px",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
                borderRadius: "2px",
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

      </div>
    </div>
  );
}
