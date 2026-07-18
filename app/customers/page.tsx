"use client";
import { mockCustomers } from "@/lib/mockData";

export default function CustomersPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 24px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "15px", fontWeight: 600 }}>Customers</h1>
        <button style={{ background: "var(--orange)", color: "#fff", border: "none", borderRadius: "8px", padding: "7px 16px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Create Customer</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["CUSTOMER", "TYPE", "EMAIL", "PHONE", "ADDRESS", "LAST EDITED"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockCustomers.map(c => (
            <tr key={c.id} style={{ borderBottom: "1px solid var(--border-light)", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
              <td style={{ padding: "12px 16px", fontWeight: 600 }}>{c.name}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.type}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.email}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.phone}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.address}</td>
              <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{c.lastEdited}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
