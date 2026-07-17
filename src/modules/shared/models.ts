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
  categories?: string[] | null;
  source?: string | null;
  confidence?: number | null;
}

export interface Campaign {
  id: string;
  goal: string;
  createdAt: string;
  targetIndustry?: string;
  targetLocation?: string;
  minEmployees?: number;
  maxEmployees?: number;
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
