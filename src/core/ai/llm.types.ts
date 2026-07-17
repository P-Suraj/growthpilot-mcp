export interface QualificationResult {
  overallScore: number; // 0-100
  tier: 'High' | 'Medium' | 'Low';
  confidence: number; // 0-1
  reasoning: string[];
  subScores: {
    industryMatch: number;
    locationMatch: number;
    companySize: number;
    websiteQuality: number;
    digitalPresence: number;
    businessFit: number;
  };
}

export interface DraftResult {
  emailSubject: string;
  emailBody: string;
  personalizedHooks: string[];
  callToAction: string;
}

export interface CriticResult {
  score: number; // 0-100
  isApproved: boolean;
  issues: {
    type: 'tone' | 'specificity' | 'length' | 'personalization' | 'grammar' | 'hallucination' | 'cta';
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  suggestions: string[];
}

export interface LLMGenerateOptions {
  responseSchema?: any;
}
