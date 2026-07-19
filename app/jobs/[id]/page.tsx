"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockJobs, defaultPricingSettings, loadPricingSettings } from "@/lib/mockData";
import { calculateTax, formatTaxLabel, PST_PROVINCES } from "@/lib/taxEngine";

type Tab = "Design" | "BOM" | "Quote";

const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  HIGH: { bg: "rgba(242,106,27,0.12)", color: "#F26A1B", border: "rgba(242,106,27,0.35)" },
  MED:  { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.35)" },
  LOW:  { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.35)" },
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const job = mockJobs.find(j => j.id === id);

  const [tab, setTab] = useState<Tab>("Design");
  const [answers, setAnswers] = useState<Record<number, string>>(
    Object.fromEntries((job?.todos ?? []).map((t, i) => [i, t.answer ?? ""]))
  );
  const [laborRate, setLaborRate] = useState(job?.laborRate ?? 113);
  const [laborHours, setLaborHours] = useState(job?.laborHours ?? 2);
  const [margin, setMargin] = useState(job?.margin ?? 30);
  const [province, setProvince] = useState(defaultPricingSettings.province);
  const [pstRegistered, setPstRegistered] = useState(defaultPricingSettings.pstRegistered);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOrigin, setShareOrigin] = useState("");
  const [customerResponse, setCustomerResponse] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    setShareOrigin(window.location.origin);

    // Apply settings defaults
    const s = loadPricingSettings();
    if (!job?.laborRate) setLaborRate(s.standardLaborRate);
    if (!job?.margin) setMargin(s.defaultMarkup);
    setProvince(s.province);
    setPstRegistered(s.pstRegistered);

    const checkResponse = () => {
      const stored = JSON.parse(localStorage.getItem("gus_responses") || "{}");
      if (job?.id && stored[job.id]) setCustomerResponse(stored[job.id]);
    };

    checkResponse(); // on mount
    window.addEventListener("storage", checkResponse);       // other tab changes
    document.addEventListener("visibilitychange", checkResponse); // switching back to this tab

    return () => {
      window.removeEventListener("storage", checkResponse);
      document.removeEventListener("visibilitychange", checkResponse);
    };
  }, [job?.id]);

  if (!job) return (
    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
      Job not found. <button onClick={() => router.push("/jobs")} style={{ color: "var(--orange)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Back to Jobs</button>
    </div>
  );

  const hasDesign = !!job.description;

  const tabBtn = (t: Tab): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "5px 14px", borderRadius: "6px",
    border: `1px solid ${tab === t ? "rgba(255,255,255,0.12)" : "transparent"}`,
    background: tab === t ? "rgba(255,255,255,0.07)" : "transparent",
    color: tab === t ? "var(--text)" : "var(--text-muted)",
    fontSize: "13px", fontWeight: tab === t ? 600 : 400, cursor: "pointer",
  });

  // Financials
  const materialsCost = job.parts?.flatMap(g => g.items).reduce((s, i) => s + i.qty * i.unit, 0) ?? 0;
  const materialsWithMargin = materialsCost * (1 + margin / 100);
  const labour = laborRate * laborHours;
  const subtotal = materialsWithMargin + labour;

  // Tax engine — reads province from settings (loaded in useEffect)
  const taxResult = calculateTax(province, materialsWithMargin, labour);
  const showPstWarning = PST_PROVINCES.includes(province) && !pstRegistered;
  const grandTotal = subtotal + taxResult.totalTax;

  const shareUrl = `${shareOrigin}/q/${job.id}`;
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Effective status — customer response overrides mock data
  const effectiveStatus = customerResponse === "accepted" ? "Won"
    : customerResponse === "declined" ? "Lost"
    : job.status;

  const StatusIcon = () => {
    if (effectiveStatus === "Draft") return <span style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1.5px dashed var(--text-muted)", display: "inline-block" }} />;
    if (effectiveStatus === "Sent") return <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />;
    if (effectiveStatus === "Won") return <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />;
    return <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />;
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border)",
    color: "var(--text)",
    borderRadius: "5px",
    outline: "none",
    fontSize: "13px",
  };

  const prefixStyle: React.CSSProperties = {
    padding: "5px 8px",
    borderRight: "1px solid var(--border)",
    fontSize: "12px",
    color: "var(--text-muted)",
    background: "rgba(255,255,255,0.04)",
    fontFamily: "var(--font-mono)",
  };

  const suffixStyle: React.CSSProperties = {
    padding: "5px 8px",
    borderLeft: "1px solid var(--border)",
    fontSize: "12px",
    color: "var(--text-muted)",
    background: "rgba(255,255,255,0.04)",
    fontFamily: "var(--font-mono)",
  };

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Breadcrumb nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={() => router.push("/jobs")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: "13px", padding: 0 }}>Jobs</button>
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>/</span>
          <span style={{ fontSize: "13px", fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{job.jobId}</span>
          <div style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>
            {(["Design", "BOM", "Quote"] as Tab[]).map(t => {
              const done = (t === "Design" && hasDesign) || (t === "BOM" && job.hasParts) || (t === "Quote" && job.hasQuote);
              return (
                <button key={t} onClick={() => setTab(t)} style={tabBtn(t)}>
                  {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
            <StatusIcon /> {effectiveStatus}
          </span>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1 }}>⋯</button>
        </div>
      </div>

      {/* Customer response banner */}
      {customerResponse && (
        <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: "10px", background: customerResponse === "accepted" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", borderBottom: `1px solid ${customerResponse === "accepted" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
          <span style={{ fontSize: "15px" }}>{customerResponse === "accepted" ? "✓" : "✕"}</span>
          <span style={{ fontSize: "13px", color: customerResponse === "accepted" ? "#34d399" : "#f87171", fontWeight: 500 }}>
            {customerResponse === "accepted" ? "Customer accepted this quote" : "Customer declined this quote"}
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginLeft: "4px" }}>— status updated to {effectiveStatus}</span>
        </div>
      )}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "72px" }}>

        {/* ── DESIGN: empty ── */}
        {tab === "Design" && !hasDesign && (
          <div style={{ maxWidth: "720px", margin: "56px auto", padding: "0 24px" }}>
            <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "36px", letterSpacing: "0.04em", marginBottom: "20px", color: "var(--text)" }}>Add a job description</h2>
            <select style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", marginBottom: "14px", background: "var(--bg)", color: "var(--text)", outline: "none" }}>
              <option>Custom job</option>
              <option>WATER_TREATMENT</option>
              <option>Appliance Hookup</option>
            </select>
            <textarea
              placeholder="Describe the work in your own words — what's broken, what the customer wants, what you've already seen on site, etc."
              style={{ width: "100%", height: "200px", padding: "14px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", resize: "vertical", color: "var(--text)", outline: "none", lineHeight: 1.6, background: "var(--bg)" }} />
          </div>
        )}

        {/* ── DESIGN: filled ── */}
        {tab === "Design" && hasDesign && (
          <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "6px" }}>// Job Description</p>
                <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "32px", letterSpacing: "0.04em", marginBottom: "8px", color: "var(--text)" }}>{job.jobType}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.7 }}>{job.description}</p>
              </div>
              <button style={{ padding: "6px 14px", border: "1px solid var(--border)", borderRadius: "7px", background: "rgba(255,255,255,0.05)", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, marginLeft: "16px", color: "var(--text-secondary)" }}>Edit</button>
            </div>

            <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, var(--teal), transparent)", opacity: 0.2, margin: "24px 0" }} />

            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "16px" }}>// Confirm the following details</p>

            {/* To-dos */}
            {job.todos && (
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "12px", color: "var(--text-secondary)" }}>
                  To-do&apos;s <span style={{ fontWeight: 400, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>({job.todos.length})</span>
                </p>
                {job.todos.map((todo, i) => (
                  <div key={i} style={{ border: "1px solid var(--border)", borderTop: "2px solid var(--orange)", borderRadius: "10px", padding: "16px", marginBottom: "10px", background: "var(--bg)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: "12px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>{todo.question}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        {answers[i] && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                        <span style={{ fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-mono)", padding: "2px 7px", borderRadius: "4px", background: PRIORITY_STYLE[todo.priority].bg, color: PRIORITY_STYLE[todo.priority].color, border: `1px solid ${PRIORITY_STYLE[todo.priority].border}`, letterSpacing: "0.08em" }}>{todo.priority}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {todo.options.map(opt => (
                        <button key={opt} onClick={() => setAnswers(a => ({ ...a, [i]: opt }))}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "7px",
                            border: `1px solid ${answers[i] === opt ? "var(--orange)" : "var(--border)"}`,
                            background: answers[i] === opt ? "var(--orange-light)" : "rgba(255,255,255,0.04)",
                            color: answers[i] === opt ? "var(--orange)" : "var(--text-secondary)",
                            fontSize: "13px",
                            cursor: "pointer",
                            fontWeight: answers[i] === opt ? 600 : 400,
                          }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Assumptions */}
            {job.assumptions && (
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px", color: "var(--text-secondary)" }}>
                  Assumptions <span style={{ fontWeight: 400, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>({job.assumptions.length})</span>
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>GUS has filled in its best answer for each. Tap to change.</p>
                <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", background: "var(--bg)" }}>
                  {job.assumptions.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: "16px", padding: "10px 16px", borderBottom: i < job.assumptions!.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", width: "180px", flexShrink: 0, fontFamily: "var(--font-mono)" }}>{a.label}</span>
                      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BOM ── */}
        {tab === "BOM" && (
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "3px" }}>
                {["Parts", "System"].map((v, i) => (
                  <button key={v} style={{
                    padding: "5px 14px",
                    borderRadius: "6px",
                    border: `1px solid ${i === 0 ? "rgba(255,255,255,0.12)" : "transparent"}`,
                    background: i === 0 ? "rgba(255,255,255,0.07)" : "transparent",
                    fontSize: "13px",
                    fontWeight: i === 0 ? 600 : 400,
                    color: i === 0 ? "var(--text)" : "var(--text-muted)",
                    cursor: "pointer",
                  }}>{v}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                Supplier
                <select style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", background: "var(--bg)", color: "var(--text)" }}>
                  <option>Sheret.com</option>
                </select>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["PART", "SKU", "QTY", "UNIT", "TOTAL", ""].map((h, i) => (
                    <th key={i} style={{
                      textAlign: i >= 2 ? "right" : "left",
                      padding: "8px 12px",
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      width: i === 2 ? "90px" : i === 3 ? "110px" : i === 4 ? "100px" : i === 5 ? "56px" : "auto",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {job.parts?.map(group => {
                  const groupTotal = group.items.reduce((s, i) => s + i.qty * i.unit, 0);
                  return [
                    <tr key={`g-${group.category}`} style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid var(--border)" }}>
                      <td colSpan={4} style={{ padding: "8px 12px", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {group.category} <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>{group.items.length} {group.items.length === 1 ? "item" : "items"}</span>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "var(--text)" }}>${groupTotal.toFixed(2)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: "18px", lineHeight: 1 }}>+</button>
                      </td>
                    </tr>,
                    ...group.items.map((item, idx) => (
                      <tr key={`${group.category}-${idx}`} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "10px 12px", lineHeight: 1.4, color: "var(--text)" }}>{item.name}</td>
                        <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: "11px", fontFamily: "var(--font-mono)" }}>{item.sku}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          <input type="number" defaultValue={item.qty} style={{ ...inputStyle, width: "55px", padding: "4px 8px", textAlign: "right" }} />
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-secondary)" }}>
                          $&nbsp;<input type="number" defaultValue={item.unit.toFixed(2)} step="0.01" style={{ ...inputStyle, width: "72px", padding: "4px 8px", textAlign: "right" }} />
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 500, color: "var(--text)" }}>${(item.qty * item.unit).toFixed(2)}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", marginRight: "4px" }}>⇌</button>
                          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>×</button>
                        </td>
                      </tr>
                    )),
                  ];
                })}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 12px", borderTop: "1px solid var(--border)" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-mono)" }}>Materials total &nbsp; ${materialsCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* ── QUOTE ── */}
        {tab === "Quote" && (
          <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>// Customer</p>
            <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "28px", letterSpacing: "0.04em", marginBottom: "16px", color: "var(--text)" }}>Customer Details</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-muted)", width: "90px", flexShrink: 0, fontFamily: "var(--font-mono)" }}>Customer</label>
              <input placeholder="Search or create a customer" defaultValue={job.customer ?? ""}
                style={{ flex: 1, padding: "8px 14px", border: "1px solid var(--border)", borderRadius: "7px", fontSize: "14px", outline: "none", background: "rgba(255,255,255,0.05)" }} />
            </div>

            <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>// Summary</p>
            <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "28px", letterSpacing: "0.04em", marginBottom: "14px", color: "var(--text)" }}>Quote</h2>
            <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", background: "var(--bg)" }}>
              {[
                { label: "Materials cost", value: `$${materialsCost.toFixed(2)} CAD`, control: null },
                { label: "Margin", value: `$${(materialsCost * margin / 100).toFixed(2)} CAD`, control: (
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                    <span style={prefixStyle}>%</span>
                    <input type="number" value={margin} onChange={e => setMargin(+e.target.value)} style={{ ...inputStyle, width: "55px", padding: "5px 8px", border: "none", borderRadius: 0 }} />
                  </div>
                )},
                { label: "Materials w/ margin", value: `$${materialsWithMargin.toFixed(2)} CAD`, control: null },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: `1px solid ${i < arr.length - 1 ? "var(--border-light)" : "var(--border)"}` }}>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{row.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {row.control}
                    <span style={{ fontSize: "14px", minWidth: "110px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text)" }}>{row.value}</span>
                  </div>
                </div>
              ))}

              {/* Labour */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Labour</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                    <input type="number" value={laborRate} onChange={e => setLaborRate(+e.target.value)} style={{ ...inputStyle, width: "55px", padding: "5px 8px", border: "none", borderRadius: 0 }} />
                    <span style={{ ...prefixStyle, borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>$/hr</span>
                    <input type="number" value={laborHours} onChange={e => setLaborHours(+e.target.value)} style={{ ...inputStyle, width: "45px", padding: "5px 8px", border: "none", borderRadius: 0 }} />
                    <span style={suffixStyle}>hrs</span>
                  </div>
                  <span style={{ fontSize: "14px", minWidth: "110px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text)" }}>${labour.toFixed(2)} CAD</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Subtotal</span>
                <span style={{ fontSize: "14px", minWidth: "110px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text)" }}>${subtotal.toFixed(2)} CAD</span>
              </div>

              {/* PST registration warning */}
              {showPstWarning && (
                <div style={{ margin: "0", padding: "10px 20px", background: "rgba(242,106,27,0.08)", borderBottom: "1px solid rgba(242,106,27,0.2)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "15px", flexShrink: 0 }}>⚠️</span>
                  <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    You may need to register for PST before collecting it from customers.
                  </span>
                </div>
              )}

              {/* Tax lines from engine — skip $0 lines */}
              {taxResult.lines.filter(line => line.amount > 0).map((line, i, arr) => (
                <div key={line.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "1px solid var(--border)" }}>
                  <div>
                    <span style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>{formatTaxLabel(line)}</span>
                  </div>
                  <span style={{ fontSize: "13.5px", minWidth: "110px", textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text)" }}>${line.amount.toFixed(2)} CAD</span>
                </div>
              ))}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "rgba(242,106,27,0.06)", borderTop: "1px solid rgba(242,106,27,0.2)" }}>
                <span style={{ fontFamily: "var(--font-bebas)", fontSize: "20px", letterSpacing: "0.06em", color: "var(--text)", fontWeight: 700 }}>Grand Total</span>
                <span style={{ fontFamily: "var(--font-bebas)", fontSize: "22px", letterSpacing: "0.04em", color: "var(--orange)" }}>${grandTotal.toFixed(2)} CAD</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share modal */}
      {showShareModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
          onClick={e => { if (e.target === e.currentTarget) setShowShareModal(false); }}>
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px", padding: "28px", width: "100%", maxWidth: "460px", boxShadow: "0 24px 48px rgba(0,0,0,0.4)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--teal)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "4px" }}>// Share with customer</div>
                <div style={{ fontSize: "17px", fontWeight: 500, color: "var(--text)" }}>Customer quote link</div>
              </div>
              <button onClick={() => setShowShareModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "20px", lineHeight: 1, padding: "4px" }}>×</button>
            </div>

            {/* Response status if already answered */}
            {customerResponse && (
              <div style={{ padding: "12px 14px", borderRadius: "8px", marginBottom: "16px", background: customerResponse === "accepted" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${customerResponse === "accepted" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px" }}>{customerResponse === "accepted" ? "✓" : "✕"}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: customerResponse === "accepted" ? "#34d399" : "#f87171" }}>
                    Customer {customerResponse} this quote
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px" }}>Job status updated to {effectiveStatus}</div>
                </div>
              </div>
            )}

            {/* Link field */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", fontFamily: "var(--font-mono)" }}>Shareable link</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 1, background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "8px", padding: "9px 12px", fontSize: "12.5px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {shareUrl}
                </div>
                <button onClick={copyLink} style={{ background: copied ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.07)", border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : "var(--border)"}`, borderRadius: "8px", padding: "9px 14px", fontSize: "12.5px", color: copied ? "#34d399" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap", fontWeight: 500, transition: "all 0.15s" }}>
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
              </div>
            </div>

            {/* Open preview */}
            <a href={shareUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", width: "100%", padding: "10px", background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px", color: "var(--teal)", textDecoration: "none", marginBottom: "12px" }}>
              <span>Open customer view</span>
              <span style={{ fontSize: "11px" }}>↗</span>
            </a>

            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
              // When the customer accepts or declines, this job updates automatically.
            </p>
          </div>
        </div>
      )}

      {/* Fixed bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: "230px", right: 0, background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        {tab === "Design" && !hasDesign && (
          <>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>// GUS is waiting for a description...</span>
            <button style={{ background: "var(--orange)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: 0.6 }}>Analyze</button>
          </>
        )}
        {tab === "Design" && hasDesign && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", border: "1px solid var(--border)", borderRadius: "8px", padding: "7px 14px", background: "rgba(255,255,255,0.03)" }}>
            <input placeholder="Ask GUS to add or edit..." style={{ flex: 1, border: "none", outline: "none", fontSize: "13px", color: "var(--text)", background: "transparent" }} />
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px" }}>+</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "15px" }}>🎤</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--orange)", fontSize: "16px", fontWeight: 700 }}>↑</button>
          </div>
        )}
        {tab === "BOM" && (
          <>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>Review and adjust parts</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Ready for quote creation</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "8px", background: "rgba(255,255,255,0.05)", fontSize: "13px", cursor: "pointer", color: "var(--text-secondary)" }}>Download Parts List</button>
              <button onClick={() => setTab("Quote")} style={{ background: "var(--orange)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Continue to Quote</button>
            </div>
          </>
        )}
        {tab === "Quote" && (
          <>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>Review the quote</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Adjust labour and margin as needed</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "8px", background: "rgba(255,255,255,0.05)", fontSize: "13px", cursor: "pointer", color: "var(--text-secondary)" }}>Download Quote</button>
              <button onClick={() => setShowShareModal(true)} style={{ background: "var(--orange)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                {customerResponse ? "View response" : "Share Quote"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
