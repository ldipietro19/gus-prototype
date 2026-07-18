"use client";
import { useState } from "react";

const CATALOG = [
  { name: "3M Aqua-Pro 4-Stage Under-Sink RO System", sku: "3M-AP4-RO", brand: "3M", price: 320.00 },
  { name: "RO Storage Tank 3.2 gal pressurized bladder tank", sku: "ROT-32-BL", brand: "Watts", price: 65.00 },
  { name: "Drain saddle clamp assembly 1-1/2\" with 1/4\" barb outlet", sku: "DSC-112-14", brand: "Watts", price: 14.00 },
  { name: "1/4\" OD NSF 58 polyethylene tubing (per metre)", sku: "TUB-14-NSF58", brand: "John Guest", price: 1.80 },
  { name: "1/4\" push-connect straight union fitting", sku: "JG-SU-14", brand: "John Guest", price: 3.50 },
  { name: "Water pressure reducing valve 3/4\"", sku: "PRV-34-WTS", brand: "Watts", price: 42.00 },
  { name: "Booster pump 1/4\" push-connect", sku: "BP-14-PC", brand: "Shurflo", price: 89.00 },
];

export default function PartsPage() {
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState(false);
  const results = CATALOG.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div style={{ padding: "11px 24px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: "15px", fontWeight: 600 }}>Parts</h1>
      </div>
      <div style={{ padding: "24px" }}>
        <input type="text" placeholder="Search the Sheret catalog..." value={search}
          onChange={e => { setSearch(e.target.value); setSearched(true); }}
          style={{ width: "360px", padding: "9px 14px", border: "2px solid var(--blue)", borderRadius: "8px", fontSize: "14px", outline: "none" }} />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginTop: "16px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["PART", "SKU", "BRAND", "PRICE"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!searched ? (
              <tr><td colSpan={4}><div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "48px", textAlign: "center", color: "var(--text-secondary)", margin: "16px 0", fontSize: "14px" }}>Search the Sheret catalog to browse parts.</div></td></tr>
            ) : results.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>No parts found.</td></tr>
            ) : results.map((p, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border-light)", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f9fafb"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <td style={{ padding: "12px 12px" }}>{p.name}</td>
                <td style={{ padding: "12px 12px", color: "var(--text-muted)", fontSize: "12px" }}>{p.sku}</td>
                <td style={{ padding: "12px 12px", color: "var(--text-secondary)" }}>{p.brand}</td>
                <td style={{ padding: "12px 12px", fontWeight: 500 }}>${p.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
