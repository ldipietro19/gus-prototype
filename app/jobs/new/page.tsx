"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const JOB_TYPES = [
  { value: "WATER_TREATMENT", label: "Water Treatment" },
  { value: "Appliance Hookup", label: "Appliance Hookup" },
  { value: "Custom job", label: "Custom Job" },
];

function guessJobType(description: string): string {
  const d = description.toLowerCase();
  if (d.includes("ro") || d.includes("reverse osmosis") || d.includes("water treatment") || d.includes("softener") || d.includes("filter")) {
    return "WATER_TREATMENT";
  }
  if (d.includes("appliance") || d.includes("dishwasher") || d.includes("fridge") || d.includes("washing machine") || d.includes("hookup")) {
    return "Appliance Hookup";
  }
  return "Custom job";
}

function generateJobId(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(2);
  return `KP-${mm}-${dd}-${yy}-01`;
}

// Target job to navigate to after Analyze (simulates GUS output)
function getAnalysisTarget(jobType: string): string {
  if (jobType === "WATER_TREATMENT") return "/jobs/1";
  if (jobType === "Appliance Hookup") return "/jobs/2";
  return "/jobs/5";
}

function NewJobInner() {
  const router = useRouter();
  const params = useSearchParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("Custom job");
  const [jobId, setJobId] = useState("KP-07-21-26-01");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setJobId(generateJobId());

    // Pre-fill from URL params
    const d = params.get("d");
    const t = params.get("type");
    if (d) {
      setDescription(d);
      setJobType(t ?? guessJobType(d));
    } else if (t) {
      setJobType(t);
    }

    // Also check localStorage fallback
    const stored = localStorage.getItem("gus_new_job_prompt");
    if (stored && !d) {
      setDescription(stored);
      setJobType(guessJobType(stored));
      localStorage.removeItem("gus_new_job_prompt");
    }

    // Focus textarea after mount
    setTimeout(() => textareaRef.current?.focus(), 100);
  }, [params]);

  const handleAnalyze = () => {
    if (!description.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      router.push(getAnalysisTarget(jobType));
    }, 900);
  };

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Breadcrumb nav */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "9px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => router.push("/jobs")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: "13px", padding: 0 }}
          >
            Jobs
          </button>
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>/</span>
          <span style={{ fontSize: "13px", fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
            {jobId}
          </span>
          <div style={{ marginLeft: "8px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center",
              padding: "5px 14px", borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.07)",
              color: "var(--text)",
              fontSize: "13px", fontWeight: 600,
            }}>
              Design
            </span>
            {(["BOM", "Estimate"] as const).map(t => (
              <span key={t} style={{
                display: "inline-flex", alignItems: "center",
                padding: "5px 14px", borderRadius: "6px",
                color: "var(--text-muted)", fontSize: "13px", marginLeft: "3px",
              }}>{t}</span>
            ))}
          </div>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)",
        }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1.5px dashed var(--text-muted)", display: "inline-block" }} />
          Draft
        </span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, maxWidth: "720px", margin: "56px auto", padding: "0 24px", width: "100%" }}>

        <h2 style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "36px",
          letterSpacing: "0.04em",
          marginBottom: "20px",
          color: "var(--text)",
        }}>
          Add a job description
        </h2>

        {/* Job type select */}
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            fontSize: "14px",
            marginBottom: "14px",
            background: "var(--bg)",
            color: "var(--text)",
            outline: "none",
          }}
        >
          {JOB_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Description textarea */}
        <div style={{ position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleAnalyze();
            }}
            placeholder="Describe the work in your own words — what's broken, what the customer wants, what you've already seen on site, etc."
            rows={8}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
              fontSize: "14px",
              lineHeight: 1.7,
              padding: "16px",
              paddingBottom: "48px",
              outline: "none",
              resize: "vertical",
              fontFamily: "var(--font-sans)",
            }}
          />
          {/* Char hint */}
          {description.length > 0 && (
            <p style={{
              position: "absolute",
              bottom: "12px",
              right: "14px",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
              margin: 0,
            }}>
              ⌘↵ to analyze
            </p>
          )}
        </div>

        {/* Type hint if description was pre-filled */}
        {description.length > 0 && (
          <p style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "var(--teal)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
          }}>
            // GUS read your description and flagged this as a {
              jobType === "WATER_TREATMENT" ? "Water Treatment" :
              jobType === "Appliance Hookup" ? "Appliance Hookup" : "Custom"
            } job. Update the type above if that&apos;s off.
          </p>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div style={{
        position: "fixed", bottom: 0, left: "230px", right: 0,
        background: "var(--bg)", borderTop: "1px solid var(--border)",
        padding: "10px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        zIndex: 10,
      }}>
        {analyzing ? (
          <>
            <span style={{ fontSize: "13px", color: "var(--teal)", fontFamily: "var(--font-mono)" }}>
              // GUS is analyzing the job...
            </span>
            <div style={{
              display: "flex", gap: "4px", alignItems: "center",
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "var(--orange)",
                  animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </>
        ) : description.trim() ? (
          <>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              // Ready to scope this job
            </span>
            <button
              onClick={handleAnalyze}
              style={{
                background: "var(--orange)", color: "#fff",
                border: "none", borderRadius: "8px",
                padding: "8px 20px", fontSize: "13px", fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Analyze
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              // GUS is waiting for a description...
            </span>
            <button
              disabled
              style={{
                background: "var(--orange)", color: "#fff",
                border: "none", borderRadius: "8px",
                padding: "8px 20px", fontSize: "13px", fontWeight: 600,
                cursor: "not-allowed", opacity: 0.4,
              }}
            >
              Analyze
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense>
      <NewJobInner />
    </Suspense>
  );
}
