"use client";

import { use, useEffect, useState } from "react";
import { mockJobs, mockCustomers, defaultPricingSettings, loadPricingSettings, loadLogo, loadEstimateOverride } from "@/lib/mockData";
import { calculateTax, formatTaxLabel } from "@/lib/taxEngine";

type Response = "pending" | "accepted" | "declined";

export default function CustomerQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [response, setResponse] = useState<Response>("pending");
  const [loaded, setLoaded] = useState(false);

  // Settings-driven fields
  const [companyName, setCompanyName] = useState(defaultPricingSettings.companyName);
  const [gstNumber, setGstNumber] = useState(defaultPricingSettings.gstNumber);
  const [phone, setPhone] = useState(defaultPricingSettings.phone);
  const [email, setEmail] = useState(defaultPricingSettings.email);
  const [quoteValidDays, setQuoteValidDays] = useState(defaultPricingSettings.quoteValidDays);
  const [termsText, setTermsText] = useState(defaultPricingSettings.termsText);
  const [province, setProvince] = useState(defaultPricingSettings.province);
  const [journeymanRate, setJourneymanRate] = useState(defaultPricingSettings.journeymanRate);
  const [journeymanHours, setJourneymanHours] = useState(2);
  const [includeJourneyman, setIncludeJourneyman] = useState(true);
  const [apprenticeRate, setApprenticeRate] = useState(defaultPricingSettings.apprenticeRate);
  const [apprenticeHours, setApprenticeHours] = useState(0);
  const [includeApprentice, setIncludeApprentice] = useState(false);
  const [callOutFee, setCallOutFee] = useState(defaultPricingSettings.callOutFee);
  const [includeCallOut, setIncludeCallOut] = useState(true);
  const [primaryEquipmentMarkup, setPrimaryEquipmentMarkup] = useState(defaultPricingSettings.primaryEquipmentMarkup);
  const [accessoriesMarkup, setAccessoriesMarkup] = useState(defaultPricingSettings.accessoriesMarkup);
  const [paymentTerms, setPaymentTerms] = useState(defaultPricingSettings.paymentTerms);
  const [showWarranty, setShowWarranty] = useState(defaultPricingSettings.showWarranty);
  const [labourWarranty, setLabourWarranty] = useState(defaultPricingSettings.labourWarranty);
  const [partsWarranty, setPartsWarranty] = useState(defaultPricingSettings.partsWarranty);
  const [estimateNotes, setEstimateNotes] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const job = mockJobs.find(j => j.id === token);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("gus_responses") || "{}");
    if (stored[token]) setResponse(stored[token]);

    const s = loadPricingSettings();
    setCompanyName(s.companyName);
    setGstNumber(s.gstNumber);
    setPhone(s.phone);
    setEmail(s.email);
    setQuoteValidDays(s.quoteValidDays);
    setTermsText(s.termsText);
    setProvince(s.province);
    setPaymentTerms(s.paymentTerms);
    setShowWarranty(s.showWarranty);
    setLabourWarranty(s.labourWarranty);
    setPartsWarranty(s.partsWarranty);
    const override = loadEstimateOverride(token);
    setEstimateNotes(override.estimateNotes);
    setJourneymanRate(override.journeymanRate ?? s.journeymanRate ?? 113);
    setJourneymanHours(override.journeymanHours ?? job?.laborHours ?? 2);
    if (override.includeJourneyman !== undefined) setIncludeJourneyman(override.includeJourneyman);
    setApprenticeRate(override.apprenticeRate ?? s.apprenticeRate ?? 65);
    setApprenticeHours(override.apprenticeHours ?? 0);
    if (override.includeApprentice !== undefined) setIncludeApprentice(override.includeApprentice);
    setCallOutFee(override.callOutFee ?? s.callOutFee);
    if (override.includeCallOut !== undefined) setIncludeCallOut(override.includeCallOut);
    setPrimaryEquipmentMarkup(override.primaryEquipmentMarkup ?? s.primaryEquipmentMarkup ?? 30);
    setAccessoriesMarkup(override.accessoriesMarkup ?? s.accessoriesMarkup ?? 20);
    setLogoUrl(loadLogo());
    setLoaded(true);
  }, [token]);

  const respond = (r: "accepted" | "declined") => {
    const stored = JSON.parse(localStorage.getItem("gus_responses") || "{}");
    stored[token] = r;
    localStorage.setItem("gus_responses", JSON.stringify(stored));
    setResponse(r);
  };

  if (!loaded) return null;

  // Financials — split markup by BOM category
  const primaryItems = job?.parts?.filter(g => g.category === "Primary Equipment").flatMap(g => g.items) ?? [];
  const otherItems   = job?.parts?.filter(g => g.category !== "Primary Equipment").flatMap(g => g.items) ?? [];
  const primaryCost  = primaryItems.reduce((s, i) => s + i.qty * i.unit, 0);
  const otherCost    = otherItems.reduce((s, i) => s + i.qty * i.unit, 0);
  const materialsWithMarkup = primaryCost * (1 + primaryEquipmentMarkup / 100) + otherCost * (1 + accessoriesMarkup / 100);
  const journeymanTotal = includeJourneyman ? journeymanRate * journeymanHours : 0;
  const apprenticeTotal = includeApprentice ? apprenticeRate * apprenticeHours : 0;
  const effectiveCallOut = includeCallOut ? callOutFee : 0;
  const labour = journeymanTotal + apprenticeTotal;
  const labourAndCallOut = labour + effectiveCallOut;
  const subtotal = materialsWithMarkup + labourAndCallOut;
  const taxResult = calculateTax(province, materialsWithMarkup, labourAndCallOut);
  const grandTotal = subtotal + taxResult.totalTax;

  // Dates
  const issueDateObj = new Date();
  const validUntilObj = new Date(issueDateObj);
  validUntilObj.setDate(issueDateObj.getDate() + quoteValidDays);
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const issueDate = fmt(issueDateObj);
  const validUntil = fmt(validUntilObj);

  // Customer record lookup for address
  const customerRecord = job?.customer ? mockCustomers.find(c =>
    c.name.toLowerCase() === job.customer!.toLowerCase() ||
    job.customer!.toLowerCase().includes(c.name.toLowerCase())
  ) : undefined;

  // Document palette (light, customer-facing)
  const text  = "#1A1A1A";
  const text2 = "#555555";
  const text3 = "#888888";
  const border = "#E0E0E0";
  const orange = "#F26A1B";
  const teal = "#1ABFBF";

  // Shared table cell styles
  const thS: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.14em",
    textTransform: "uppercase", color: text3, textAlign: "left",
    padding: "6px 0 8px", borderBottom: `1px solid ${border}`, fontWeight: 400,
  };
  const tdS: React.CSSProperties = {
    padding: "9px 0", color: text2, borderBottom: "1px solid #F5F5F5", verticalAlign: "top",
  };
  const tdAmt: React.CSSProperties = {
    ...tdS, textAlign: "right", fontFamily: "'DM Mono', monospace",
    fontSize: "13px", color: text, whiteSpace: "nowrap",
  };
  const secLabel: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.18em",
    textTransform: "uppercase", color: text3, marginBottom: "10px",
    paddingBottom: "8px", borderBottom: `1px solid ${border}`,
  };
  const miniLabel: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.18em",
    textTransform: "uppercase", color: text3, marginBottom: "8px",
  };

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!job) {
    return (
      <div style={{ minHeight: "100vh", background: "#F2F2F0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", color: text3 }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontSize: "16px", fontWeight: 500, color: text, marginBottom: "6px" }}>Quote not found</div>
          <div style={{ fontSize: "13px" }}>This link may have expired or the quote doesn&apos;t exist.</div>
        </div>
      </div>
    );
  }

  // ── Accepted ─────────────────────────────────────────────────────────────────
  if (response === "accepted") {
    return (
      <div style={{ minHeight: "100vh", background: "#F2F2F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px" }}>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: "480px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>✓</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: text, letterSpacing: "0.04em", lineHeight: 1, marginBottom: "12px" }}>You&apos;re in.</div>
          <p style={{ fontSize: "16px", color: text2, lineHeight: 1.7, marginBottom: "28px" }}>
            {companyName} has been notified and will be in touch to schedule the work.
          </p>
          <div style={{ background: "white", border: `1px solid ${border}`, padding: "20px 24px", textAlign: "left" }}>
            <div style={{ fontSize: "12px", fontFamily: "'DM Mono', monospace", color: teal, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>// Estimate accepted</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
              <span style={{ color: text2 }}>Quote</span>
              <span style={{ color: text, fontFamily: "'DM Mono', monospace" }}>{job.jobId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "6px" }}>
              <span style={{ color: text2 }}>Total</span>
              <span style={{ color: orange, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>${grandTotal.toFixed(2)} CAD</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span style={{ color: text2 }}>Status</span>
              <span style={{ color: "#166534", background: "#DCFCE7", padding: "1px 8px", fontSize: "12px", fontWeight: 500 }}>Accepted</span>
            </div>
          </div>
          <p style={{ fontSize: "12px", color: text3, marginTop: "20px" }}>Questions? Contact {companyName} at {phone}.</p>
        </div>
        <div style={{ marginTop: "48px", fontSize: "10px", color: "#BBBBBB", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Powered by GUS</div>
      </div>
    );
  }

  // ── Declined ─────────────────────────────────────────────────────────────────
  if (response === "declined") {
    return (
      <div style={{ minHeight: "100vh", background: "#F2F2F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px" }}>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", maxWidth: "420px" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: text, letterSpacing: "0.04em", lineHeight: 1, marginBottom: "12px" }}>Got it.</div>
          <p style={{ fontSize: "15px", color: text2, lineHeight: 1.7 }}>
            No problem — {companyName} has been notified that you&apos;re not proceeding at this time.
          </p>
        </div>
        <div style={{ marginTop: "48px", fontSize: "10px", color: "#BBBBBB", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Powered by GUS</div>
      </div>
    );
  }

  // ── Totals block (reused across formats) ────────────────────────────────────
  const totalsRow = (label: string, val: string, bold?: boolean): React.ReactNode => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", fontSize: "13.5px", color: bold ? text : text2, fontWeight: bold ? 500 : 400, borderBottom: "1px solid #F5F5F5" }}>
      <span>{label}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: bold ? text : text2 }}>{val}</span>
    </div>
  );

  // ── Pending — document view ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#F2F2F0", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @media (max-width: 640px) {
          .q-meta-bar { flex-direction: column !important; gap: 6px !important; padding: 16px 24px 14px !important; }
          .q-meta-details { justify-content: flex-start !important; }
          .q-header { grid-template-columns: 1fr !important; gap: 20px !important; padding: 20px 24px !important; }
          .q-pad { padding-left: 24px !important; padding-right: 24px !important; }
          .q-totals { padding-left: 24px !important; padding-right: 24px !important; }
          .q-totals-inner { width: 100% !important; }
          .q-clean-block { flex-direction: column !important; align-items: flex-start !important; }
          .q-clean-price { text-align: left !important; }
          .q-footer { flex-direction: column !important; gap: 4px !important; text-align: center !important; padding: 12px 24px !important; }
        }
      `}</style>

      {/* ── Document wrapper ── */}
      <div style={{ padding: "40px 24px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", background: "white", boxShadow: "0 2px 24px rgba(0,0,0,0.10)" }}>

          {/* Meta bar */}
          <div className="q-meta-bar" style={{ padding: "20px 48px 18px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "16px" }}>
            <div style={{ fontSize: "26px", fontWeight: 300, color: text, letterSpacing: "-0.02em" }}>Estimate</div>
            <div className="q-meta-details" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: text3, letterSpacing: "0.04em" }}>{job.jobId}</span>
              <span style={{ color: "#CCC" }}>·</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: text3 }}>{issueDate}</span>
              <span style={{ color: "#CCC" }}>·</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: orange, letterSpacing: "0.06em", textTransform: "uppercase" }}>Valid until {validUntil}</span>
            </div>
          </div>

          {/* From / Bill To header */}
          <div className="q-header" style={{ padding: "28px 48px", borderBottom: `3px solid ${orange}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            {/* From */}
            <div>
              <div style={miniLabel}>From</div>
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={companyName} style={{ maxHeight: "50px", maxWidth: "180px", objectFit: "contain", marginBottom: "8px", display: "block" }} />
              )}
              <div style={{ fontSize: "18px", fontWeight: 600, color: text, letterSpacing: "-0.01em", marginBottom: "6px", marginTop: logoUrl ? "0" : "6px" }}>{companyName}</div>
              <div style={{ fontSize: "12px", color: text3, lineHeight: "1.8" }}>
                Port Moody, BC &nbsp;·&nbsp; {phone}<br />
                <span style={{ color: teal }}>{email}</span><br />
                GST# {gstNumber}
              </div>
            </div>
            {/* Bill To */}
            <div>
              <div style={miniLabel}>Bill To</div>
              <div style={{ fontSize: "15px", fontWeight: 500, color: text, marginBottom: "4px", marginTop: "6px" }}>{job.customer ?? "Customer"}</div>
              {customerRecord ? (
                <div style={{ fontSize: "13px", color: text2, lineHeight: "1.7" }}>
                  {customerRecord.address}<br />
                  {customerRecord.phone}
                </div>
              ) : (
                <div style={{ fontSize: "13px", color: text3, lineHeight: "1.7" }}>{paymentTerms}</div>
              )}
            </div>
          </div>

          {/* Scope of work */}
          <div className="q-pad" style={{ padding: "24px 48px 28px" }}>
            <div style={miniLabel}>Scope of Work</div>
            <div style={{ fontSize: "13.5px", color: text2, lineHeight: "1.75" }}>
              {estimateNotes || job.description || "Work as discussed with customer."}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: border, margin: "0 48px" }} />

          {/* ═══ SUMMARY format (only format) ═══ */}
          <div className="q-pad" style={{ padding: "28px 48px" }}>
            <div style={secLabel}>// Pricing</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", marginTop: "4px" }}>
              <tbody>
                {includeCallOut && (
                  <tr>
                    <td style={{ ...tdS, color: text, fontWeight: 500 }}>Call-out</td>
                    <td style={tdAmt}>${effectiveCallOut.toFixed(2)}</td>
                  </tr>
                )}
                {includeJourneyman && (
                  <>
                    <tr>
                      <td style={{ ...tdS, color: text, fontWeight: 500 }}>Journeyman Labour</td>
                      <td style={tdAmt}>${journeymanTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ ...tdS, fontSize: "12px", color: text3, paddingTop: "1px", paddingBottom: "8px", borderBottom: "1px solid #F5F5F5" }}>
                        {journeymanHours} hrs @ ${journeymanRate}/hr
                      </td>
                      <td style={{ ...tdS, borderBottom: "1px solid #F5F5F5" }} />
                    </tr>
                  </>
                )}
                {includeApprentice && apprenticeHours > 0 && (
                  <>
                    <tr>
                      <td style={{ ...tdS, color: text, fontWeight: 500 }}>Apprentice Labour</td>
                      <td style={tdAmt}>${apprenticeTotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ ...tdS, fontSize: "12px", color: text3, paddingTop: "1px", paddingBottom: "8px", borderBottom: "1px solid #F5F5F5" }}>
                        {apprenticeHours} hrs @ ${apprenticeRate}/hr
                      </td>
                      <td style={{ ...tdS, borderBottom: "1px solid #F5F5F5" }} />
                    </tr>
                  </>
                )}
                {materialsWithMarkup > 0 && (
                  <>
                    <tr>
                      <td style={{ ...tdS, color: text, fontWeight: 500 }}>Materials &amp; Equipment</td>
                      <td style={tdAmt}>${materialsWithMarkup.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ ...tdS, fontSize: "12px", color: text3, paddingTop: "1px", paddingBottom: "8px", borderBottom: "none" }}>
                        {job.parts?.[0]?.items[0]?.name.split("(")[0].trim()}{job.parts && job.parts.length > 1 ? ", all fittings and connections included" : ""}
                      </td>
                      <td style={{ ...tdS, borderBottom: "none" }} />
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* ═══ Totals ═══ */}
          <div className="q-totals" style={{ padding: "0 48px 32px", display: "flex", justifyContent: "flex-end" }}>
            <div className="q-totals-inner" style={{ width: "280px" }}>
              {materialsWithMarkup > 0 && totalsRow("Materials & Equipment", `$${materialsWithMarkup.toFixed(2)}`)}
              {totalsRow("Labour & call-out", `$${labourAndCallOut.toFixed(2)}`)}
              {totalsRow("Subtotal", `$${subtotal.toFixed(2)}`, true)}
              {taxResult.lines.filter(l => l.amount > 0).map(line => (
                <div key={line.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", fontSize: "13.5px", color: text2, borderBottom: "1px solid #F5F5F5" }}>
                  <span>{formatTaxLabel(line)}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>${line.amount.toFixed(2)}</span>
                </div>
              ))}
              {/* Grand total row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 0", fontSize: "16px", fontWeight: 600, color: text, borderTop: `2px solid ${orange}`, marginTop: "4px" }}>
                <span>Total</span>
                <span style={{ color: orange }}>${grandTotal.toFixed(2)} CAD</span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="q-pad" style={{ padding: "20px 48px 36px", borderTop: `1px solid ${border}` }}>
            {showWarranty && (
              <p style={{ fontSize: "11.5px", color: text3, lineHeight: "1.7", marginBottom: "6px" }}>
                <strong style={{ color: text2 }}>Warranty:</strong> Labour warranted for {labourWarranty} from date of installation. {partsWarranty}.
              </p>
            )}
            <p style={{ fontSize: "11.5px", color: text3, lineHeight: "1.7" }}>
              <strong style={{ color: text2 }}>Terms:</strong> {termsText}
            </p>
          </div>

          {/* Footer */}
          <div className="q-footer q-pad" style={{ background: "#FAFAFA", borderTop: `1px solid ${border}`, padding: "14px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#CCC" }}>{companyName}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#CCC" }}>Generated by <span style={{ color: orange }}>GUS</span> · {issueDate}</div>
          </div>

        </div>
      </div>

      {/* ── CTA — below document card ── */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "20px 24px 48px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => respond("accepted")}
            style={{
              width: "100%", padding: "18px", background: orange, color: "white",
              border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: "16px", fontWeight: 600,
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.92"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            Accept this estimate
          </button>
          <button
            onClick={() => respond("declined")}
            style={{
              width: "100%", padding: "13px", background: "transparent", color: text3,
              border: `1px solid #D0D0D0`, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F5F5F5"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            Decline
          </button>
        </div>
        <p style={{ textAlign: "center", fontSize: "11px", color: "#AAAAAA", marginTop: "16px", lineHeight: 1.6, fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>
          By accepting you agree to the terms above · Estimate valid until {validUntil}
        </p>
      </div>

      <div style={{ textAlign: "center", paddingBottom: "32px", fontSize: "10px", color: "#CCCCCC", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>Powered by GUS</div>
    </div>
  );
}
