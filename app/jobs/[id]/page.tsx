"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { mockJobs } from "@/lib/mockData";

type Tab = "Design" | "BOM" | "Quote";

const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  HIGH: { bg: "#fff4ed", color: "#ea580c", border: "#fed7aa" },
  MED:  { bg: "#fff4ed", color: "#ea580c", border: "#fed7aa" },
  LOW:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const job = mockJobs.find(j => j.id === id);

  const [tab, setTab] = useState<Tab>("Design");
  const [answers, setAnswers] = useState<Record<number, string>>(
    Object.fromEntries((job?.todos ?? []).map((t, i) => [i, t.answer ?? ""]))
  );
  const [laborRate, setLaborRate] = useState(job?.laborRate ?? 95);
  const [laborHours, setLaborHours] = useState(job?.laborHours ?? 2);
  const [margin, setMargin] = useState(job?.margin ?? 25);
  const [tax, setTax] = useState(job?.tax ?? 12);

  if (!job) return (
    <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
      Job not found. <button onClick={() => router.push("/jobs")} style={{ color: "var(--orange)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Back to Jobs</button>
    </div>
  );

  const hasDesign = !!job.description;

  const tabBtn = (t: Tab, done: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: "5px",
    padding: "5px 14px", borderRadius: "6px",
    border: `1px solid ${tab === t ? "#d1d5db" : "transparent"}`,
    background: tab === t ? "#fff" : "transparent",
    color: tab === t ? "var(--text)" : "var(--text-muted)",
    fontSize: "13px", fontWeight: tab === t ? 600 : 400, cursor: "pointer",
    boxShadow: tab === t ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
  });

  // Financials
  const materialsCost = job.parts?.flatMap(g => g.items).reduce((s, i) => s + i.qty * i.unit, 0) ?? 0;
  const materialsWithMargin = materialsCost * (1 + margin / 100);
  const labour = laborRate * laborHours;
  const subtotal = materialsWithMargin + labour;
  const taxAmt = subtotal * (tax / 100);
  const grandTotal = subtotal + taxAmt;

  const StatusIcon = () => {
    if (job.status === "Draft") return <span style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px dashed #d1d5db", display: "inline-block" }} />;
    if (job.status === "Sent") return <span style={{ fontSize: "13px" }}>🔵</span>;
    if (job.status === "Won") return <span style={{ fontSize: "13px" }}>✅</span>;
    return <span style={{ fontSize: "13px" }}>🚩</span>;
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Breadcrumb nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={() => router.push("/jobs")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "13px", padding: 0 }}>Jobs</button>
          <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>/</span>
          <span style={{ fontSize: "13px", fontWeight: 500 }}>{job.jobId}</span>
          <div style={{ display: "flex", gap: "3px", marginLeft: "8px" }}>
            {(["Design", "BOM", "Quote"] as Tab[]).map(t => {
              const done = (t === "Design" && hasDesign) || (t === "BOM" && job.hasParts) || (t === "Quote" && job.hasQuote);
              return (
                <button key={t} onClick={() => setTab(t)} style={tabBtn(t, done)}>
                  {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  {t}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--text-secondary)" }}>
            <StatusIcon /> {job.status}
          </span>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1 }}>⋯</button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: "72px" }}>

        {/* ── DESIGN: empty ── */}
        {tab === "Design" && !hasDesign && (
          <div style={{ maxWidth: "720px", margin: "56px auto", padding: "0 24px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "20px" }}>Add a job description</h2>
            <select style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", marginBottom: "14px", background: "#fff", color: "var(--text)", outline: "none" }}>
              <option>Custom job</option>
              <option>WATER_TREATMENT</option>
              <option>Appliance Hookup</option>
            </select>
            <textarea placeholder="Describe the work in your own words — what's broken, what the customer wants, what you've already seen on site, etc."
              style={{ width: "100%", height: "200px", padding: "14px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "14px", resize: "vertical", color: "var(--text)", outline: "none", lineHeight: 1.6 }} />
          </div>
        )}

        {/* ── DESIGN: filled ── */}
        {tab === "Design" && hasDesign && (
          <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "6px" }}>Job Description</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>{job.description}</p>
              </div>
              <button style={{ padding: "6px 14px", border: "1px solid var(--border)", borderRadius: "7px", background: "#fff", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, marginLeft: "16px" }}>Edit Description</button>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />
            <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px" }}>Confirm the following details</h3>

            {/* To-dos */}
            {job.todos && (
              <div style={{ marginBottom: "32px" }}>
                <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>
                  To-do's <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>({job.todos.length})</span>
                </p>
                {job.todos.map((todo, i) => (
                  <div key={i} style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", marginBottom: "10px", background: "#fff" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", gap: "12px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 500 }}>{todo.question}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                        {answers[i] && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
                        <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: PRIORITY_STYLE[todo.priority].bg, color: PRIORITY_STYLE[todo.priority].color, border: `1px solid ${PRIORITY_STYLE[todo.priority].border}` }}>{todo.priority}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {todo.options.map(opt => (
                        <button key={opt} onClick={() => setAnswers(a => ({ ...a, [i]: opt }))}
                          style={{ padding: "6px 14px", borderRadius: "7px", border: `1px solid ${answers[i] === opt ? "var(--orange)" : "var(--border)"}`, background: answers[i] === opt ? "var(--orange-light)" : "#fff", color: answers[i] === opt ? "var(--orange)" : "var(--text-secondary)", fontSize: "13px", cursor: "pointer", fontWeight: answers[i] === opt ? 600 : 400 }}>
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
                <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
                  Assumptions <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>({job.assumptions.length})</span>
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>GUS has filled in its best answer for each. Tap to change.</p>
                <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  {job.assumptions.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: "16px", padding: "10px 16px", borderBottom: i < job.assumptions!.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                      <span style={{ fontSize: "13px", color: "var(--text-muted)", width: "180px", flexShrink: 0 }}>{a.label}</span>
                      <span style={{ fontSize: "13px", color: "var(--text)" }}>{a.value}</span>
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
                  <button key={v} style={{ padding: "5px 14px", borderRadius: "6px", border: `1px solid ${i === 0 ? "var(--border)" : "transparent"}`, background: i === 0 ? "#fff" : "transparent", fontSize: "13px", fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "var(--text)" : "var(--text-secondary)", cursor: "pointer" }}>{v}</button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)" }}>
                Supplier
                <select style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "13px", background: "#fff", color: "var(--text)" }}>
                  <option>Sheret.com</option>
                </select>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>PART</th>
                  <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "100px" }}>SKU</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "90px" }}>QTY</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "110px" }}>UNIT</th>
                  <th style={{ textAlign: "right", padding: "8px 12px", fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", width: "100px" }}>TOTAL</th>
                  <th style={{ width: "56px" }} />
                </tr>
              </thead>
              <tbody>
                {job.parts?.map(group => {
                  const groupTotal = group.items.reduce((s, i) => s + i.qty * i.unit, 0);
                  return [
                    <tr key={`g-${group.category}`} style={{ background: "#f9fafb", borderBottom: "1px solid var(--border)" }}>
                      <td colSpan={4} style={{ padding: "8px 12px", fontSize: "12px", fontWeight: 700 }}>
                        {group.category} <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>{group.items.length} {group.items.length === 1 ? "item" : "items"}</span>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700 }}>${groupTotal.toFixed(2)}</td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px", lineHeight: 1 }}>+</button>
                      </td>
                    </tr>,
                    ...group.items.map((item, idx) => (
                      <tr key={`${group.category}-${idx}`} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "10px 12px", lineHeight: 1.4 }}>{item.name}</td>
                        <td style={{ padding: "10px 12px", color: "var(--text-muted)", fontSize: "12px" }}>{item.sku}</td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          <input type="number" defaultValue={item.qty} style={{ width: "55px", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "5px", textAlign: "right", fontSize: "13px", outline: "none" }} />
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--text-secondary)" }}>
                          $&nbsp;<input type="number" defaultValue={item.unit.toFixed(2)} step="0.01" style={{ width: "72px", padding: "4px 8px", border: "1px solid var(--border)", borderRadius: "5px", textAlign: "right", fontSize: "13px", outline: "none" }} />
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 500 }}>${(item.qty * item.unit).toFixed(2)}</td>
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
              <span style={{ fontSize: "13px", fontWeight: 700 }}>Materials total &nbsp; ${materialsCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* ── QUOTE ── */}
        {tab === "Quote" && (
          <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>Customer Details</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
              <label style={{ fontSize: "14px", color: "var(--text-secondary)", width: "90px", flexShrink: 0 }}>Customer</label>
              <input placeholder="Search or create a customer" defaultValue={job.customer ?? ""}
                style={{ flex: 1, padding: "8px 14px", border: "1px solid var(--border)", borderRadius: "7px", fontSize: "14px", outline: "none", color: "var(--text)" }} />
            </div>

            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "14px" }}>Quote</h2>
            <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
              {[
                { label: "Materials cost", value: `$${materialsCost.toFixed(2)} CAD`, control: null },
                { label: "Margin", value: `$${(materialsCost * margin / 100).toFixed(2)} CAD`, control: (
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                    <span style={{ padding: "5px 8px", borderRight: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)", background: "#f9fafb" }}>%</span>
                    <input type="number" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: "55px", padding: "5px 8px", border: "none", fontSize: "13px", outline: "none" }} />
                  </div>
                )},
                { label: "Materials w/ margin", value: `$${materialsWithMargin.toFixed(2)} CAD`, control: null },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: `1px solid ${i < arr.length - 1 ? "var(--border-light)" : "var(--border)"}` }}>
                  <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{row.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {row.control}
                    <span style={{ fontSize: "14px", minWidth: "110px", textAlign: "right" }}>{row.value}</span>
                  </div>
                </div>
              ))}

              {/* Labour */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Labour</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                    <input type="number" value={laborRate} onChange={e => setLaborRate(+e.target.value)} style={{ width: "55px", padding: "5px 8px", border: "none", fontSize: "13px", outline: "none" }} />
                    <span style={{ padding: "5px 8px", borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)", background: "#f9fafb" }}>$/hr</span>
                    <input type="number" value={laborHours} onChange={e => setLaborHours(+e.target.value)} style={{ width: "45px", padding: "5px 8px", border: "none", fontSize: "13px", outline: "none" }} />
                    <span style={{ padding: "5px 8px", borderLeft: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)", background: "#f9fafb" }}>hrs</span>
                  </div>
                  <span style={{ fontSize: "14px", minWidth: "110px", textAlign: "right" }}>${labour.toFixed(2)} CAD</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: "1px solid var(--border-light)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Subtotal</span>
                <span style={{ fontSize: "14px", minWidth: "110px", textAlign: "right" }}>${subtotal.toFixed(2)} CAD</span>
              </div>

              {/* Tax */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Tax</span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
                    <span style={{ padding: "5px 8px", borderRight: "1px solid var(--border)", fontSize: "12px", color: "var(--text-muted)", background: "#f9fafb" }}>%</span>
                    <input type="number" value={tax} onChange={e => setTax(+e.target.value)} style={{ width: "55px", padding: "5px 8px", border: "none", fontSize: "13px", outline: "none" }} />
                  </div>
                  <span style={{ fontSize: "14px", minWidth: "110px", textAlign: "right" }}>${taxAmt.toFixed(2)} CAD</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f9fafb" }}>
                <span style={{ fontSize: "15px", fontWeight: 700 }}>Grand total</span>
                <span style={{ fontSize: "15px", fontWeight: 700 }}>${grandTotal.toFixed(2)} CAD</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div style={{ position: "fixed", bottom: 0, left: "230px", right: 0, background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        {tab === "Design" && !hasDesign && (
          <>
            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>GUS is waiting for a description...</span>
            <button style={{ background: "var(--orange)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: 0.65 }}>Analyze</button>
          </>
        )}
        {tab === "Design" && hasDesign && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", border: "1px solid var(--border)", borderRadius: "8px", padding: "7px 14px" }}>
            <input placeholder="Ask GUS to add or edit..." style={{ flex: 1, border: "none", outline: "none", fontSize: "13px", color: "var(--text)", background: "transparent" }} />
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px" }}>+</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "15px" }}>🎤</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--orange)", fontSize: "16px", fontWeight: 700 }}>↑</button>
          </div>
        )}
        {tab === "BOM" && (
          <>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600 }}>Review and adjust parts</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Ready for quote creation</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "8px", background: "#fff", fontSize: "13px", cursor: "pointer" }}>Download Parts List</button>
              <button onClick={() => setTab("Quote")} style={{ background: "var(--orange)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Continue to Quote</button>
            </div>
          </>
        )}
        {tab === "Quote" && (
          <>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600 }}>Review the quote</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Adjust labour and margin as needed</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={{ padding: "8px 16px", border: "1px solid var(--border)", borderRadius: "8px", background: "#fff", fontSize: "13px", cursor: "pointer" }}>Download Quote</button>
              <button style={{ background: "var(--orange)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Share Quote</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
