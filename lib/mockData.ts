export type JobStatus = "Draft" | "Sent" | "Won" | "Lost";
export type JobType = "WATER_TREATMENT" | "Appliance Hookup" | "Custom job";

export type ToDo = {
  question: string;
  priority: "HIGH" | "MED" | "LOW";
  options: string[];
  answer?: string;
};

export type Assumption = {
  label: string;
  value: string;
};

export type PartItem = {
  name: string;
  sku: string;
  qty: number;
  unit: number;
};

export type PartGroup = {
  category: string;
  items: PartItem[];
};

export type Job = {
  id: string;
  jobId: string;
  status: JobStatus;
  customer: string | null;
  jobType: JobType;
  hasParts: boolean;
  hasQuote: boolean;
  value: number | null;
  closedAt: string | null;
  createdAt: string;
  description?: string;
  todos?: ToDo[];
  assumptions?: Assumption[];
  parts?: PartGroup[];
  laborRate?: number;
  laborHours?: number;
  margin?: number;
  tax?: number;
};

export const mockJobs: Job[] = [
  {
    id: "1",
    jobId: "KP-07-17-26-01",
    status: "Draft",
    customer: "Lindsay DiPietro (Copy)",
    jobType: "WATER_TREATMENT",
    hasParts: true,
    hasQuote: false,
    value: null,
    closedAt: null,
    createdAt: "Jul 17",
    description: "installing a reverse osmosis under sink",
    todos: [
      { question: "What is the incoming water pressure at the sink (psi)?", priority: "HIGH", options: ["Below 40 psi — booster pump needed", "40–80 psi — standard install", "Above 80 psi — PRV recommended", "Other"], answer: "40–80 psi — standard install" },
      { question: "Is the water source municipal or well?", priority: "HIGH", options: ["Municipal (chlorinated)", "Well water (requires pre-filter / sediment)", "Already softened", "Other"], answer: "Municipal (chlorinated)" },
      { question: "Countertop material at sink deck (affects faucet hole drilling)?", priority: "MED", options: ["Stainless steel", "Granite", "Quartz", "Laminate", "Solid surface", "Other"], answer: "Granite" },
    ],
    assumptions: [
      { label: "Install location", value: "Under kitchen sink" },
      { label: "System type", value: "4-stage RO with storage tank" },
      { label: "Drain connection", value: "Saddle clamp to existing P-trap drain" },
      { label: "Cold supply tap", value: "Standard 3/8\" compression angle stop" },
      { label: "Faucet included", value: "Air-gap faucet (bundled with RO unit)" },
      { label: "Storage tank size", value: "3.2 gal pressurized bladder" },
      { label: "Tubing spec", value: "NSF 58 polyethylene, 1/4\" OD" },
      { label: "Filter replacement", value: "Annual — not included in this quote" },
      { label: "Permit required", value: "No permit required for under-sink RO" },
    ],
    parts: [
      {
        category: "Primary Equipment",
        items: [{ name: "3M Aqua-Pro 4-Stage Under-Sink RO System (includes housing, filters, mounting bracket, air-gap faucet, and basic tubing kit)", sku: "estimate", qty: 1, unit: 320 }],
      },
      {
        category: "Supporting Systems",
        items: [
          { name: "RO Storage Tank 3.2 gal pressurized bladder tank", sku: "estimate", qty: 1, unit: 65 },
          { name: "Drain saddle clamp assembly 1-1/2\" with 1/4\" barb outlet", sku: "estimate", qty: 1, unit: 14 },
          { name: "3/8\" compression tee with 1/4\" push-connect branch (cold angle stop tap-in)", sku: "estimate", qty: 1, unit: 18 },
        ],
      },
      {
        category: "Connecting Parts and Fittings",
        items: [
          { name: "1/4\" OD NSF 58 polyethylene tubing (bulk roll, per metre)", sku: "estimate", qty: 10, unit: 1.80 },
          { name: "3/8\" OD NSF 58 polyethylene tubing (air gap drain line, per metre)", sku: "estimate", qty: 2, unit: 2.20 },
          { name: "1/4\" push-connect straight union fitting (John Guest / Watts Speedfit)", sku: "estimate", qty: 4, unit: 3.50 },
          { name: "1/4\" push-connect elbow fitting", sku: "estimate", qty: 3, unit: 3.20 },
          { name: "1/4\" x 3/8\" reducer push-connect fitting", sku: "estimate", qty: 2, unit: 4.10 },
          { name: "Tank valve 1/4\" JG push-connect ball valve", sku: "estimate", qty: 1, unit: 8.50 },
          { name: "Feed water adapter kit (includes saddle valve + compression fitting)", sku: "estimate", qty: 1, unit: 12.00 },
          { name: "1/4\" push-connect tee fitting", sku: "estimate", qty: 1, unit: 3.50 },
        ],
      },
    ],
    laborHours: 2,
  },
  { id: "2", jobId: "KP-07-15-26-01", status: "Draft", customer: null, jobType: "Appliance Hookup", hasParts: true, hasQuote: false, value: null, closedAt: null, createdAt: "Jul 15" },
  { id: "3", jobId: "KP-06-25-26-01", status: "Sent", customer: null, jobType: "Appliance Hookup", hasParts: true, hasQuote: true, value: 316, closedAt: null, createdAt: "Jul 15", laborRate: 95, laborHours: 2, margin: 25, tax: 12 },
  { id: "4", jobId: "KP-06-28-26-02", status: "Draft", customer: "new", jobType: "WATER_TREATMENT", hasParts: true, hasQuote: false, value: null, closedAt: null, createdAt: "Jul 1" },
  { id: "5", jobId: "KP-07-12-26-01", status: "Draft", customer: null, jobType: "Custom job", hasParts: false, hasQuote: false, value: null, closedAt: null, createdAt: "Jul 1" },
  { id: "6", jobId: "KP-06-28-26-01", status: "Draft", customer: null, jobType: "Custom job", hasParts: false, hasQuote: false, value: null, closedAt: null, createdAt: "Jun 28" },
  { id: "7", jobId: "KP-06-23-26-01", status: "Lost", customer: "Lindsay DiPietro", jobType: "WATER_TREATMENT", hasParts: true, hasQuote: true, value: 1288, closedAt: "Jun 24, 8:10 AM", createdAt: "Jun 23" },
  { id: "8", jobId: "KP-06-24-26-01", status: "Won", customer: "Patrick DiPietro", jobType: "Appliance Hookup", hasParts: true, hasQuote: true, value: 351, closedAt: "Jun 24, 8:09 AM", createdAt: "Jun 24" },
];

