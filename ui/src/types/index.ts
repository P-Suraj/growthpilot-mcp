/** ====== Search scope ====== */
export type SearchScope = 'nearby' | 'city' | 'state' | 'country';

/** Outreach settings defined once per campaign */
export interface OutreachSettings {
  objective: 'sell_software' | 'schedule_demo' | 'book_meeting' | 'distributor' | 'partnership' | 'other';
  tone: 'professional' | 'friendly' | 'executive' | 'short';
  cta: 'book_meeting' | 'reply' | 'schedule_demo' | 'call_me';
  /** User-written template with {{company_name}}, {{industry}} etc. */
  template: string;
}

/** User-editable campaign configuration shown in the Review step */
export interface CampaignConfig {
  // Core — always visible
  product: string;
  industry: string;
  targetCustomer: string;
  searchScope: SearchScope;

  // Scope-specific location fields
  city?: string;
  radiusKm: number;
  state?: string;
  country?: string;

  // Outreach
  outreach: OutreachSettings;

  // Advanced (collapsed by default)
  minEmployees: number;
  maxEmployees: number;
  minRating: number;
  requireWebsite: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  excludedCategories: string;
  numberOfLeads: number;
  strictMatching: boolean;
}

/** Live per-stage progress counters fed to PipelineTimeline */
export interface PipelineMeta {
  businessesFound: number;
  businessesValidated: number;
  businessesRejected: number;
  researched: number;
  qualified: number;
  drafted: number;
  // Live sub-counters (for "7 / 18 companies" display)
  researchTotal: number;
  qualifyTotal: number;
  draftTotal: number;
  criticDone: number;
  criticTotal: number;
}

export interface Company {
  id: string;
  name: string;
  location: string;
  industry: string;
  employeeCount: number;
  website: string;
  /** Verified contact email if found */
  email?: string;
  phone?: string;
  rating?: number;
  /** Raw Google Place types e.g. ["electronics_store","store"] */
  categories?: string[];
  /** Validator confidence 0-1 */
  validationConfidence?: number;
  /** Why the validator accepted this business */
  validationReason?: string;
  /** Distance from search centre in km (if geocoded) */
  distanceKm?: number;
  address?: string;
}

export interface ResearchResult {
  companyId: string;
  description: string;
  /** 3-5 bullet points */
  bullets?: string[];
  website?: string;
  socialLinks: Record<string, string>;
  newsMentions: { title: string; url: string; date: string }[];
  dataSources: string[];
}

export interface QualificationScore {
  companyId: string;
  score: number; // 0.0 to 1.0
  tier: 'HIGH' | 'MEDIUM' | 'LOW' | 'BORDERLINE';
  reasoning: string;
  confidence: number;
  signals: { name: string; value: string; weight: number; contribution: number }[];
}

export interface Draft {
  companyId: string;
  version: number;
  subject: string;
  body: string;
}

export interface Critique {
  score: number;
  approved: boolean;
  issues: { category: string; severity: 'high' | 'medium' | 'low'; description: string }[];
  suggestions: string[];
}

export interface LogMessage {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  module: 'planner' | 'discovery' | 'research' | 'qualification' | 'draft' | 'critic';
  message: string;
}
