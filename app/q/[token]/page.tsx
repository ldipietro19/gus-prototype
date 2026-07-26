"use client";

import { use, useEffect, useState } from "react";
import { mockJobs, mockCustomers, defaultPricingSettings, loadPricingSettings, loadLogo, loadEstimateOverride } from "@/lib/mockData";
import { calculateTax, formatTaxLabel } from "@/lib/taxEngine";

type Response = "pending" | "accepted" | "declined";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const navy  = "#0D1B2E";
const card  = "#142236";
const deep  = "#060e1a";
const orange = "#F26A1B";
const teal  = "#1ABFBF";
const offwhite = "#F0F6FF";
const chalk = "#B0CFE0";
const slate = "#3D6480";
const borderLine = "rgba(255,255,255,0.07)";

export default function CustomerQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [response, setResponse] = useState<Response>("pending");
  const [loaded, setLoaded] = useState(false);

  // Settings-driven fields
  const [companyName, setCompanyName] = useState(defaultPricingSettings.companyName);
  const [businessAddress, setBusinessAddress] = useState(defaultPricingSettings.businessAddress);
  const [licenceNumber, setLicenceNumber] = useState(defaultPricingSettings.licenceNumber);
  const [gstNumber, setGstNumber] = useState(defaultPricingSettings.gstNumber);
  const [phone, setPhone] = useState(defaultPricingSettings.phone);
  const [email, setEmail] = useState(defaultPricingSettings.email);
  const [paymentInstructions, setPaymentInstructions] = useState(defaultPricingSettings.paymentInstructions);
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
  const [depositPercent, setDepositPercent] = useState(defaultPricingSettings.depositPercent);
  const [depositThreshold, setDepositThreshold] = useState(defaultPricingSettings.depositThreshold);
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
    setBusinessAddress(s.businessAddress);
    setLicenceNumber(s.licenceNumber);
    setGstNumber(s.gstNumber);
    setPhone(s.phone);
    setEmail(s.email);
    setPaymentInstructions(s.paymentInstructions);
    setQuoteValidDays(s.quoteValidDays);
    setTermsText(s.termsText);
    setProvince(s.province);
    setPaymentTerms(s.paymentTerms);
    setDepositPercent(s.depositPercent);
    setDepositThreshold(s.depositThreshold);
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

  // ── Financials ────────────────────────────────────────────────────────────────
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
  const depositRequired = grandTotal >= depositThreshold;
  const depositAmount = depositRequired ? (grandTotal * depositPercent / 100) : 0;

  // ── Dates ─────────────────────────────────────────────────────────────────────
  const issueDateObj = new Date();
  const validUntilObj = new Date(issueDateObj);
  validUntilObj.setDate(issueDateObj.getDate() + quoteValidDays);
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const issueDate = fmt(issueDateObj);
  const validUntil = fmt(validUntilObj);

  // ── Customer record ───────────────────────────────────────────────────────────
  const customerRecord = job?.customer ? mockCustomers.find(c =>
    c.name.toLowerCase() === job.customer!.toLowerCase() ||
    job.customer!.toLowerCase().includes(c.name.toLowerCase())
  ) : undefined;

  // ── Shared style helpers ──────────────────────────────────────────────────────
  const eyebrow: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.2em",
    textTransform: "uppercase", color: teal, marginBottom: "8px",
  };
  const divider: React.CSSProperties = {
    height: "1px",
    background: `linear-gradient(90deg, transparent, ${teal}, transparent)`,
    opacity: 0.2, margin: "0",
  };

  // ── Global CSS (textures + responsive) ───────────────────────────────────────
  const globalCss = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${navy}; }
    .q-body::before {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none; z-index: 9999;
    }
    .q-body::after {
      content: '';
      position: fixed; inset: 0;
      background-image:
        linear-gradient(rgba(26,191,191,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(26,191,191,0.025) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none; z-index: 0;
    }
    @media (max-width: 640px) {
      .q-header-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
      .q-pad { padding-left: 24px !important; padding-right: 24px !important; }
      .q-totals-inner { width: 100% !important; }
      .q-totals { padding-left: 24px !important; padding-right: 24px !important; }
      .q-hero-name { font-size: clamp(36px, 10vw, 72px) !important; }
    }
  `;

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (!job) {
    return (
      <div className="q-body" style={{ minHeight: "100vh", background: navy, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", position: "relative" }}>
        <style>{globalCss}</style>
        <div style={{ textAlign: "center", color: slate, position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: offwhite, marginBottom: "8px", letterSpacing: "0.04em" }}>Not Found</div>
          <div style={{ fontSize: "14px", color: chalk }}>This link may have expired or the quote doesn&apos;t exist.</div>
        </div>
      </div>
    );
  }

  // ── Accepted ──────────────────────────────────────────────────────────────────
  if (response === "accepted") {
    return (
      <div className="q-body" style={{ minHeight: "100vh", background: navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px", position: "relative" }}>
        <style>{globalCss}</style>
        <div style={{ textAlign: "center", maxWidth: "480px", position: "relative", zIndex: 1 }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(26,191,191,0.12)", border: `1px solid ${teal}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "26px", color: teal }}>✓</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 12vw, 80px)", color: offwhite, letterSpacing: "0.04em", lineHeight: 0.9, marginBottom: "16px" }}>You&apos;re in.</div>
          <p style={{ fontSize: "15px", color: chalk, lineHeight: 1.7, marginBottom: "32px" }}>
            {companyName} has been notified and will be in touch to schedule.
          </p>
          <div style={{ background: card, border: `1px solid ${borderLine}`, borderTop: `3px solid ${orange}`, padding: "24px 28px", textAlign: "left" }}>
            <div style={eyebrow}>// Estimate accepted</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", paddingBottom: "8px", borderBottom: `1px solid ${borderLine}` }}>
              <span style={{ color: chalk }}>Quote</span>
              <span style={{ color: offwhite, fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>{job.jobId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", paddingBottom: "8px", borderBottom: `1px solid ${borderLine}` }}>
              <span style={{ color: chalk }}>Total</span>
              <span style={{ color: orange, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>${grandTotal.toFixed(2)} CAD</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: chalk }}>Status</span>
              <span style={{ color: teal, fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Accepted</span>
            </div>
          </div>
          <p style={{ fontSize: "11px", color: slate, marginTop: "20px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em" }}>
            Questions? {phone}
          </p>
        </div>
        <div style={{ marginTop: "60px", fontSize: "9px", color: slate, fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", textTransform: "uppercase", position: "relative", zIndex: 1 }}>Powered by <span style={{ color: orange }}>GUS</span></div>
      </div>
    );
  }

  // ── Declined ──────────────────────────────────────────────────────────────────
  if (response === "declined") {
    return (
      <div className="q-body" style={{ minHeight: "100vh", background: navy, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: "40px 24px", position: "relative" }}>
        <style>{globalCss}</style>
        <div style={{ textAlign: "center", maxWidth: "420px", position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 12vw, 80px)", color: offwhite, letterSpacing: "0.04em", lineHeight: 0.9, marginBottom: "16px" }}>Got it.</div>
          <p style={{ fontSize: "15px", color: chalk, lineHeight: 1.7 }}>
            No problem — {companyName} has been notified that you&apos;re not proceeding at this time.
          </p>
        </div>
        <div style={{ marginTop: "60px", fontSize: "9px", color: slate, fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", textTransform: "uppercase", position: "relative", zIndex: 1 }}>Powered by <span style={{ color: orange }}>GUS</span></div>
      </div>
    );
  }

  // ── Pending — full GUS dark brand quote ───────────────────────────────────────
  return (
    <div className="q-body" style={{ minHeight: "100vh", background: navy, fontFamily: "'DM Sans', sans-serif", position: "relative" }}>
      <style>{globalCss}</style>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Hero header (above card) ── */}
        <div style={{ background: deep, borderBottom: `1px solid ${borderLine}`, padding: "28px 0 24px" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
            <div style={eyebrow}>// Estimate · {job.jobId}</div>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={companyName} style={{ maxHeight: "52px", maxWidth: "200px", objectFit: "contain", display: "block", marginBottom: "8px" }} />
            ) : (
              <div className="q-hero-name" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px, 10vw, 72px)", color: offwhite, lineHeight: 0.92, letterSpacing: "0.02em", marginBottom: "4px" }}>
                {companyName}
              </div>
            )}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: slate, letterSpacing: "0.08em" }}>{issueDate}</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: slate }}>·</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: orange, letterSpacing: "0.06em", textTransform: "uppercase" }}>Valid until {validUntil}</span>
            </div>
          </div>
        </div>

        {/* ── Main document card ── */}
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px 0" }}>
          <div style={{ background: card, border: `1px solid ${borderLine}`, borderTop: `3px solid ${orange}` }}>

            {/* From / Bill To */}
            <div className="q-pad q-header-grid" style={{ padding: "32px 40px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", borderBottom: `1px solid ${borderLine}` }}>
              {/* From */}
              <div>
                <div style={eyebrow}>// From</div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: offwhite, marginBottom: "10px" }}>{companyName}</div>
                <div style={{ fontSize: "12px", color: chalk, lineHeight: "1.9" }}>
                  {businessAddress && <span>{businessAddress}<br /></span>}
                  {phone}<br />
                  <span style={{ color: teal }}>{email}</span><br />
                  <span style={{ color: slate }}>GST# {gstNumber}</span>
                  {licenceNumber && <><br /><span style={{ color: slate }}>Lic# {licenceNumber}</span></>}
                </div>
              </div>
              {/* Bill To */}
              <div>
                <div style={eyebrow}>// Bill To</div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: offwhite, marginBottom: "10px" }}>{job.customer ?? "Customer"}</div>
                {customerRecord ? (
                  <div style={{ fontSize: "12px", color: chalk, lineHeight: "1.9" }}>
                    {customerRecord.address}<br />
                    {customerRecord.phone}
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: slate, lineHeight: "1.9" }}>{paymentTerms}</div>
                )}
              </div>
            </div>

            {/* Scope */}
            <div className="q-pad" style={{ padding: "28px 40px" }}>
              <div style={eyebrow}>// Scope of Work</div>
              <p style={{ fontSize: "14px", color: chalk, lineHeight: "1.75" }}>
                {estimateNotes || job.description || "Work as discussed with customer."}
              </p>
            </div>

            <div style={divider} />

            {/* Pricing */}
            <div className="q-pad" style={{ padding: "28px 40px" }}>
              <div style={eyebrow}>// Pricing</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {includeCallOut && (
                    <tr>
                      <td style={{ padding: "10px 0", fontSize: "13.5px", color: offwhite, fontWeight: 500, borderBottom: `1px solid rgba(255,255,255,0.04)` }}>Call-out</td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: "13px", color: chalk, borderBottom: `1px solid rgba(255,255,255,0.04)`, whiteSpace: "nowrap" }}>${effectiveCallOut.toFixed(2)}</td>
                    </tr>
                  )}
                  {includeJourneyman && (
                    <>
                      <tr>
                        <td style={{ padding: "10px 0 2px", fontSize: "13.5px", color: offwhite, fontWeight: 500 }}>Journeyman Labour</td>
                        <td style={{ padding: "10px 0 2px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: "13px", color: chalk, whiteSpace: "nowrap" }}>${journeymanTotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0 0 10px", fontSize: "11px", color: slate, fontFamily: "'DM Mono', monospace", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                          {journeymanHours} hrs @ ${journeymanRate}/hr
                        </td>
                        <td style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }} />
                      </tr>
                    </>
                  )}
                  {includeApprentice && apprenticeHours > 0 && (
                    <>
                      <tr>
                        <td style={{ padding: "10px 0 2px", fontSize: "13.5px", color: offwhite, fontWeight: 500 }}>Apprentice Labour</td>
                        <td style={{ padding: "10px 0 2px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: "13px", color: chalk, whiteSpace: "nowrap" }}>${apprenticeTotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0 0 10px", fontSize: "11px", color: slate, fontFamily: "'DM Mono', monospace", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                          {apprenticeHours} hrs @ ${apprenticeRate}/hr
                        </td>
                        <td style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }} />
                      </tr>
                    </>
                  )}
                  {materialsWithMarkup > 0 && (
                    <>
                      <tr>
                        <td style={{ padding: "10px 0 2px", fontSize: "13.5px", color: offwhite, fontWeight: 500 }}>Materials &amp; Equipment</td>
                        <td style={{ padding: "10px 0 2px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: "13px", color: chalk, whiteSpace: "nowrap" }}>${materialsWithMarkup.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "0 0 10px", fontSize: "11px", color: slate, fontFamily: "'DM Mono', monospace" }}>
                          {job.parts?.[0]?.items[0]?.name.split("(")[0].trim()}{job.parts && job.parts.length > 1 ? ", all fittings and connections included" : ""}
                        </td>
                        <td />
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="q-totals" style={{ padding: "0 40px 32px", display: "flex", justifyContent: "flex-end" }}>
              <div className="q-totals-inner" style={{ width: "300px" }}>
                {/* Summary rows */}
                {materialsWithMarkup > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: "13px", color: chalk, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                    <span>Materials &amp; Equipment</span>
                    <span style={{ fontFamily: "'DM Mono', monospace" }}>${materialsWithMarkup.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: "13px", color: chalk, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                  <span>Labour &amp; call-out</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>${labourAndCallOut.toFixed(2)}</span>
                </div>
                {/* Subtotal */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: "13px", color: offwhite, fontWeight: 500, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                  <span>Subtotal</span>
                  <span style={{ fontFamily: "'DM Mono', monospace" }}>${subtotal.toFixed(2)}</span>
                </div>
                {/* Tax lines */}
                {taxResult.lines.filter(l => l.amount > 0).map(line => (
                  <div key={line.name} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: "13px", color: chalk, borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                    <span>{formatTaxLabel(line)}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace" }}>${line.amount.toFixed(2)}</span>
                  </div>
                ))}
                {/* Grand total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0 0", borderTop: `1px solid ${orange}`, marginTop: "4px" }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: offwhite, letterSpacing: "0.06em" }}>Total</span>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: orange, letterSpacing: "0.04em" }}>${grandTotal.toFixed(2)} CAD</span>
                </div>
              </div>
            </div>

            {/* Deposit notice */}
            {depositRequired && (
              <>
                <div style={divider} />
                <div className="q-pad" style={{ padding: "20px 40px" }}>
                  <div style={eyebrow}>// Deposit required</div>
                  <p style={{ fontSize: "13px", color: chalk, lineHeight: 1.7 }}>
                    A {depositPercent}% deposit of <span style={{ color: offwhite, fontFamily: "'DM Mono', monospace" }}>${depositAmount.toFixed(2)}</span> is required on equipment to schedule this work.
                    {paymentInstructions && <> {paymentInstructions}.</>}
                  </p>
                </div>
              </>
            )}

            {/* Payment instructions (when no deposit block) */}
            {!depositRequired && paymentInstructions && (
              <>
                <div style={divider} />
                <div className="q-pad" style={{ padding: "20px 40px" }}>
                  <div style={eyebrow}>// How to pay</div>
                  <p style={{ fontSize: "13px", color: chalk }}>{paymentInstructions}</p>
                </div>
              </>
            )}

            <div style={divider} />

            {/* Terms & Warranty */}
            <div className="q-pad" style={{ padding: "24px 40px 32px" }}>
              {showWarranty && (
                <p style={{ fontSize: "11.5px", color: slate, lineHeight: "1.75", marginBottom: "10px" }}>
                  <span style={{ color: chalk, fontWeight: 500 }}>Warranty —</span> Labour warranted for {labourWarranty} from date of installation. {partsWarranty}.
                </p>
              )}
              <p style={{ fontSize: "11.5px", color: slate, lineHeight: "1.75" }}>
                <span style={{ color: chalk, fontWeight: 500 }}>Terms —</span> {termsText}
              </p>
            </div>

          </div>

          {/* ── CTA buttons ── */}
          <div style={{ padding: "24px 0 0" }}>
            <button
              onClick={() => respond("accepted")}
              style={{
                width: "100%", padding: "18px",
                background: orange, color: "white", border: "none", cursor: "pointer",
                fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", letterSpacing: "0.06em",
                display: "block", marginBottom: "10px",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.9"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            >
              Accept this estimate
            </button>
            <button
              onClick={() => respond("declined")}
              style={{
                width: "100%", padding: "13px",
                background: "transparent", color: slate, border: `1px solid rgba(255,255,255,0.10)`, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = chalk}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = slate}
            >
              Decline
            </button>
            <p style={{ textAlign: "center", fontSize: "10px", color: slate, marginTop: "14px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              By accepting you agree to the terms above · Valid until {validUntil}
            </p>
          </div>

          {/* ── Footer ── */}
          <div style={{ padding: "32px 0 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: slate }}>{companyName}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: slate }}>Powered by <span style={{ color: orange }}>GUS</span></span>
          </div>

        </div>
      </div>
    </div>
  );
}
