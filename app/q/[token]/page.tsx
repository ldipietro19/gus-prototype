"use client";

import { use, useEffect, useState } from "react";
import { mockJobs, mockBusinessProfile, defaultPricingSettings, loadPricingSettings } from "@/lib/mockData";
import { calculateTax, formatTaxLabel } from "@/lib/taxEngine";

type Response = "pending" | "accepted" | "declined";

export default function CustomerQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [response, setResponse] = useState<Response>("pending");
  const [loaded, setLoaded] = useState(false);
  const [quoteValidDays, setQuoteValidDays] = useState(defaultPricingSettings.quoteValidDays);
  const [termsText, setTermsText] = useState(defaultPricingSettings.termsText);
  const [province, setProvince] = useState(defaultPricingSettings.province);

  // token = jobId for prototype
  const job = mockJobs.find(j => j.id === token);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("gus_responses") || "{}");
    if (stored[token]) setResponse(stored[token]);
    // Load pricing settings
    const s = loadPricingSettings();
    setQuoteValidDays(s.quoteValidDays);
    setTermsText(s.termsText);
    setProvince(s.province);
    setLoaded(true);
  }, [token]);

  const respond = (r: "accepted" | "declined") => {
    const stored = JSON.parse(localStorage.getItem("gus_responses") || "{}");
    stored[token] = r;
    localStorage.setItem("gus_responses", JSON.stringify(stored));
    setResponse(r);
  };

  if (!loaded) return null;

  if (!job) {
    return (
      <div style={{ minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center", color: "#5C6A7A" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "#0D1B2E", marginBottom: "6px" }}>Quote not found</div>
          <div style={{ fontSize: "13px" }}>This link may have expired or the quote doesn&apos;t exist.</div>
        </div>
      </div>
    );
  }

  // Financials (same as job detail page) — use settings defaults if no job override
  const materialsCost = job.parts?.flatMap(g => g.items).reduce((s, i) => s + i.qty * i.unit, 0) ?? 0;
  const margin = job.margin ?? defaultPricingSettings.defaultMarkup;
  const materialsWithMargin = materialsCost * (1 + margin / 100);
  const labour = (job.laborRate ?? 95) * (job.laborHours ?? 2);
  const subtotal = materialsWithMargin + labour;
  const taxResult = calculateTax(province, materialsWithMargin, labour);
  const grandTotal = subtotal + taxResult.totalTax;

  // Validity date — computed from settings quoteValidDays
  const issueDateObj = new Date();
  const validUntilObj = new Date(issueDateObj);
  validUntilObj.setDate(issueDateObj.getDate() + quoteValidDays);
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const issueDate = fmt(issueDateObj);
  const validUntil = fmt(validUntilObj);

  const c = {
    navy: "#0D1B2E",
    card: "#FFFFFF",
    bg: "#F7F8FA",
    orange: "#F26A1B",
    teal: "#1ABFBF",
    text: "#0D1B2E",
    secondary: "#5C6A7A",
    border: "#E5E7EB",
    borderLight: "#F0F2F5",
  };

  // ── Accepted state ────────────────────────────────────────────────────────
  if (response === "accepted") {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px" }}>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>✓</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: c.navy, letterSpacing: "0.04em", lineHeight: 1, marginBottom: "12px" }}>You&apos;re in.</div>
          <p style={{ fontSize: "16px", color: c.secondary, lineHeight: 1.7, marginBottom: "28px" }}>
            {mockBusinessProfile.companyName} has been notified and will be in touch to schedule the work.
          </p>
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: "12px", padding: "20px 24px", textAlign: "left" }}>
            <div style={{ fontSize: "12px", fontFamily: "'DM Mono', monospace", color: c.teal, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>// Quote accepted</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
              <span style={{ color: c.secondary }}>Quote</span>
              <span style={{ color: c.navy, fontFamily: "'DM Mono', monospace" }}>{job.jobId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
              <span style={{ color: c.secondary }}>Total</span>
              <span style={{ color: c.orange, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>${grandTotal.toFixed(2)} CAD</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: c.secondary }}>Status</span>
              <span style={{ color: "#166534", background: "#DCFCE7", borderRadius: "4px", padding: "1px 8px", fontSize: "12px", fontWeight: 500 }}>Accepted</span>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: c.secondary, marginTop: "20px" }}>Questions? Contact {mockBusinessProfile.companyName} directly.</p>
        </div>
        <div style={{ marginTop: "48px", fontSize: "11px", color: "#9CA3AF", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>POWERED BY GUS</div>
      </div>
    );
  }

  // ── Declined state ────────────────────────────────────────────────────────
  if (response === "declined") {
    return (
      <div style={{ minHeight: "100vh", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px" }}>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: "420px" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: c.navy, letterSpacing: "0.04em", lineHeight: 1, marginBottom: "12px" }}>Got it.</div>
          <p style={{ fontSize: "15px", color: c.secondary, lineHeight: 1.7 }}>
            No problem — {mockBusinessProfile.companyName} has been notified that you&apos;re not proceeding at this time.
          </p>
        </div>
        <div style={{ marginTop: "48px", fontSize: "11px", color: "#9CA3AF", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>POWERED BY GUS</div>
      </div>
    );
  }

  // ── Pending quote view ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: c.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: c.navy, padding: "0 24px" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: c.orange, letterSpacing: "0.08em", lineHeight: 1 }}>{mockBusinessProfile.companyName}</div>
            <div style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", marginTop: "3px" }}>{mockBusinessProfile.gstNumber}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Estimate</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", color: "white", marginTop: "2px" }}>{job.jobId}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* Meta row */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Issued", value: issueDate },
            { label: "Valid until", value: validUntil },
            { label: "Prepared for", value: job.customer ?? "Customer" },
          ].map(m => (
            <div key={m.label} style={{ flex: 1, background: c.card, border: `1px solid ${c.border}`, borderRadius: "8px", padding: "12px 14px" }}>
              <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: c.secondary, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{m.label}</div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: c.navy }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Job description */}
        {job.description && (
          <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: "12px", padding: "20px 24px", marginBottom: "16px" }}>
            <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: c.teal, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>// Scope of work</div>
            <div style={{ fontSize: "14px", color: c.navy, lineHeight: 1.7 }}>{job.description}</div>
          </div>
        )}

        {/* Quote table */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
          {/* Line items */}
          {materialsCost > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${c.borderLight}`, fontSize: "14px" }}>
              <span style={{ color: c.secondary }}>Materials & equipment</span>
              <span style={{ fontFamily: "'DM Mono', monospace", color: c.navy }}>${materialsWithMargin.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${c.border}`, fontSize: "14px" }}>
            <span style={{ color: c.secondary }}>Labour</span>
            <span style={{ fontFamily: "'DM Mono', monospace", color: c.navy }}>${labour.toFixed(2)}</span>
          </div>

          {/* Subtotal */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${c.border}`, fontSize: "13px", background: "#FAFAFA" }}>
            <span style={{ color: c.secondary, fontWeight: 500 }}>Subtotal</span>
            <span style={{ fontFamily: "'DM Mono', monospace", color: c.navy, fontWeight: 500 }}>${subtotal.toFixed(2)}</span>
          </div>

          {/* Tax lines — skip any line that calculated to $0 */}
          {taxResult.lines.filter(line => line.amount > 0).map((line, i, arr) => (
            <div key={line.name} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", borderBottom: i < arr.length - 1 ? `1px solid ${c.borderLight}` : `1px solid ${c.border}`, fontSize: "13px" }}>
              <span style={{ color: c.secondary }}>{formatTaxLabel(line)}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", color: c.secondary }}>${line.amount.toFixed(2)}</span>
            </div>
          ))}

          {/* Grand total */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: c.navy }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "0.06em", color: "white" }}>Total</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", letterSpacing: "0.04em", color: c.orange }}>${grandTotal.toFixed(2)} CAD</span>
          </div>
        </div>

        {/* Terms */}
        <div style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: "12px", padding: "16px 20px", marginBottom: "28px" }}>
          <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", color: c.secondary, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>// Terms</div>
          <p style={{ fontSize: "12px", color: c.secondary, lineHeight: 1.7, margin: 0 }}>
            {termsText}
          </p>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={() => respond("accepted")} style={{
            width: "100%", padding: "16px", background: c.orange, color: "white", border: "none",
            borderRadius: "10px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px",
            letterSpacing: "0.06em", cursor: "pointer",
          }}>
            Accept this quote
          </button>
          <button onClick={() => respond("declined")} style={{
            width: "100%", padding: "12px", background: "transparent", color: c.secondary,
            border: `1px solid ${c.border}`, borderRadius: "10px", fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px", cursor: "pointer",
          }}>
            Decline
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF", marginTop: "20px", lineHeight: 1.6 }}>
          By accepting you agree to the terms above. This quote is valid until {validUntil}.
        </p>
      </div>

      <div style={{ textAlign: "center", paddingBottom: "32px", fontSize: "11px", color: "#C4CAD4", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>POWERED BY GUS</div>
    </div>
  );
}
