// GUS Tax Calculation Engine — Provincial Tax Spec v2
// Implements Rules A–E for all Canadian provinces
//
// Key sources:
//   BC:  gov.bc.ca/taxes/sales-taxes/pst/charge-collect/pst-real-property-contractors
//   MB:  gov.mb.ca/finance/taxation/pubs/bulletins/031.pdf  (M&E Bulletin)
//   SK:  sets.saskatchewan.ca PST-12 (Services to Real Property)
//   QC:  revenuquebec.ca GST/HST and QST
//   ON/Atlantic: CRA HST rates

export type Province =
  | "BC" | "AB" | "SK" | "MB" | "ON" | "QC"
  | "NB" | "NS" | "NL" | "PE" | "NT" | "NU" | "YT";

export type TaxLine = {
  name: string;         // "GST", "PST", "HST", "RST", "QST"
  rate: number;         // decimal: 0.05, 0.07, etc.
  base: number;         // dollar amount the rate is applied to
  appliesTo: "full" | "materials"; // drives label formatting
  amount: number;       // base × rate, rounded to 2dp
};

export type TaxResult = {
  lines: TaxLine[];
  totalTax: number;
};

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate provincial tax for a GUS quote.
 *
 * @param province         Province code from business profile
 * @param materialsSubtotal Materials cost including markup
 * @param labourSubtotal   Labour cost (rate × hours + call-out)
 * @param disposalSubtotal Disposal / removal cost (default 0)
 */
export function calculateTax(
  province: Province,
  materialsSubtotal: number,
  labourSubtotal: number,
  disposalSubtotal = 0
): TaxResult {
  const full = r2(materialsSubtotal + labourSubtotal + disposalSubtotal);

  switch (province) {
    // ── Rule A: GST only (AB, NT, NU, YT) ───────────────────────
    case "AB":
    case "NT":
    case "NU":
    case "YT": {
      const gst = r2(full * 0.05);
      return {
        lines: [{ name: "GST", rate: 0.05, base: full, appliesTo: "full", amount: gst }],
        totalTax: gst,
      };
    }

    // ── Rule B: GST only (BC) ───────────────────────────────────
    // BC real property contractors (plumbing explicitly listed by BC gov):
    // Services to real property are NOT subject to PST. The contractor pays
    // PST when buying materials; that cost is baked into pricing. Customer
    // pays GST only on the full invoice. Applies to both T&M and lump-sum.
    // Source: gov.bc.ca/taxes/sales-taxes/pst/charge-collect/pst-real-property-contractors/contractors-charging-pst
    case "BC": {
      const gst = r2(full * 0.05);
      return {
        lines: [{ name: "GST", rate: 0.05, base: full, appliesTo: "full", amount: gst }],
        totalTax: gst,
      };
    }

    // ── Rule B2: GST + RST on full subtotal (MB) ─────────────────
    // Manitoba M&E trades (plumbing explicitly listed in Bulletin 031):
    // RST 7% applies to the TOTAL billing — labour AND materials.
    // M&E contractors purchase materials RST-exempt, then charge RST on full invoice.
    case "MB": {
      const gst = r2(full * 0.05);
      const rst = r2(full * 0.07);
      return {
        lines: [
          { name: "GST", rate: 0.05, base: full, appliesTo: "full", amount: gst },
          { name: "RST", rate: 0.07, base: full, appliesTo: "full", amount: rst },
        ],
        totalTax: r2(gst + rst),
      };
    }

    // ── Rule C: GST + PST on full subtotal (SK) ─────────────────
    case "SK": {
      const gst = r2(full * 0.05);
      const pst = r2(full * 0.06);
      return {
        lines: [
          { name: "GST", rate: 0.05, base: full, appliesTo: "full", amount: gst },
          { name: "PST", rate: 0.06, base: full, appliesTo: "full", amount: pst },
        ],
        totalTax: r2(gst + pst),
      };
    }

    // ── Rule D: HST on full subtotal (ON, NB, NS, NL, PEI) ──────
    case "ON": {
      const hst = r2(full * 0.13);
      return {
        lines: [{ name: "HST", rate: 0.13, base: full, appliesTo: "full", amount: hst }],
        totalTax: hst,
      };
    }

    case "NB":
    case "NL":
    case "PE": {
      const hst = r2(full * 0.15);
      return {
        lines: [{ name: "HST", rate: 0.15, base: full, appliesTo: "full", amount: hst }],
        totalTax: hst,
      };
    }

    // ── Rule D2: HST 14% (NS) — rate reduced April 1, 2025 ──────
    case "NS": {
      const hst = r2(full * 0.14);
      return {
        lines: [{ name: "HST", rate: 0.14, base: full, appliesTo: "full", amount: hst }],
        totalTax: hst,
      };
    }

    // ── Rule E: GST + QST on full subtotal (QC) ─────────────────
    case "QC": {
      const gst = r2(full * 0.05);
      const qst = r2(full * 0.09975);
      return {
        lines: [
          { name: "GST", rate: 0.05, base: full, appliesTo: "full", amount: gst },
          { name: "QST", rate: 0.09975, base: full, appliesTo: "full", amount: qst },
        ],
        totalTax: r2(gst + qst),
      };
    }

    default:
      return { lines: [], totalTax: 0 };
  }
}

/** Format a tax line label as it appears on a customer quote */
export function formatTaxLabel(line: TaxLine): string {
  const raw = line.rate * 100;
  const pct = Number.isInteger(raw) ? `${raw}%` : `${raw.toFixed(3).replace(/\.?0+$/, "")}%`;

  if (line.appliesTo === "materials") {
    return `${line.name} (${pct} on materials: $${line.base.toFixed(2)})`;
  }
  return `${line.name} (${pct})`;
}

/** Provinces that require PST/QST registration to collect from customers */
// Note: BC is NOT included — BC plumbers pay PST at purchase, never charge customers
export const PST_PROVINCES: Province[] = ["MB", "SK", "QC"];

export const PROVINCE_NAMES: Record<Province, string> = {
  BC: "British Columbia", AB: "Alberta", SK: "Saskatchewan", MB: "Manitoba",
  ON: "Ontario", QC: "Quebec", NB: "New Brunswick", NS: "Nova Scotia",
  NL: "Newfoundland & Labrador", PE: "Prince Edward Island",
  NT: "Northwest Territories", NU: "Nunavut", YT: "Yukon",
};
