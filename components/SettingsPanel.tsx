"use client";
import { useState, useEffect } from "react";
import { calculateTax, formatTaxLabel, Province, PST_PROVINCES, PROVINCE_NAMES } from "@/lib/taxEngine";
import { defaultPricingSettings, loadPricingSettings, savePricingSettings } from "@/lib/mockData";

type Tab =
  | "general" | "business" | "appearance"
  | "rates" | "defaults" | "tax" | "delivery" | "terms"
  | "notifications" | "connectors"
  | "people" | "groups" | "roles"
  | "billing";

// ── Shared styles ─────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: "100%", height: "36px", border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px", padding: "0 12px", fontSize: "13.5px",
  color: "var(--text)", background: "var(--bg)", outline: "none",
  fontFamily: "var(--font-sans)",
};
const sel = inp;
const lbl: React.CSSProperties = { fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "5px", fontWeight: 500 };
const sec: React.CSSProperties = { marginBottom: "24px" };
const row2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" };
const row3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" };
const hint: React.CSSProperties = { fontSize: "11.5px", color: "var(--text-muted)", marginTop: "5px", fontFamily: "var(--font-mono)", letterSpacing: "0.02em" };

// ── Helper components ─────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ width: "40px", height: "22px", borderRadius: "11px", background: on ? "var(--orange)" : "#3D6480", border: "none", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
      <span style={{ position: "absolute", top: "3px", left: on ? "21px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: "white", transition: "left 0.2s", display: "block" }} />
    </button>
  );
}

function ToggleRow({ label, sub, on, onToggle, last }: { label: string; sub: string; on: boolean; onToggle: () => void; last?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: last ? "none" : "1px solid var(--border)", background: "var(--bg)", gap: "16px" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13.5px", color: "var(--text)", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.5 }}>{sub}</div>
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid var(--border)" }}>{children}</div>;
}

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={lbl}>{label}{optional && <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400, marginLeft: "4px" }}>optional</span>}</label>
      {children}
    </div>
  );
}

