export interface Company {
  id: string;
  name: string;
  location: string;
  industry: string;
  employeeCount: number;
  address?: string | null;
  placeId?: string | null;
  website?: string | null;
  phone?: string | null;
  rating?: number | null;
  /** Raw Google Places `types` array, e.g. ["electronics_store", "store"] */
  categories?: string[] | null;
  source?: string | null;
  confidence?: number | null;
}

/**
 * Structured search specification produced by the Planner.
 * Used by Discovery to build precise Google Places queries.
 */
export interface CampaignSearchSpec {
  /** Human-readable product/service being sold, e.g. "Laptops" */
  product: string;
  /** Target industry label, e.g. "Electronics" */
  industry: string;
  /** Google Places primary type filter, e.g. "electronics_store" */
  googlePlaceType: string;
  /** Alternative textual search queries to try, e.g. ["Computer Store", "Laptop Dealer"] */
  targetBusinesses: string[];
  /** City name only, used for text query and geocoding */
  city: string;
  /** State / region hint for geocoding, e.g. "Kerala" */
  state: string;
  /** Search radius in metres (default 20 000) */
  radiusMeters: number;
  /** Business name words / phrases that indicate a WRONG match, e.g. ["Fashion", "Repair"] */
  rejectKeywords: string[];
  /** Google Place types that should be rejected immediately, e.g. ["clothing_store"] */
  rejectPlaceTypes: string[];
}

export interface Campaign {
  id: string;
  goal: string;
  createdAt: string;
  // Legacy flat fields (kept for backward-compat with heuristic provider etc.)
  targetIndustry?: string;
  targetLocation?: string;
  minEmployees?: number;
  maxEmployees?: number;
  // Structured spec produced by the new Planner — may be undefined for old-style campaigns
  searchSpec?: CampaignSearchSpec;
}

/** Result of the lightweight Validator stage, run BEFORE Tavily Research. */
export interface ValidationResult {
  /** Whether this company passed validation */
  isValid: boolean;
  /** Confidence that the business is relevant (0–1) */
  confidence: number;
  /** Human-readable reason for rejection (if isValid is false) */
  reason?: string;
}

export interface NormalizedField<T> {
  value: T | null;
  source: string | null;
  confidence: number | null;
}

export interface ResearchResult {
  companyId: string;
  
  // Flat fields for backward compatibility (downstream modules)
  website: string;
  description: string;
  industry: string;
  employeeCount: number;
  confidence: number; // 0 to 1

  // Rich normalized fields for future AI reasoning
  normalized?: {
    website: NormalizedField<string>;
    description: NormalizedField<string>;
    summary: NormalizedField<string>;
    industry: NormalizedField<string>;
    companyType: NormalizedField<string>;
    socialLinks: NormalizedField<Record<string, string>>;
    confidence: NormalizedField<number>;
    timestamp: NormalizedField<string>;
  };
}

export interface QualificationScore {
  companyId: string;
  score: number; // 0 to 1
  tier: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

export interface Draft {
  companyId: string;
  emailSubject: string;
  emailBody: string;
  version: number;
}

export interface Critique {
  companyId: string;
  score: number; // 0 to 1
  issues: string[];
  suggestions: string[];
}