export type BusinessProfile = {
  province: import("./taxEngine").Province;
  pstRegistered: boolean;
  companyName: string;
  gstNumber: string;
};

export const mockBusinessProfile: BusinessProfile = {
  province: "BC",
  pstRegistered: true,
  companyName: "LC Plumbing Co",
  gstNumber: "715748331RT0001",
};

// ── Pricing Settings ─────────────────────────────────────────────────────────
export interface PricingSettings {
  // Display / personalisation
  displayName: string;
  theme: "light" | "dark" | "system";
  timezone: string;
  compactView: boolean;
  // Business profile
  companyName: string;
  gstNumber: string;
  phone: string;
  email: string;
  // Tax / province
  province: import("./taxEngine").Province;
  pstRegistered: boolean;
  // Rates
  journeymanRate: number;
  apprenticeRate: number;
  callOutFee: number;
  // Markup (applied to materials on estimate)
  primaryEquipmentMarkup: number;  // applied to "Primary Equipment" category
  accessoriesMarkup: number;        // applied to all other categories
  // Defaults
  quoteValidDays: number;
  paymentTerms: string;
  depositPercent: number;
  depositThreshold: number;
  includePrecautionWork: boolean;
  // Terms
  termsText: string;
  labourWarranty: string;
  partsWarranty: string;
  showWarranty: boolean;
  pricingBufferFrom: number;
  pricingBufferTo: number;
}