function SaveBar({ onSave }: { onSave?: () => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", marginTop: "28px", borderTop: "1px solid var(--border)" }}>
      {saved && <span style={{ fontSize: "12.5px", color: "#34d399", display: "flex", alignItems: "center", gap: "5px" }}><i className="ti ti-check" style={{ fontSize: "14px" }} /> Saved</span>}
      <button onClick={() => { onSave?.(); setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        style={{ background: "var(--orange)", color: "white", border: "none", borderRadius: "8px", padding: "8px 20px", fontFamily: "var(--font-sans)", fontSize: "13.5px", fontWeight: 500, cursor: "pointer" }}>
        Save changes
      </button>
    </div>
  );
}

function RateCard({ label, value, onChange }: { label: string; value: number; onChange?: (v: number) => void }) {
  return (
    <div style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px" }}>
      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{label}</span>
      <input type="number" value={value} onChange={e => onChange?.(+e.target.value)}
        style={{ fontSize: "18px", fontWeight: 500, border: "none", background: "none", padding: "0", height: "auto", color: "var(--text)", width: "100%", outline: "none", fontFamily: "var(--font-sans)" }} />
    </div>
  );
}

function LockedPanel({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "14px", padding: "60px 40px", textAlign: "center", marginTop: "8px" }}>
      <i className={icon} style={{ fontSize: "32px", color: "var(--text-muted)", display: "block", marginBottom: "16px" }} />
      <div style={{ fontSize: "16px", fontWeight: 500, color: "var(--text)", marginBottom: "8px" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, maxWidth: "380px", margin: "0 auto 20px" }}>{sub}</div>
      <button style={{ background: "var(--teal)", color: "white", border: "none", borderRadius: "8px", padding: "10px 22px", fontFamily: "var(--font-sans)", fontSize: "13.5px", fontWeight: 500, cursor: "pointer" }}>Upgrade to GUS Shop</button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SettingsPanel() {
  const [tab, setTab] = useState<Tab>("business");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    calloutWaiver: true, precautionWork: true, warranty: true,
    notifyViewed: true, notifyAccepted: true, notifyDeclined: false,
    notifyExpiry: true, weeklySummary: false, compactView: false,
    followupsEnabled: true,
  });
  const tog = (key: string) => setToggles(t => ({ ...t, [key]: !t[key] }));

  const [followupSteps, setFollowupSteps] = useState([
    { day: 3,  label: "Soft nudge",     subject: "Quick check-in on your estimate — {job_id}", body: "Hi {customer_name},\n\nJust wanted to make sure your estimate didn't get buried. Happy to answer any questions or adjust the scope if needed.\n\nYou can view and accept it here: {quote_link}\n\nKelsea\nLC Plumbing Co · 778-840-1388" },
    { day: 7,  label: "Check-in",       subject: "Still here if you have questions — {job_id}",  body: "Hi {customer_name},\n\nFollowing up one more time on your estimate. No pressure — just want to make sure you have everything you need.\n\nThe estimate is valid for 30 days from when it was sent.\n\n{quote_link}\n\nKelsea\nLC Plumbing Co" },
    { day: 14, label: "Final reminder", subject: "Your estimate expires soon — {job_id}",         body: "Hi {customer_name},\n\nThis is our last follow-up — your estimate expires in 16 days. After that, material prices may change and we'd need to re-quote.\n\nIf the timing isn't right, no worries — just let us know.\n\n{quote_link}\n\nKelsea\nLC Plumbing Co" },
  ]);
  const [followupExpandedStep, setFollowupExpandedStep] = useState<number | null>(null);

  const [province, setProvince] = useState<Province>(defaultPricingSettings.province);
  const [pstRegistered, setPstRegistered] = useState(defaultPricingSettings.pstRegistered);
  const [standardLaborRate, setStandardLaborRate] = useState(defaultPricingSettings.standardLaborRate);
  const [callOutFee, setCallOutFee] = useState(defaultPricingSettings.callOutFee);
  const [emergencyLaborRate, setEmergencyLaborRate] = useState(defaultPricingSettings.emergencyLaborRate);
  const [defaultMarkup, setDefaultMarkup] = useState(defaultPricingSettings.defaultMarkup);
  const [quoteValidDays, setQuoteValidDays] = useState(defaultPricingSettings.quoteValidDays);
  const [paymentTerms, setPaymentTerms] = useState(defaultPricingSettings.paymentTerms);
  const [depositPercent, setDepositPercent] = useState(defaultPricingSettings.depositPercent);
  const [depositThreshold, setDepositThreshold] = useState(defaultPricingSettings.depositThreshold);
  const [termsText, setTermsText] = useState(defaultPricingSettings.termsText);
  const [labourWarranty, setLabourWarranty] = useState(defaultPricingSettings.labourWarranty);
  const [partsWarranty, setPartsWarranty] = useState(defaultPricingSettings.partsWarranty);
  const [pricingBufferFrom, setPricingBufferFrom] = useState(defaultPricingSettings.pricingBufferFrom);
  const [pricingBufferTo, setPricingBufferTo] = useState(defaultPricingSettings.pricingBufferTo);

  useEffect(() => {
    const s = loadPricingSettings();
    setProvince(s.province);
    setPstRegistered(s.pstRegistered);
    setStandardLaborRate(s.standardLaborRate);
    setCallOutFee(s.callOutFee);
    setEmergencyLaborRate(s.emergencyLaborRate);
    setDefaultMarkup(s.defaultMarkup);
    setQuoteValidDays(s.quoteValidDays);
    setPaymentTerms(s.paymentTerms);
    setDepositPercent(s.depositPercent);
    setDepositThreshold(s.depositThreshold);
    setTermsText(s.termsText);
    setLabourWarranty(s.labourWarranty);
    setPartsWarranty(s.partsWarranty);
    setPricingBufferFrom(s.pricingBufferFrom);
    setPricingBufferTo(s.pricingBufferTo);
  }, []);

  const NAV: { group: string; items: { id: Tab; label: string; icon: string }[] }[] = [
    { group: "Settings", items: [
      { id: "general", label: "General", icon: "ti ti-settings" },
      { id: "business", label: "Business profile", icon: "ti ti-building" },
      { id: "appearance", label: "Appearance", icon: "ti ti-palette" },
    ]},
    { group: "Pricing & Estimates", items: [
      { id: "rates", label: "Rates", icon: "ti ti-currency-dollar" },
      { id: "defaults", label: "Defaults", icon: "ti ti-file-description" },
      { id: "tax", label: "Tax", icon: "ti ti-receipt-tax" },
      { id: "delivery", label: "Delivery", icon: "ti ti-send" },
      { id: "terms", label: "Terms", icon: "ti ti-notes" },
    ]},
    { group: "Notifications", items: [
      { id: "notifications", label: "Notifications", icon: "ti ti-bell" },
    ]},
    { group: "Integrations", items: [
      { id: "connectors", label: "Connectors", icon: "ti ti-plug" },
    ]},
    { group: "Members & access", items: [
      { id: "people", label: "People", icon: "ti ti-users" },
      { id: "groups", label: "Groups", icon: "ti ti-users-group" },
      { id: "roles", label: "Roles & permissions", icon: "ti ti-shield-check" },
    ]},
    { group: "Account", items: [
      { id: "billing", label: "Plan & billing", icon: "ti ti-credit-card" },
    ]},
  ];

  return (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>

      {/* Settings nav sidebar */}
      <aside style={{ width: "224px", flexShrink: 0, padding: "28px 12px", borderRight: "1px solid var(--border)", background: "var(--sidebar-bg)", overflowY: "auto" }}>
        {NAV.map(group => (
          <div key={group.group} style={{ marginBottom: "24px" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", padding: "0 12px", marginBottom: "4px", display: "block" }}>{group.group}</span>
            {group.items.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", fontSize: "13.5px", color: tab === item.id ? "var(--orange)" : "var(--text-secondary)", background: tab === item.id ? "rgba(242,106,27,0.18)" : "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", fontWeight: tab === item.id ? 500 : 400, transition: "background 0.1s, color 0.1s" }}
                onMouseEnter={e => { if (tab !== item.id) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (tab !== item.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <i className={item.icon} style={{ fontSize: "16px", flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: "36px 40px 80px", maxWidth: "720px", overflowY: "auto" }}>

        {/* ── BUSINESS PROFILE ── */}
        {tab === "business" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Business profile</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Appears on every estimate — your logo, contact info, and tax number.</p>
            <div style={sec}>
              <SectionTitle>Logo</SectionTitle>
              <div style={{ border: "1.5px dashed rgba(255,255,255,0.12)", borderRadius: "10px", padding: "24px", textAlign: "center", cursor: "pointer", background: "var(--bg-page)" }}>
                <i className="ti ti-upload" style={{ fontSize: "22px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }} />
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Click to upload your logo</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>PNG, SVG or JPG · max 2MB · recommended 300×120px</div>
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Your details</SectionTitle>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.6 }}>Your name and title appear on every estimate you send.</p>
              <div style={row2}>
                <Field label="First name"><input type="text" defaultValue="Kelsea" style={inp} /></Field>
                <Field label="Last name"><input type="text" defaultValue="Loewen" style={inp} /></Field>
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Company details</SectionTitle>
              <Field label="Company name"><input type="text" defaultValue="Reputation Plumbing & Heating" style={inp} /></Field>
              <div style={row2}>
                <Field label="GST / HST number"><input type="text" defaultValue="715748331RT0001" style={inp} /></Field>
                <Field label="WCB / WorkSafe number" optional><input type="text" placeholder="e.g. 12345678" style={inp} /></Field>
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Contact information</SectionTitle>
              <Field label="Business address"><input type="text" placeholder="Street address" style={inp} /></Field>
              <div style={row3}>
                <Field label="City"><input type="text" defaultValue="Port Moody" style={inp} /></Field>
                <Field label="Province">
                  <select style={sel}><option>BC</option><option>AB</option><option>ON</option><option>MB</option><option>SK</option></select>
                </Field>
                <Field label="Postal code"><input type="text" placeholder="V3H 1A1" style={inp} /></Field>
              </div>
              <div style={row2}>
                <Field label="Phone"><input type="tel" defaultValue="778-840-1388" style={inp} /></Field>
                <Field label="Email"><input type="email" defaultValue="kelsea@repplumbing.net" style={inp} /></Field>
              </div>
              <Field label="Website" optional><input type="text" placeholder="https://repplumbing.ca" style={inp} /></Field>
            </div>
            <SaveBar />
          </div>
        )}

        {/* ── GENERAL ── */}
        {tab === "general" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>General</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Regional preferences and display defaults across GUS.</p>
            <div style={sec}>
              <SectionTitle>Regional</SectionTitle>
              <div style={row2}>
                <Field label="Timezone">
                  <select style={sel}>
                    <option>America/Vancouver (PT)</option>
                    <option>America/Edmonton (MT)</option>
                    <option>America/Winnipeg (CT)</option>
                    <option>America/Toronto (ET)</option>
                    <option>America/Halifax (AT)</option>
                    <option>America/St_Johns (NT)</option>
                  </select>
                </Field>
                <Field label="Currency">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", padding: "0 12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-page)", color: "var(--text-muted)", fontSize: "13.5px" }}>
                    <i className="ti ti-lock" style={{ fontSize: "13px", flexShrink: 0 }} />
                    CAD — Canadian Dollar
                  </div>
                  <div style={hint}>Canada only · not configurable</div>
                </Field>
              </div>
              <div style={row2}>
                <Field label="Date format">
                  <select style={sel}>
                    <option>MMM D, YYYY — Jun 24, 2026</option>
                    <option>DD/MM/YYYY — 24/06/2026</option>
                    <option>YYYY-MM-DD — 2026-06-24</option>
                  </select>
                </Field>
                <Field label="Language">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", height: "36px", padding: "0 12px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-page)", color: "var(--text-muted)", fontSize: "13.5px" }}>
                    <i className="ti ti-lock" style={{ fontSize: "13px", flexShrink: 0 }} />
                    English
                  </div>
                  <div style={hint}>English only · not configurable</div>
                </Field>
              </div>
            </div>
            <SaveBar />
          </div>
        )}

        {/* ── APPEARANCE ── */}
        {tab === "appearance" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Appearance</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Customize how GUS looks on your device.</p>
            <div style={sec}>
              <SectionTitle>Theme</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "8px" }}>
                {([
                  { id: "light" as const, label: "Light", bg: "#F5F5F3", bar: "#E0E0DE", row: "#D0D0CE" },
                  { id: "dark" as const, label: "Dark", bg: "#0D1B2E", bar: "#142236", row: "#1e3352" },
                  { id: "system" as const, label: "System", bg: "linear-gradient(135deg,#F5F5F3 50%,#0D1B2E 50%)", bar: "rgba(128,128,128,0.35)", row: "rgba(128,128,128,0.25)" },
                ]).map(t => (
                  <div key={t.id} onClick={() => setTheme(t.id)}
                    style={{ border: `2px solid ${theme === t.id ? "var(--orange)" : "rgba(255,255,255,0.12)"}`, borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "border-color 0.15s" }}>
                    <div style={{ height: "72px", padding: "8px", display: "flex", flexDirection: "column", gap: "5px", background: t.bg }}>
                      <div style={{ height: "10px", borderRadius: "4px", background: t.bar }} />
                      <div style={{ height: "7px", borderRadius: "3px", width: "70%", background: t.row }} />
                      <div style={{ height: "7px", borderRadius: "3px", width: "50%", background: t.row }} />
                    </div>
                    <div style={{ padding: "8px 10px", fontSize: "12.5px", fontWeight: theme === t.id ? 600 : 500, color: theme === t.id ? "var(--orange)" : "var(--text-secondary)", borderTop: "1px solid var(--border)", background: "var(--bg)", textAlign: "center" }}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Density</SectionTitle>
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                <ToggleRow label="Compact view" sub="Tighten spacing in lists and tables. Useful on smaller screens." on={toggles.compactView} onToggle={() => tog("compactView")} last />
              </div>
            </div>
          </div>
        )}

        {/* ── RATES ── */}
        {tab === "rates" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Rates</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>GUS pulls these into every estimate automatically. Override any value per job.</p>
            <div style={sec}>
              <SectionTitle>Labour rates</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                <RateCard label="Call-out fee" value={callOutFee} onChange={setCallOutFee} />
                <RateCard label="Standard rate / hr" value={standardLaborRate} onChange={setStandardLaborRate} />
                <RateCard label="Emergency rate / hr" value={emergencyLaborRate} onChange={setEmergencyLaborRate} />
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                <ToggleRow label="Allow call-out waiver" sub="Waive the call-out fee when going straight to hourly billing." on={toggles.calloutWaiver} onToggle={() => tog("calloutWaiver")} last />
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Default markup</SectionTitle>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.6 }}>Applied to all materials on every estimate. Override per job anytime.</p>
              <div style={{ maxWidth: "200px" }}>
                <RateCard label="Materials markup %" value={defaultMarkup} onChange={setDefaultMarkup} />
              </div>
            </div>
            <SaveBar onSave={() => savePricingSettings({ standardLaborRate, callOutFee, emergencyLaborRate, allowCallOutWaiver: toggles.calloutWaiver, defaultMarkup })} />
          </div>
        )}

        {/* ── DEFAULTS ── */}
        {tab === "defaults" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Defaults</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Controls numbering, validity, and payment defaults for all estimates.</p>
            <div style={sec}>
              <SectionTitle>Numbering</SectionTitle>
              <Field label="Estimate number prefix">
                <div style={{ display: "flex" }}>
                  <div style={{ background: "var(--bg-page)", border: "1px solid rgba(255,255,255,0.12)", borderRight: "none", borderRadius: "8px 0 0 8px", padding: "0 12px", fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>RPH-E</div>
                  <input type="text" defaultValue="001" style={{ ...inp, borderRadius: "0 8px 8px 0", flex: 1, fontFamily: "var(--font-mono)" }} />
                </div>
                <div style={hint}>Preview → RPH-E001-2026-06-24</div>
              </Field>
            </div>
            <div style={sec}>
              <SectionTitle>Validity & expiry</SectionTitle>
              <div style={row2}>
                <Field label="Estimate valid for (days)">
                  <select value={quoteValidDays} onChange={e => setQuoteValidDays(+e.target.value)} style={sel}>
                    <option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option><option value={60}>60 days</option>
                  </select>
                  <div style={hint}>Shown on estimate and flags expired in dashboard</div>
                </Field>
                <Field label="Expiry reminder">
                  <select style={sel}>
                    <option>No reminder</option><option>3 days before</option><option>7 days before</option><option>1 day before</option>
                  </select>
                </Field>
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Precaution work</SectionTitle>
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                <ToggleRow label="Include precaution work section" sub="Adds a separate section to the estimate for advisory or preventive items that need attention but aren't part of the primary scope." on={toggles.precautionWork} onToggle={() => tog("precautionWork")} last />
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Payment defaults</SectionTitle>
              <div style={row2}>
                <Field label="Equipment deposit %">
                  <input type="number" value={depositPercent} onChange={e => setDepositPercent(+e.target.value)} style={inp} />
                </Field>
                <Field label="Deposit applies when equipment over">
                  <div style={{ display: "flex" }}>
                    <div style={{ background: "var(--bg-page)", border: "1px solid rgba(255,255,255,0.12)", borderRight: "none", borderRadius: "8px 0 0 8px", padding: "0 12px", fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", fontFamily: "var(--font-mono)" }}>$</div>
                    <input type="number" value={depositThreshold} onChange={e => setDepositThreshold(+e.target.value)} style={{ ...inp, borderRadius: "0 8px 8px 0", flex: 1 }} />
                  </div>
                </Field>
              </div>
              <Field label="Payment terms">
                <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} style={sel}>
                  <option>Due on completion</option><option>Net 7</option><option>Net 15</option><option>Net 30</option>
                </select>
              </Field>
            </div>
            <SaveBar onSave={() => savePricingSettings({ quoteValidDays, paymentTerms, depositPercent, depositThreshold, includePrecautionWork: toggles.precautionWork })} />
          </div>
        )}

        {/* ── TAX ── */}
        {tab === "tax" && (() => {
          const sampleMaterials = 619.00;
          const sampleLabour   = 190.00;
          const taxPreview = calculateTax(province, sampleMaterials, sampleLabour);
          const needsPst = PST_PROVINCES.includes(province);
          return (
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Tax</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Province is set once and drives how tax is calculated on every estimate.</p>
              <div style={sec}>
                <SectionTitle>Province</SectionTitle>
                <div style={row2}>
                  <Field label="Province you operate in">
                    <select value={province} onChange={e => setProvince(e.target.value as Province)} style={sel}>
                      {(Object.entries(PROVINCE_NAMES) as [Province, string][]).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="GST number">
                    <input type="text" defaultValue="715748331RT0001" style={inp} />
                  </Field>
                </div>
              </div>
              {needsPst && (
                <div style={sec}>
                  <SectionTitle>PST / QST registration</SectionTitle>
                  <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                    <ToggleRow
                      label={`Registered to collect ${province === "QC" ? "QST" : province === "MB" ? "RST" : "PST"}`}
                      sub={`You have a ${province === "QC" ? "QST" : "PST"} number and are authorized to collect it from customers.`}
                      on={pstRegistered}
                      onToggle={() => setPstRegistered(v => !v)}
                      last
                    />
                  </div>
                </div>
              )}
              <div style={sec}>
                <SectionTitle>Live preview — {PROVINCE_NAMES[province]}</SectionTitle>
                <div style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  <div style={{ padding: "10px 16px 6px", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--teal)" }}>// Live preview — sample estimate</span>
                  </div>
                  {[
                    { label: "Materials (w/ markup)", value: `$${sampleMaterials.toFixed(2)}` },
                    { label: "Labour", value: `$${sampleLabour.toFixed(2)}` },
                    { label: "Subtotal", value: `$${(sampleMaterials + sampleLabour).toFixed(2)}`, bold: true },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", borderBottom: "1px solid var(--border-light)", fontSize: "13px" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: row.bold ? "var(--text)" : "var(--text-secondary)", fontWeight: row.bold ? 600 : 400 }}>{row.value}</span>
                    </div>
                  ))}
                  {taxPreview.lines.filter(line => !(needsPst && !pstRegistered && line.appliesTo === "materials")).map((line, i, arr) => (
                    <div key={line.name} style={{ display: "flex", justifyContent: "space-between", padding: "9px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--border-light)" : "1px solid var(--border)", fontSize: "13px", background: "rgba(26,191,191,0.03)" }}>
                      <span style={{ color: "var(--teal)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{formatTaxLabel(line)}</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--teal)" }}>${line.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "rgba(242,106,27,0.05)", fontSize: "14px" }}>
                    <span style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.06em", color: "var(--text)", fontSize: "16px" }}>Total</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--orange)", fontSize: "15px" }}>${(sampleMaterials + sampleLabour + taxPreview.totalTax).toFixed(2)} CAD</span>
                  </div>
                </div>
              </div>
              <SaveBar onSave={() => savePricingSettings({ province, pstRegistered })} />
            </div>
          );
        })()}

        {/* ── DELIVERY ── */}
        {tab === "delivery" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Estimate delivery</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Default email template used when sending estimates to customers.</p>
            <div style={sec}>
              <SectionTitle>Email template</SectionTitle>
              <Field label="Default subject line"><input type="text" defaultValue="Your estimate from Reputation Plumbing & Heating — RPH-E{number}" style={inp} /></Field>
              <Field label="Default message body">
                <textarea rows={6} defaultValue={`Hi {customer_name},\n\nPlease find your estimate attached. This is valid for 30 days.\n\nFeel free to call or text if you have any questions.\n\nKelsea\nReputation Plumbing & Heating\n778-840-1388`}
                  style={{ ...inp, height: "auto", padding: "10px 12px", resize: "vertical" as const, lineHeight: 1.6 }} />
              </Field>
            </div>
            <div style={sec}>
              <SectionTitle>Sender</SectionTitle>
              <div style={row2}>
                <Field label="Send from name"><input type="text" defaultValue="Kelsea · Reputation Plumbing" style={inp} /></Field>
                <Field label="Reply-to email"><input type="email" defaultValue="kelsea@reputationplumbing.ca" style={inp} /></Field>
              </div>
            </div>
            <SaveBar />
          </div>
        )}

        {/* ── TERMS ── */}
        {tab === "terms" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Terms</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Boilerplate text that appears at the bottom of every estimate.</p>
            <div style={sec}>
              <SectionTitle>Terms & conditions</SectionTitle>
              <div style={{ marginBottom: "16px" }}>
                <textarea rows={6} value={termsText} onChange={e => setTermsText(e.target.value)}
                  style={{ ...inp, height: "auto", padding: "10px 12px", resize: "vertical" as const, lineHeight: 1.6 }} />
              </div>
              <div style={row2}>
                <Field label="Price buffer — from %"><input type="number" value={pricingBufferFrom} onChange={e => setPricingBufferFrom(+e.target.value)} style={inp} /></Field>
                <Field label="Price buffer — to %"><input type="number" value={pricingBufferTo} onChange={e => setPricingBufferTo(+e.target.value)} style={inp} /></Field>
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Warranty</SectionTitle>
              <div style={row2}>
                <Field label="Labour warranty">
                  <select value={labourWarranty} onChange={e => setLabourWarranty(e.target.value)} style={sel}>
                    <option>1 year</option><option>2 years</option><option>90 days</option><option>No warranty</option>
                  </select>
                </Field>
                <Field label="Parts / equipment warranty">
                  <select value={partsWarranty} onChange={e => setPartsWarranty(e.target.value)} style={sel}>
                    <option>Manufacturer warranty applies</option><option>1 year parts & labour</option><option>2 years parts & labour</option>
                  </select>
                </Field>
              </div>
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                <ToggleRow label="Show warranty on estimate" sub="Include warranty language in the terms section of every estimate." on={toggles.warranty} onToggle={() => tog("warranty")} last />
              </div>
            </div>
            <SaveBar onSave={() => savePricingSettings({ termsText, labourWarranty, partsWarranty, showWarranty: toggles.warranty, pricingBufferFrom, pricingBufferTo })} />
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab === "notifications" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Notifications</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Control when GUS sends you and your customers email alerts.</p>
            <div style={sec}>
              <SectionTitle>Estimate activity</SectionTitle>
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                <ToggleRow label="Estimate viewed" sub="Email me when a customer opens an estimate link for the first time." on={toggles.notifyViewed} onToggle={() => tog("notifyViewed")} />
                <ToggleRow label="Estimate accepted" sub="Email me when a customer accepts an estimate." on={toggles.notifyAccepted} onToggle={() => tog("notifyAccepted")} />
                <ToggleRow label="Estimate declined" sub="Email me when a customer declines." on={toggles.notifyDeclined} onToggle={() => tog("notifyDeclined")} last />
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Automatic follow-ups</SectionTitle>
              <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.6 }}>
                GUS sends follow-up emails to customers who haven&apos;t responded to a quote. Emails stop automatically when the customer accepts, declines, or the quote expires.
              </p>
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", marginBottom: "14px" }}>
                <ToggleRow label="Enable automatic follow-ups" sub="GUS will email your customer at each interval below until they respond." on={toggles.followupsEnabled} onToggle={() => tog("followupsEnabled")} last />
              </div>
              {toggles.followupsEnabled && (
                <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  {followupSteps.map((step, i) => {
                    const isOpen = followupExpandedStep === i;
                    return (
                      <div key={i} style={{ borderBottom: i < followupSteps.length - 1 || isOpen ? "1px solid var(--border-light)" : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px" }}>
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--teal)", flexShrink: 0 }} />
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>Day</span>
                            <input type="number" value={step.day} onChange={e => setFollowupSteps(steps => steps.map((s, j) => j === i ? { ...s, day: +e.target.value } : s))}
                              style={{ ...inp, width: "52px", height: "30px", fontSize: "13px", textAlign: "center", padding: "0 6px" }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input type="text" value={step.subject} onChange={e => setFollowupSteps(steps => steps.map((s, j) => j === i ? { ...s, subject: e.target.value } : s))}
                              style={{ ...inp, height: "30px", fontSize: "12.5px" }} />
                          </div>
                          <button onClick={() => setFollowupExpandedStep(isOpen ? null : i)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--teal)", fontSize: "11.5px", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                            {isOpen ? "Hide" : "Edit body"}
                          </button>
                        </div>
                        {isOpen && (
                          <div style={{ padding: "0 16px 16px" }}>
                            <p style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Email body</p>
                            <textarea rows={6} value={step.body} onChange={e => setFollowupSteps(steps => steps.map((s, j) => j === i ? { ...s, body: e.target.value } : s))}
                              style={{ ...inp, height: "auto", padding: "10px 12px", resize: "vertical" as const, lineHeight: 1.7, fontSize: "12.5px" }} />
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", lineHeight: 1.6, marginTop: "6px" }}>
                              Placeholders:{" "}
                              <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "3px" }}>{"{customer_name}"}</code>{" "}
                              <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "3px" }}>{"{job_id}"}</code>{" "}
                              <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "3px" }}>{"{quote_link}"}</code>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid var(--border-light)" }}>
                    <p style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", lineHeight: 1.7 }}>
                      // Follow-ups stop automatically when: customer accepts · customer declines · quote expires · you manually stop them
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div style={sec}>
              <SectionTitle>Other reminders</SectionTitle>
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                <ToggleRow label="Estimate expiry warning" sub="Alert me 3 days before an estimate expires with no response." on={toggles.notifyExpiry} onToggle={() => tog("notifyExpiry")} />
                <ToggleRow label="Weekly summary" sub="Monday digest — estimates sent, accepted, and pending that week." on={toggles.weeklySummary} onToggle={() => tog("weeklySummary")} last />
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Notification email</SectionTitle>
              <Field label="Send alerts to"><input type="email" defaultValue="kelsea@reputationplumbing.ca" style={inp} /></Field>
            </div>
            <SaveBar />
          </div>
        )}

        {/* ── CONNECTORS ── */}
        {tab === "connectors" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Connectors</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Connect GUS to your existing tools.</p>
            <div style={sec}>
              <div style={{ background: "rgba(26,191,191,0.07)", border: "1px solid rgba(26,191,191,0.2)", borderRadius: "10px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "24px" }}>
                <i className="ti ti-info-circle" style={{ color: "var(--teal)", fontSize: "18px", flexShrink: 0, marginTop: "1px" }} />
                <div style={{ fontSize: "13px", color: "var(--teal)", lineHeight: 1.6 }}>Integrations are coming in a future GUS release.</div>
              </div>
              {[
                { abbr: "QB", bg: "#2CA01C", name: "QuickBooks Online", desc: "Sync accepted estimates as invoices. Auto-populate customer records, tax codes, and payment status." },
                { abbr: "JB", bg: "#FF6B35", name: "Jobber", desc: "Pull job details into estimates automatically. Push accepted estimates back as jobs." },
              ].map(c => (
                <div key={c.name} style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px", background: "var(--bg)", opacity: 0.6 }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 700, color: "white" }}>{c.abbr}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>{c.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.5 }}>{c.desc}</div>
                  </div>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: "var(--bg-page)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "4px", padding: "1px 6px" }}>Coming soon</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PEOPLE ── */}
        {tab === "people" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>People</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Everyone with access to GUS at your shop.</p>
            <div style={sec}>
              <SectionTitle>Owner</SectionTitle>
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", background: "var(--bg)" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 600, color: "white" }}>KL</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--text)" }}>Kelsea Loewen</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px", fontFamily: "var(--font-mono)" }}>kelsea@repplumbing.net</div>
                  </div>
                  <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "4px", background: "rgba(242,106,27,0.1)", color: "var(--orange)" }}>Owner</span>
                </div>
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Field plumbers</SectionTitle>
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                {[
                  { initials: "JM", name: "James McKay", email: "james@repplumbing.net", avatarBg: "var(--teal)" },
                  { initials: "TR", name: "Tyler Reyes", email: "tyler@repplumbing.net", avatarBg: "#3D6480" },
                ].map((p, i, arr) => (
                  <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", background: "var(--bg)", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: p.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 600, color: "white" }}>{p.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--text)" }}>{p.name}</div>
                      <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px", fontFamily: "var(--font-mono)" }}>{p.email}</div>
                    </div>
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", padding: "2px 8px", borderRadius: "4px", background: "rgba(26,191,191,0.1)", color: "var(--teal)" }}>Active</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "groups" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Groups</h1>
            <LockedPanel icon="ti ti-users-group" title="Organise people with groups" sub="Create crews, assign plumbers, and manage access across your shop. Available with GUS Shop." />
          </div>
        )}

        {tab === "roles" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Roles & permissions</h1>
            <LockedPanel icon="ti ti-shield-lock" title="Fine-grained access control" sub="Set role-based permissions — Owner, Journeyman, Apprentice. Restrict who can approve estimates, view margins, or manage settings. Available with GUS Shop." />
          </div>
        )}

        {/* ── BILLING ── */}
        {tab === "billing" && (
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Plan & billing</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Your current plan, usage, payment method, and invoice history.</p>
            <div style={sec}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", paddingBottom: "20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "10px", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-page)", flexShrink: 0 }}>
                    <i className="ti ti-bolt" style={{ fontSize: "24px", color: "var(--orange)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 500, color: "var(--text)" }}>GUS Solo</div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>Monthly · Founding rate</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>Renews Jul 24, 2026 · Your founding rate is locked for life.</div>
                  </div>
                </div>
                <button style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", background: "var(--bg)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>Adjust plan</button>
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Payment</SectionTitle>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ background: "#1A3FA8", borderRadius: "5px", padding: "5px 8px" }}><span style={{ fontSize: "11px", fontWeight: 700, color: "white" }}>VISA</span></div>
                  <span style={{ fontSize: "14px", color: "var(--text)" }}>Visa ••••1294</span>
                </div>
                <button style={{ fontSize: "13px", fontWeight: 500, color: "var(--text)", background: "var(--bg)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Update</button>
              </div>
            </div>
            <div style={sec}>
              <SectionTitle>Invoices</SectionTitle>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Date", "Total", "Status", "Receipt"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 0", fontWeight: 500, color: "var(--text)", paddingRight: "24px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: "Jun 24, 2026", total: "CA$49.00", status: "Paid" },
                    { date: "May 24, 2026", total: "CA$49.00", status: "Paid" },
                    { date: "Apr 24, 2026", total: "CA$49.00", status: "Paid" },
                  ].map((inv, i, arr) => (
                    <tr key={inv.date} style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <td style={{ padding: "14px 0", color: "var(--text)", paddingRight: "24px" }}>{inv.date}</td>
                      <td style={{ padding: "14px 0", color: "var(--text)", paddingRight: "24px", fontFamily: "var(--font-mono)" }}>{inv.total}</td>
                      <td style={{ padding: "14px 0", color: "#34d399", paddingRight: "24px" }}>{inv.status}</td>
                      <td style={{ padding: "14px 0" }}><a href="#" style={{ color: "var(--teal)", textDecoration: "underline" }}>View</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
