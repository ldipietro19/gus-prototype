"use client";

import { use, useEffect, useState } from "react";
import { mockJobs, mockCustomers, defaultPricingSettings, loadPricingSettings, loadLogo, loadEstimateOverride } from "@/lib/mockData";
import { calculateTax, formatTaxLabel } from "@/lib/taxEngine";

type Response = "pending" | "accepted" | "declined";

export default function CustomerQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [response, setResponse] = useState<Response>("pending");
  const [loaded, setLoaded] = useState(false);

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
  const labourAndCallOut = journeymanTotal + apprenticeTotal + effectiveCallOut;
  const subtotal = materialsWithMarkup + labourAndCallOut;
  const taxResult = calculateTax(province, materialsWithMarkup, labourAndCallOut);
  const grandTotal = subtotal + taxResult.totalTax;
  const depositRequired = grandTotal >= depositThreshold;
  const depositAmount = depositRequired ? grandTotal * depositPercent / 100 : 0;

  // ── Dates ─────────────────────────────────────────────────────────────────────
  const issueDateObj = new Date();
  const validUntilObj = new Date(issueDateObj);
  validUntilObj.setDate(issueDateObj.getDate() + quoteValidDays);
  const fmt = (d: Date) => d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
  const fmtShort = (d: Date) => d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
  const issueDate = fmt(issueDateObj);
  const validUntil = fmtShort(validUntilObj);

  // ── Customer ──────────────────────────────────────────────────────────────────
  const customerRecord = job?.customer ? mockCustomers.find(c =>
    c.name.toLowerCase() === job.customer!.toLowerCase() ||
    job.customer!.toLowerCase().includes(c.name.toLowerCase())
  ) : undefined;

  // ── Shared styles ─────────────────────────────────────────────────────────────
  const orange = "#F26A1B";
  const dark   = "#1A1A1A";
  const f      = "'DM Sans', sans-serif";
  const mono   = "'DM Mono', monospace";

  const sectionLabel: React.CSSProperties = {
    fontFamily: mono, fontSize: "9px", fontWeight: 600,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: "#CCC", marginBottom: "8px",
  };
  const partyLabel: React.CSSProperties = {
    fontFamily: mono, fontSize: "9px", fontWeight: 600,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: orange, marginBottom: "6px",
  };
  const thStyle: React.CSSProperties = {
    fontFamily: mono, fontSize: "10px", fontWeight: 600,
    letterSpacing: "0.08em", textTransform: "uppercase",
    color: "white", padding: "11px 0", textAlign: "left",
  };
  const tdStyle: React.CSSProperties = {
    padding: "13px 0", fontSize: "13px",
    borderBottom: "1px solid #F3F3F3", verticalAlign: "top",
  };
  const monoCell: React.CSSProperties = {
    fontFamily: mono, fontSize: "12px", color: "#666",
  };

  const globalCss = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #ECEAE5; }
    @media (max-width: 600px) {
      .q-header { flex-direction: column !important; gap: 16px !important; }
      .q-est-word { text-align: left !important; }
      .q-est-meta { text-align: left !important; }
      .q-parties { grid-template-columns: 1fr !important; }
      .q-party-right { border-left: none !important; border-top: 1px solid #EBEBEB; }
      .q-pad { padding-left: 20px !important; padding-right: 20px !important; }
      .q-tbl th:first-child { padding-left: 20px !important; }
      .q-tbl td:first-child { padding-left: 20px !important; }
      .q-tbl th.q-th-right { padding-right: 20px !important; }
      .q-tbl td.q-td-right { padding-right: 20px !important; }
      .q-totals { padding-left: 20px !important; padding-right: 20px !important; }
      .q-totals-inner { width: 100% !important; }
      .q-total-bar { padding-left: 20px !important; padding-right: 20px !important; }
      .q-cta { padding-left: 20px !important; padding-right: 20px !important; }
      .q-footer { padding-left: 20px !important; padding-right: 20px !important; }
    }
  `;

  // ── Not found ─────────────────────────────────────────────────────────────────
  if (!job) {
    return (
      <div style={{ minHeight: "100vh", background: "#ECEAE5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: f }}>
        <style>{globalCss}</style>
        <div style={{ textAlign: "center", color: "#999" }}>
          <div style={{ fontSize: "20px", fontWeight: 600, color: "#333", marginBottom: "8px" }}>Quote not found</div>
          <div style={{ fontSize: "13px" }}>This link may have expired or the quote doesn&apos;t exist.</div>
        </div>
      </div>
    );
  }

  // ── Accepted ──────────────────────────────────────────────────────────────────
  if (response === "accepted") {
    return (
      <div style={{ minHeight: "100vh", background: "#ECEAE5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: f, padding: "40px 24px" }}>
        <style>{globalCss}</style>
        <div style={{ background: "white", maxWidth: "480px", width: "100%", padding: "40px 36px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "22px", color: "#16A34A" }}>✓</div>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", letterSpacing: "-0.02em", marginBottom: "8px" }}>You&apos;re in.</div>
          <p style={{ fontSize: "14px", color: "#777", lineHeight: 1.7, marginBottom: "28px" }}>
            {companyName} has been notified and will be in touch to schedule.
          </p>
          <div style={{ borderTop: "1px solid #EBEBEB", paddingTop: "20px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
              <span style={{ color: "#999" }}>Estimate</span>
              <span style={{ color: "#333", fontFamily: mono }}>{job.jobId}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" }}>
              <span style={{ color: "#999" }}>Total</span>
              <span style={{ color: orange, fontFamily: mono, fontWeight: 600 }}>${grandTotal.toFixed(2)} CAD</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <span style={{ color: "#999" }}>Status</span>
              <span style={{ color: "#16A34A", fontSize: "12px", fontWeight: 500 }}>Accepted</span>
            </div>
          </div>
          <p style={{ fontSize: "11px", color: "#CCC", marginTop: "20px", fontFamily: mono }}>Questions? {phone}</p>
        </div>
        <p style={{ fontSize: "10px", color: "#BBB", marginTop: "24px", fontFamily: mono, letterSpacing: "0.06em" }}>Powered by GUS</p>
      </div>
    );
  }

  // ── Declined ──────────────────────────────────────────────────────────────────
  if (response === "declined") {
    return (
      <div style={{ minHeight: "100vh", background: "#ECEAE5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: f, padding: "40px 24px" }}>
        <style>{globalCss}</style>
        <div style={{ background: "white", maxWidth: "480px", width: "100%", padding: "40px 36px", textAlign: "center" }}>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", letterSpacing: "-0.02em", marginBottom: "8px" }}>Got it.</div>
          <p style={{ fontSize: "14px", color: "#777", lineHeight: 1.7 }}>
            No problem — {companyName} has been notified that you&apos;re not proceeding at this time.
          </p>
        </div>
        <p style={{ fontSize: "10px", color: "#BBB", marginTop: "24px", fontFamily: mono, letterSpacing: "0.06em" }}>Powered by GUS</p>
      </div>
    );
  }

  // ── Pending ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#ECEAE5", fontFamily: f, padding: "24px 16px 48px" }}>
      <style>{globalCss}</style>
      <div style={{ maxWidth: "680px", margin: "0 auto", background: "white" }}>

        {/* Header */}
        <div className="q-header q-pad" style={{ padding: "28px 36px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `4px solid ${orange}` }}>
          <div>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={companyName} style={{ maxHeight: "52px", maxWidth: "200px", objectFit: "contain", display: "block", marginBottom: "10px" }} />
            ) : (
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#111", letterSpacing: "-0.02em", marginBottom: "4px" }}>{companyName}</div>
            )}
            <div style={{ fontSize: "11px", color: "#999", lineHeight: 1.8 }}>
              {phone} · {email}<br />
              {businessAddress && <>{businessAddress} · </>}GST# {gstNumber}
              {licenceNumber && <> · Lic# {licenceNumber}</>}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "24px" }}>
            <div className="q-est-word" style={{ fontSize: "28px", fontWeight: 700, color: orange, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1 }}>Estimate</div>
            <div className="q-est-meta" style={{ fontFamily: mono, fontSize: "11px", color: "#AAA", marginTop: "5px", lineHeight: 1.8, textAlign: "right" }}>
              No. {job.jobId}<br />
              Issued {issueDate}<br />
              Valid until {validUntil}
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="q-parties" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #EBEBEB" }}>
          <div className="q-pad" style={{ padding: "22px 36px" }}>
            <div style={partyLabel}>Estimate for</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "5px", letterSpacing: "-0.01em" }}>{job.customer ?? "Customer"}</div>
            {customerRecord && (
              <div style={{ fontSize: "11.5px", color: "#888", lineHeight: 1.8 }}>
                {customerRecord.address}<br />{customerRecord.phone}
              </div>
            )}
          </div>
          <div className="q-pad q-party-right" style={{ padding: "22px 36px", borderLeft: "1px solid #EBEBEB" }}>
            <div style={partyLabel}>Estimate from</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111", marginBottom: "5px", letterSpacing: "-0.01em" }}>{companyName}</div>
            <div style={{ fontSize: "11.5px", color: "#888", lineHeight: 1.8 }}>
              {businessAddress && <>{businessAddress}<br /></>}
              {email}
            </div>
          </div>
        </div>

        {/* Scope */}
        <div className="q-pad" style={{ padding: "20px 36px", borderBottom: "1px solid #EBEBEB" }}>
          <div style={sectionLabel}>Scope of work</div>
          <div style={{ fontSize: "12.5px", color: "#555", lineHeight: 1.75 }}>
            {estimateNotes || job.description || "Work as discussed with customer."}
          </div>
        </div>

        {/* Table — full bleed */}
        <table className="q-tbl" style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead style={{ background: dark }}>
            <tr>
              <th className="q-thl" style={{ ...thStyle, width: "46%", paddingLeft: "36px" }}>Description</th>
              <th style={{ ...thStyle, width: "14%", textAlign: "center" }}>QTY</th>
              <th style={{ ...thStyle, width: "20%", textAlign: "center" }}>Unit Price</th>
              <th className="q-th-right" style={{ ...thStyle, width: "20%", textAlign: "right", paddingRight: "36px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {includeCallOut && (
              <tr>
                <td style={{ ...tdStyle, paddingLeft: "36px" }}>
                  <div style={{ fontWeight: 600, color: "#111", fontSize: "13px" }}>Call-out</div>
                </td>
                <td style={{ ...tdStyle, ...monoCell, textAlign: "center" }}>1</td>
                <td style={{ ...tdStyle, ...monoCell, textAlign: "center" }}>${effectiveCallOut.toFixed(2)}</td>
                <td className="q-td-right" style={{ ...tdStyle, ...monoCell, textAlign: "right", paddingRight: "36px" }}>${effectiveCallOut.toFixed(2)}</td>
              </tr>
            )}
            {includeJourneyman && (
              <tr>
                <td style={{ ...tdStyle, paddingLeft: "36px" }}>
                  <div style={{ fontWeight: 600, color: "#111", fontSize: "13px" }}>Journeyman labour</div>
                  <div style={{ fontSize: "11px", color: "#AAA", marginTop: "2px" }}>Plumbing installation</div>
                </td>
                <td style={{ ...tdStyle, ...monoCell, textAlign: "center" }}>{journeymanHours} hrs</td>
                <td style={{ ...tdStyle, ...monoCell, textAlign: "center" }}>${journeymanRate.toFixed(2)}</td>
                <td className="q-td-right" style={{ ...tdStyle, ...monoCell, textAlign: "right", paddingRight: "36px" }}>${journeymanTotal.toFixed(2)}</td>
              </tr>
            )}
            {includeApprentice && apprenticeHours > 0 && (
              <tr>
                <td style={{ ...tdStyle, paddingLeft: "36px" }}>
                  <div style={{ fontWeight: 600, color: "#111", fontSize: "13px" }}>Apprentice labour</div>
                  <div style={{ fontSize: "11px", color: "#AAA", marginTop: "2px" }}>Plumbing installation</div>
                </td>
                <td style={{ ...tdStyle, ...monoCell, textAlign: "center" }}>{apprenticeHours} hrs</td>
                <td style={{ ...tdStyle, ...monoCell, textAlign: "center" }}>${apprenticeRate.toFixed(2)}</td>
                <td className="q-td-right" style={{ ...tdStyle, ...monoCell, textAlign: "right", paddingRight: "36px" }}>${apprenticeTotal.toFixed(2)}</td>
              </tr>
            )}
            {materialsWithMarkup > 0 && (
              <tr>
                <td style={{ ...tdStyle, paddingLeft: "36px", borderBottom: "none" }}>
                  <div style={{ fontWeight: 600, color: "#111", fontSize: "13px" }}>Materials &amp; equipment</div>
                  <div style={{ fontSize: "11px", color: "#AAA", marginTop: "2px" }}>
                    {job.parts?.[0]?.items[0]?.name.split("(")[0].trim()}{job.parts && job.parts.length > 1 ? ", fittings & connections" : ""}
                  </div>
                </td>
                <td style={{ ...tdStyle, ...monoCell, textAlign: "center", borderBottom: "none" }}>1</td>
                <td style={{ ...tdStyle, ...monoCell, textAlign: "center", borderBottom: "none" }}>${materialsWithMarkup.toFixed(2)}</td>
                <td className="q-td-right" style={{ ...tdStyle, ...monoCell, textAlign: "right", paddingRight: "36px", borderBottom: "none" }}>${materialsWithMarkup.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Subtotals */}
        <div className="q-totals" style={{ padding: "16px 36px 0", display: "flex", justifyContent: "flex-end" }}>
          <div className="q-totals-inner" style={{ width: "240px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "5px 0", color: "#888", fontFamily: mono, borderBottom: "1px solid #F5F5F5" }}>
              <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            {taxResult.lines.filter(l => l.amount > 0).map(line => (
              <div key={line.name} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "5px 0", color: "#888", fontFamily: mono, borderBottom: "1px solid #F5F5F5" }}>
                <span>{formatTaxLabel(line)}</span><span>${line.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total bar — full bleed */}
        <div className="q-total-bar" style={{ marginTop: "16px", background: dark, padding: "16px 36px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "white", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total</span>
          <span style={{ fontSize: "22px", fontWeight: 700, color: orange, fontFamily: mono }}>${grandTotal.toFixed(2)} CAD</span>
        </div>

        {/* Deposit notice */}
        {depositRequired && (
          <div className="q-pad" style={{ padding: "16px 36px", background: "#FFF8F4", borderBottom: "1px solid #FFE0CC" }}>
            <div style={{ fontSize: "12px", color: "#955", lineHeight: 1.6 }}>
              A {depositPercent}% deposit of <strong>${depositAmount.toFixed(2)}</strong> is required on equipment to schedule this work.
              {paymentInstructions && <> {paymentInstructions}.</>}
            </div>
          </div>
        )}

        {/* Terms */}
        <div className="q-pad" style={{ padding: "20px 36px", borderTop: depositRequired ? "none" : "1px solid #EBEBEB", marginTop: depositRequired ? "0" : "0" }}>
          <div style={sectionLabel}>Terms &amp; warranty</div>
          <div style={{ fontSize: "11px", color: "#AAA", lineHeight: 1.75 }}>
            {showWarranty && (
              <><strong style={{ color: "#888" }}>Warranty —</strong> Labour warranted for {labourWarranty}. {partsWarranty}.<br /></>
            )}
            {paymentInstructions && !depositRequired && (
              <><strong style={{ color: "#888" }}>Payment —</strong> {paymentTerms}. {paymentInstructions}.<br /></>
            )}
            <strong style={{ color: "#888" }}>Terms —</strong> {termsText}
          </div>
        </div>

        {/* CTA */}
        <div className="q-cta q-pad" style={{ padding: "0 36px 28px" }}>
          <button
            onClick={() => respond("accepted")}
            style={{ width: "100%", padding: "14px", background: orange, color: "white", border: "none", fontFamily: f, fontSize: "15px", fontWeight: 600, cursor: "pointer", marginBottom: "8px", display: "block" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.9"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
          >
            Accept this estimate
          </button>
          <button
            onClick={() => respond("declined")}
            style={{ width: "100%", padding: "10px", background: "transparent", color: "#CCC", border: "1px solid #E8E8E8", fontFamily: f, fontSize: "13px", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#999"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#CCC"}
          >
            Decline
          </button>
          <p style={{ textAlign: "center", fontSize: "10px", color: "#CCC", marginTop: "10px", fontFamily: mono, letterSpacing: "0.03em" }}>
            By accepting you agree to the terms above · Valid until {validUntil}
          </p>
        </div>

        {/* Footer */}
        <div className="q-footer q-pad" style={{ padding: "14px 36px", borderTop: "1px solid #EBEBEB", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", color: "#CCC", fontFamily: mono, letterSpacing: "0.04em" }}>{companyName} · {job.jobId}</span>
          <span style={{ fontSize: "10px", color: "#CCC", fontFamily: mono, letterSpacing: "0.04em" }}>Powered by GUS</span>
        </div>

      </div>
    </div>
  );
}
