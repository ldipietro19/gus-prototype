"use client";
import { useState } from "react";

type Phase = "beta" | "ga" | "shop";
type Tab =
  | "general" | "business" | "appearance"
  | "rates" | "defaults" | "tax" | "delivery" | "terms"
  | "notifications" | "connectors"
  | "people" | "groups" | "roles"
  | "billing";

// ── Shared styles ────────────────────────────────────────────────────────────
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

function SaveBar() {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", paddingTop: "20px", marginTop: "28px", borderTop: "1px solid var(--border)" }}>
      {saved && <span style={{ fontSize: "12.5px", color: "#34d399", display: "flex", alignItems: "center", gap: "5px" }}><i className="ti ti-check" style={{ fontSize: "14px" }} /> Saved</span>}
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        style={{ background: "var(--orange)", color: "white", border: "none", borderRadius: "8px", padding: "8px 20px", fontFamily: "var(--font-sans)", fontSize: "13.5px", fontWeight: 500, cursor: "pointer" }}>
        Save changes
      </button>
    </div>
  );
}

function RateCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px" }}>
      <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{label}</span>
      <input type="number" defaultValue={value} style={{ fontSize: "18px", fontWeight: 500, border: "none", background: "none", padding: "0", height: "auto", color: "var(--text)", width: "100%", outline: "none", fontFamily: "var(--font-sans)" }} />
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
export default function SettingsPage() {
  const [phase, setPhase] = useState<Phase>("beta");
  const [tab, setTab] = useState<Tab>("business");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("dark");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    calloutWaiver: true, precautionWork: true, warranty: true,
    notifyViewed: true, notifyAccepted: true, notifyDeclined: false,
    notifyExpiry: true, weeklySummary: false, compactView: false,
  });
  const tog = (key: string) => setToggles(t => ({ ...t, [key]: !t[key] }));

  const NAV: { group: string; items: { id: Tab; label: string; icon: string; badge?: string; badgeType?: "teal" | "orange" }[] }[] = [
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
    ...( phase !== "beta" ? [{ group: "Integrations", items: [
      { id: "connectors" as Tab, label: "Connectors", icon: "ti ti-plug", badge: "GA", badgeType: "orange" as const },
    ]}] : []),
    ...( phase === "shop" ? [{ group: "Members & access", items: [
      { id: "people" as Tab, label: "People", icon: "ti ti-users", badge: "Shop", badgeType: "teal" as const },
      { id: "groups" as Tab, label: "Groups", icon: "ti ti-users-group", badge: "Shop", badgeType: "teal" as const },
      { id: "roles" as Tab, label: "Roles & permissions", icon: "ti ti-shield-check", badge: "Shop", badgeType: "teal" as const },
    ]}] : []),
    { group: "Account", items: [
      { id: "billing", label: "Plan & billing", icon: "ti ti-credit-card" },
    ]},
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>

      {/* Phase switcher */}
      <div style={{ background: "var(--bg-deep)", borderBottom: "1px solid rgba(26,191,191,0.15)", display: "flex", alignItems: "center", gap: "20px", padding: "0 24px", height: "44px", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--teal)", whiteSpace: "nowrap" }}>// prototype view</span>
        <div style={{ display: "flex", flex: 1 }}>
          {(["beta", "ga", "shop"] as Phase[]).map(p => (
            <button key={p} onClick={() => setPhase(p)} style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: phase === p ? "var(--orange)" : "var(--text-muted)", padding: "0 18px", height: "44px", display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", borderBottom: `2px solid ${phase === p ? "var(--orange)" : "transparent"}`, transition: "color 0.15s" }}>
              {p === "beta" ? "Beta · Pilot" : p === "ga" ? "GA · Solo" : "GA · Shop"}
            </button>
          ))}
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>settings evolve by phase</span>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: "224px", flexShrink: 0, padding: "28px 12px", borderRight: "1px solid var(--border)", background: "var(--sidebar-bg)", alignSelf: "flex-start", height: "calc(100vh - 44px)", overflowY: "auto", position: "sticky", top: 0 }}>
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
                  {item.badge && (
                    <span style={{ fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", background: item.badgeType === "teal" ? "rgba(26,191,191,0.1)" : "rgba(242,106,27,0.1)", color: item.badgeType === "teal" ? "var(--teal)" : "var(--orange)", border: `1px solid ${item.badgeType === "teal" ? "rgba(26,191,191,0.22)" : "rgba(242,106,27,0.22)"}`, borderRadius: "4px", padding: "1px 6px" }}>{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: "36px 40px 80px", maxWidth: "720px" }}>

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
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", lineHeight: 1.6 }}><strong style={{ color: "var(--text-secondary)" }}>System</strong> follows your device&apos;s light/dark setting and switches automatically.</p>
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
                  <RateCard label="Call-out fee" value={150} />
                  <RateCard label="Standard rate / hr" value={113} />
                  <RateCard label="Emergency rate / hr" value={210} />
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  <ToggleRow label="Allow call-out waiver" sub="Waive the call-out fee when going straight to hourly billing." on={toggles.calloutWaiver} onToggle={() => tog("calloutWaiver")} last />
                </div>
              </div>
              <div style={sec}>
                <SectionTitle>Default markup</SectionTitle>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: 1.6 }}>Applied to all materials on every estimate. Override per job anytime.</p>
                <div style={{ maxWidth: "200px" }}>
                  <RateCard label="Materials markup %" value={30} />
                </div>
              </div>
              <SaveBar />
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
                    <select style={sel}>
                      <option>7 days</option><option>14 days</option><option selected>30 days</option><option>60 days</option><option>No expiry</option>
                    </select>
                    <div style={hint}>Shown on estimate and flags expired in dashboard</div>
                  </Field>
                  <Field label="Expiry reminder">
                    <select style={sel}>
                      <option>No reminder</option><option selected>3 days before</option><option>7 days before</option><option>1 day before</option>
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
                  <Field label="Equipment deposit %"><input type="number" defaultValue={50} style={inp} /></Field>
                  <Field label="Deposit applies when equipment over">
                    <div style={{ display: "flex" }}>
                      <div style={{ background: "var(--bg-page)", border: "1px solid rgba(255,255,255,0.12)", borderRight: "none", borderRadius: "8px 0 0 8px", padding: "0 12px", fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", fontFamily: "var(--font-mono)" }}>$</div>
                      <input type="number" defaultValue={1000} style={{ ...inp, borderRadius: "0 8px 8px 0", flex: 1 }} />
                    </div>
                  </Field>
                </div>
                <Field label="Payment terms">
                  <select style={sel}>
                    <option>Due on completion</option><option>Net 7</option><option>Net 15</option><option>Net 30</option>
                  </select>
                </Field>
              </div>
              <SaveBar />
            </div>
          )}

          {/* ── TAX ── */}
          {tab === "tax" && (
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Tax</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Controls how GST and PST are applied across all estimates.</p>
              <div style={sec}>
                <SectionTitle>Setup</SectionTitle>
                <div style={row2}>
                  <Field label="Province">
                    <select style={sel}>
                      <option>British Columbia</option><option>Alberta</option><option>Ontario</option><option>Manitoba</option>
                      <option>Saskatchewan</option><option>Quebec</option><option>Nova Scotia</option><option>New Brunswick</option>
                      <option>PEI</option><option>Newfoundland & Labrador</option><option>NWT / Nunavut / Yukon</option>
                    </select>
                  </Field>
                  <Field label="PST treatment">
                    <select style={sel}>
                      <option>Not PST registered</option>
                      <option selected>PST embedded in material cost</option>
                      <option>PST registered — charge customers</option>
                    </select>
                  </Field>
                </div>
              </div>
              <div style={sec}>
                <SectionTitle>How this applies to estimates</SectionTitle>
                <div style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: "10px", padding: "14px 16px" }}>
                  <div style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>// Applied to every estimate</div>
                  {[
                    { label: "GST", rate: "5%", applies: "Labour + materials" },
                    { label: "PST", rate: "Embedded", applies: "Included in your material cost" },
                    { label: "Customer sees", rate: "GST only", applies: "One tax line on estimate" },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: "13px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{row.label}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 500, color: "var(--text)" }}>{row.rate}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{row.applies}</span>
                    </div>
                  ))}
                </div>
              </div>
              <SaveBar />
            </div>
          )}

          {/* ── DELIVERY ── */}
          {tab === "delivery" && (
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Estimate delivery</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Default email template used when sending estimates to customers. Override per estimate anytime.</p>
              <div style={sec}>
                <SectionTitle>Email template</SectionTitle>
                <Field label="Default subject line"><input type="text" defaultValue="Your estimate from Reputation Plumbing & Heating — RPH-E{number}" style={inp} /></Field>
                <Field label="Default message body">
                  <textarea rows={6} defaultValue={`Hi {customer_name},\n\nPlease find your estimate attached. This is valid for 30 days.\n\nFeel free to call or text if you have any questions.\n\nKelsea\nReputation Plumbing & Heating\n778-840-1388`}
                    style={{ ...inp, height: "auto", padding: "10px 12px", resize: "vertical" as const, lineHeight: 1.6 }} />
                </Field>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.6 }}>
                  Use <code style={{ fontFamily: "var(--font-mono)", background: "var(--bg-page)", padding: "1px 5px", borderRadius: "3px", border: "1px solid rgba(255,255,255,0.1)" }}>{"{customer_name}"}</code> and <code style={{ fontFamily: "var(--font-mono)", background: "var(--bg-page)", padding: "1px 5px", borderRadius: "3px", border: "1px solid rgba(255,255,255,0.1)" }}>{"{number}"}</code> as dynamic placeholders.
                </p>
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
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Boilerplate text that appears at the bottom of every estimate. Set it once.</p>
              <div style={sec}>
                <SectionTitle>Terms & conditions</SectionTitle>
                <div style={{ marginBottom: "16px" }}>
                  <textarea rows={6} defaultValue="This estimate is based on the information provided. Due to unpredictable price increases, price is valid at time of presentation, subject to possible changes from 5% to 10%. Any changes to scope, materials, or unforeseen conditions may result in additional charges. Additional work will be presented to the client for approval before continuing. Work will be scheduled upon acceptance of this estimate and a 50% deposit on equipment (if applicable and for equipment only over $1,000.00). Full payment is due upon completion of work."
                    style={{ ...inp, height: "auto", padding: "10px 12px", resize: "vertical" as const, lineHeight: 1.6 }} />
                </div>
                <div style={row2}>
                  <Field label="Price buffer — from %"><input type="number" defaultValue={5} style={inp} /></Field>
                  <Field label="Price buffer — to %"><input type="number" defaultValue={10} style={inp} /></Field>
                </div>
                <div style={hint}>Shown in terms as "subject to possible changes from 5% to 10%"</div>
              </div>
              <div style={sec}>
                <SectionTitle>Warranty</SectionTitle>
                <div style={row2}>
                  <Field label="Labour warranty">
                    <select style={sel}><option>1 year</option><option>2 years</option><option>90 days</option><option>No warranty</option></select>
                  </Field>
                  <Field label="Parts / equipment warranty">
                    <select style={sel}><option>Manufacturer warranty applies</option><option>1 year parts & labour</option><option>2 years parts & labour</option></select>
                  </Field>
                </div>
                <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  <ToggleRow label="Show warranty on estimate" sub="Include warranty language in the terms section of every estimate." on={toggles.warranty} onToggle={() => tog("warranty")} last />
                </div>
              </div>
              <div style={sec}>
                <SectionTitle>Additional notes <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 400 }}>optional</span></SectionTitle>
                <textarea rows={3} placeholder="Notes that appear on every estimate — e.g. parking info, site access, cancellation policy…"
                  style={{ ...inp, height: "auto", padding: "10px 12px", resize: "vertical" as const, lineHeight: 1.6 }} />
              </div>
              <SaveBar />
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Notifications</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Control when GUS sends you email alerts.</p>
              <div style={sec}>
                <SectionTitle>Estimate activity</SectionTitle>
                <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  <ToggleRow label="Estimate viewed" sub="Email me when a customer opens an estimate link for the first time." on={toggles.notifyViewed} onToggle={() => tog("notifyViewed")} />
                  <ToggleRow label="Estimate accepted" sub="Email me when a customer accepts an estimate." on={toggles.notifyAccepted} onToggle={() => tog("notifyAccepted")} />
                  <ToggleRow label="Estimate declined" sub="Email me when a customer declines or marks an estimate as not proceeding." on={toggles.notifyDeclined} onToggle={() => tog("notifyDeclined")} last />
                </div>
              </div>
              <div style={sec}>
                <SectionTitle>Reminders</SectionTitle>
                <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  <ToggleRow label="Estimate expiry reminder" sub="Alert me before an estimate expires with no response. Configure timing in Estimates settings." on={toggles.notifyExpiry} onToggle={() => tog("notifyExpiry")} />
                  <ToggleRow label="Weekly summary" sub="Monday digest — estimates sent, accepted, and pending that week." on={toggles.weeklySummary} onToggle={() => tog("weeklySummary")} last />
                </div>
              </div>
              <div style={sec}>
                <SectionTitle>Notification email</SectionTitle>
                <Field label="Send alerts to"><input type="email" defaultValue="kelsea@reputationplumbing.ca" style={inp} /></Field>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px", lineHeight: 1.6 }}>Can be different from your login email — useful for a shared inbox.</p>
              </div>
              <SaveBar />
            </div>
          )}

          {/* ── CONNECTORS (GA+) ── */}
          {tab === "connectors" && (
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Connectors</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Connect GUS to your existing tools. Integrations sync job data, invoices, and payments automatically.</p>
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
                    <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 700, color: "white", letterSpacing: "0.04em" }}>{c.abbr}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text)" }}>{c.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", lineHeight: 1.5 }}>{c.desc}</div>
                    </div>
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", background: "var(--bg-page)", color: "var(--text-muted)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "4px", padding: "1px 6px" }}>Coming soon</span>
                    <button disabled style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--text-muted)", background: "var(--bg-page)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "7px", padding: "7px 14px", cursor: "not-allowed", fontFamily: "var(--font-mono)" }}>Connect</button>
                  </div>
                ))}
              </div>
              <div style={sec}>
                <SectionTitle>Request an integration</SectionTitle>
                <Field label="What tool would you like GUS to connect with?">
                  <input type="text" placeholder="e.g. ServiceTitan, Xero, Square…" style={inp} />
                </Field>
                <button style={{ marginTop: "8px", fontSize: "13px", fontWeight: 500, color: "var(--text)", background: "var(--bg)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Submit request</button>
              </div>
            </div>
          )}

          {/* ── PEOPLE (Shop) ── */}
          {tab === "people" && (
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>People</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Everyone with access to GUS at your shop. Each person gets their own login and estimate history.</p>
              <div style={sec}>
                <SectionTitle>Owner</SectionTitle>
                <div style={{ border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
                  {[{ initials: "KL", name: "Kelsea Loewen", email: "kelsea@repplumbing.net", status: "Owner", statusType: "owner" as const, avatarBg: "var(--orange)" }].map(p => (
                    <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", background: "var(--bg)" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: p.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 600, color: "white", letterSpacing: "0.04em" }}>{p.initials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--text)" }}>{p.name}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px", fontFamily: "var(--font-mono)" }}>{p.email}</div>
                      </div>
                      <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "4px", background: "rgba(242,106,27,0.1)", color: "var(--orange)" }}>Owner</span>
                    </div>
                  ))}
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
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: p.avatarBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "11px", fontWeight: 600, color: "white", letterSpacing: "0.04em" }}>{p.initials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "13.5px", fontWeight: 500, color: "var(--text)" }}>{p.name}</div>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px", fontFamily: "var(--font-mono)" }}>{p.email}</div>
                      </div>
                      <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: "4px", background: "rgba(26,191,191,0.1)", color: "var(--teal)" }}>Active</span>
                    </div>
                  ))}
                </div>
                <button style={{ marginTop: "10px", fontSize: "13px", fontWeight: 500, color: "var(--teal)", background: "rgba(26,191,191,0.07)", border: "1px solid rgba(26,191,191,0.2)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <i className="ti ti-user-plus" style={{ fontSize: "15px" }} /> Invite team member
                </button>
              </div>
            </div>
          )}

          {/* ── GROUPS (Shop, locked) ── */}
          {tab === "groups" && (
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Groups</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Organise your plumbers into groups for easier job assignment and reporting.</p>
              <LockedPanel icon="ti ti-users-group" title="Organise people with groups" sub="Create crews, assign plumbers, and manage access across your shop. Available with GUS Shop." />
            </div>
          )}

          {/* ── ROLES (Shop, locked) ── */}
          {tab === "roles" && (
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 500, color: "var(--text)", marginBottom: "6px" }}>Roles & permissions</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.6 }}>Control what each person on your team can see and do in GUS.</p>
              <LockedPanel icon="ti ti-shield-lock" title="Fine-grained access control" sub="Set role-based permissions — Owner, Journeyman, Apprentice. Restrict who can approve estimates, view margins, or manage settings. Available with GUS Shop." />
            </div>
          )}

          {/* ── PLAN & BILLING ── */}
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
                    <div style={{ background: "#1A3FA8", borderRadius: "5px", padding: "5px 8px" }}><span style={{ fontSize: "11px", fontWeight: 700, color: "white", letterSpacing: "0.04em" }}>VISA</span></div>
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

              <div style={sec}>
                <SectionTitle>Danger zone</SectionTitle>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
                  <div>
                    <div style={{ fontSize: "14px", color: "var(--text)" }}>Cancel plan</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>You&apos;ll keep access until Jul 24, 2026. Your founding rate cannot be recovered after cancellation.</div>
                  </div>
                  <button style={{ fontSize: "13px", fontWeight: 500, color: "white", background: "#C0392B", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
