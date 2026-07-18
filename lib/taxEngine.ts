// GUS Tax Calculation Engine — Provincial Tax Spec v1
// Implements Rules A–E for all Canadian provinces

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

    // ── Rule B: GST + PST/RST on materials only (BC, MB) ────────
    case "BC": {
      const gst = r2(full * 0.05);
      const pst = r2(materialsSubtotal * 0.07);
      return {
        lines: [
          { name: "GST", rate: 0.05, base: full, appliesTo: "full", amount: gst },
          { name: "PST", rate: 0.07, base: materialsSubtotal, appliesTo: "materials", amount: pst },
        ],
        totalTax: r2(gst + pst),
      };
    }

    case "MB": {
      const gst = r2(full * 0.05);
      const rst = r2(materialsSubtotal * 0.07);
      return {
        lines: [
          { name: "GST", rate: 0.05, base: full, appliesTo: "full", amount: gst },
          { name: "RST", rate: 0.07, base: materialsSubtotal, appliesTo: "materials", amount: rst },
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
    case "NS":
    case "NL":
    case "PE": {
      const hst = r2(full * 0.15);
      return {
        lines: [{ name: "HST", rate: 0.15, base: full, appliesTo: "full", amount: hst }],
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
export const PST_PROVINCES: Province[] = ["BC", "MB", "SK", "QC"];

export const PROVINCE_NAMES: Record<Province, string> = {
  BC: "British Columbia", AB: "Alberta", SK: "Saskatchewan", MB: "Manitoba",
  ON: "Ontario", QC: "Quebec", NB: "New Brunswick", NS: "Nova Scotia",
  NL: "Newfoundland & Labrador", PE: "Prince Edward Island",
  NT: "Northwest Territories", NU: "Nunavut", YT: "Yukon",
};