export const defaultPricingSettings: PricingSettings = {
  displayName: "",
  theme: "dark",
  timezone: "",
  compactView: false,
  companyName: "LC Plumbing Co",
  gstNumber: "715748331RT0001",
  phone: "778-840-1388",
  email: "kelsea@repplumbing.net",
  province: "BC",
  pstRegistered: true,
  journeymanRate: 113,
  apprenticeRate: 65,
  callOutFee: 150,
  primaryEquipmentMarkup: 30,
  accessoriesMarkup: 20,
  quoteValidDays: 30,
  paymentTerms: "Due on completion",
  depositPercent: 50,
  depositThreshold: 1000,
  includePrecautionWork: true,
  termsText: "This estimate is based on the information provided. Due to unpredictable price increases, price is valid at time of presentation, subject to possible changes from 5% to 10%. Any changes to scope, materials, or unforeseen conditions may result in additional charges. Additional work will be presented to the client for approval before continuing. Work will be scheduled upon acceptance of this estimate and a 50% deposit on equipment (if applicable and for equipment only over $1,000.00). Full payment is due upon completion of work.",
  labourWarranty: "1 year",
  partsWarranty: "Manufacturer warranty applies",
  showWarranty: true,
  pricingBufferFrom: 5,
  pricingBufferTo: 10,
};

// ── Per-job estimate overrides ────────────────────────────────────────────────
export interface EstimateOverride {
  estimateNotes: string;     // customer-facing scope (separate from internal job description)
}

const defaultEstimateOverride: EstimateOverride = {
  estimateNotes: "",
};

export function loadEstimateOverride(jobId: string): EstimateOverride {
  if (typeof window === "undefined") return defaultEstimateOverride;
  try {
    const stored = localStorage.getItem(`gus_estimate_${jobId}`);
    if (stored) return { ...defaultEstimateOverride, ...JSON.parse(stored) };
  } catch {}
  return defaultEstimateOverride;
}

export function saveEstimateOverride(jobId: string, patch: Partial<EstimateOverride>) {
  const current = loadEstimateOverride(jobId);
  localStorage.setItem(`gus_estimate_${jobId}`, JSON.stringify({ ...current, ...patch }));
}

const SETTINGS_KEY = "gus_settings";
const LOGO_KEY = "gus_logo";

export function loadLogo(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LOGO_KEY);
}
export function saveLogo(dataUrl: string) {
  localStorage.setItem(LOGO_KEY, dataUrl);
}
export function removeLogo() {
  localStorage.removeItem(LOGO_KEY);
}

export function loadPricingSettings(): PricingSettings {
  if (typeof window === "undefined") return defaultPricingSettings;
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed: any = JSON.parse(stored);
      // Migrate old field names to new ones
      if (!parsed.journeymanRate && parsed.standardLaborRate) parsed.journeymanRate = parsed.standardLaborRate;
      if (!parsed.apprenticeRate) parsed.apprenticeRate = defaultPricingSettings.apprenticeRate;
      if (!parsed.primaryEquipmentMarkup && parsed.defaultMarkup) parsed.primaryEquipmentMarkup = parsed.defaultMarkup;
      if (!parsed.accessoriesMarkup) parsed.accessoriesMarkup = defaultPricingSettings.accessoriesMarkup;
      if (!parsed.displayName) parsed.displayName = "";
      if (!parsed.theme) parsed.theme = "dark";
      if (!parsed.timezone) parsed.timezone = "";
      if (parsed.compactView === undefined) parsed.compactView = false;
      return { ...defaultPricingSettings, ...parsed };
    }
  } catch {}
  return defaultPricingSettings;
}

// ── Dynamic jobs (created at runtime) ────────────────────────────────────────
const DYNAMIC_JOBS_KEY = "gus_dynamic_jobs";

export function loadDynamicJobs(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(DYNAMIC_JOBS_KEY) || "[]");
  } catch { return []; }
}

export function saveDynamicJob(job: Job): void {
  const existing = loadDynamicJobs();
  localStorage.setItem(DYNAMIC_JOBS_KEY, JSON.stringify([job, ...existing]));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("gus-jobs-changed"));
  }
}

export function getAllJobs(): Job[] {
  return [...loadDynamicJobs(), ...mockJobs];
}

export function savePricingSettings(patch: Partial<PricingSettings>) {
  const current = loadPricingSettings();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...patch }));
  // Notify same-tab listeners (storage event only fires cross-tab)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("gus-settings-changed"));
  }
}

export const mockCustomers = [
  { id: "1", name: "Lindsay DiPietro", type: "Personal", email: "lindsaydipietro@icloud.com", phone: "778-873-2977", address: "19681 75 Ave", lastEdited: "Jun 24, 7:55 AM" },
  { id: "2", name: "Patrick DiPietro", type: "Personal", email: "patrick@example.com", phone: "778-555-0192", address: "19681 75 Ave", lastEdited: "Jun 24, 8:00 AM" },
];
