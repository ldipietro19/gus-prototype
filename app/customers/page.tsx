"use client";

import { mockCustomers } from "@/lib/mockData";

export default function CustomersPage() {
  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
        <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "28px", letterSpacing: "0.06em", color: "var(--text)" }}>Customers</h1>
        <button style={{ background: "var(--orange)", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Create Customer</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["CUSTOMER", "TYPE", "EMAIL", "PHONE", "ADDRESS", "LAST EDITED"].map(h => (
              <th key={h} style={{
                textAlign: "left",
                padding: "9px 16px",
                fontSize: "10px",
                fontWeight: 500,
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockCustomers.map(c => (
            <tr key={c.id}
              style={{ borderBottom: "1px solid var(--border-light)", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text)" }}>{c.name}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.type}</td>
              <td style={{ padding: "12px 16px", color: "var(--teal)", fontSize: "13px" }}>{c.email}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.phone}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.address}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>{c.lastEdited}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
