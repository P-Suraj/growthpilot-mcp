export interface Company {
  id: string;
  name: string;
  location: string;
  industry: string;
  employeeCount: number;
  website: string;
  rating?: number;
}

export interface ResearchResult {
  companyId: string;
  description: string;
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
