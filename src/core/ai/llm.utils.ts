import { Campaign, Company, ResearchResult, QualificationScore, Draft } from '../../modules/shared/models.js';

export class AIParserError extends Error {
  constructor(message: string, public readonly rawText: string) {
    super(message);
    this.name = 'AIParserError';
  }
}

/**
 * Strips markdown code blocks and parses LLM output as JSON.
 */
export function parseAIResponse<T>(text: string): T {
  let cleanText = text.trim();
  
  // Strip markdown code fences if present (e.g. ```json ... ```)
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
  }

  try {
    return JSON.parse(cleanText) as T;
  } catch (error: any) {
    throw new AIParserError(`Failed to parse LLM response as JSON: ${error.message}`, text);
  }
}

/**
 * Builds prompt for Qualification.
 */
export function buildQualificationPrompt(campaign: Campaign, company: Company, research: ResearchResult): { system: string; user: string } {
  const system = `You are an elite B2B Lead Qualification AI. Your task is to evaluate the fit between a company profile and a campaign goal.
You must return a raw JSON object matching the following structure:
{
  "overallScore": number (0-100),
  "tier": "High" | "Medium" | "Low",
  "confidence": number (0.0-1.0),
  "reasoning": string[],
  "subScores": {
    "industryMatch": number (0-100),
    "locationMatch": number (0-100),
    "companySize": number (0-100),
    "websiteQuality": number (0-100),
    "digitalPresence": number (0-100),
    "businessFit": number (0-100)
  }
}
Do NOT output any conversational text or markdown wrap other than JSON.`;

  const user = `Campaign Goal: "${campaign.goal}"
Target Location: "${campaign.targetLocation || 'Any'}"
Target Industry: "${campaign.targetIndustry || 'Any'}"
Employee Range: ${campaign.minEmployees ?? 0} to ${campaign.maxEmployees ?? 1000}

Company Name: "${company.name}"
Company Location: "${company.location}"
Company Industry: "${company.industry}"
Employee Count: ${company.employeeCount}
Website: "${research.website || 'N/A'}"
Description: "${research.description || 'N/A'}"`;

  return { system, user };
}

/**
 * Builds prompt for Draft email generation.
 */
export function buildDraftPrompt(company: Company, research: ResearchResult, score: QualificationScore, goal: string): { system: string; user: string } {
  const system = `You are a professional B2B Outreach Writer. Write a personalized, short, and conversion-focused outreach email.
Return a raw JSON object matching the following structure:
{
  "emailSubject": "Subject line",
  "emailBody": "Email body text (use real signatures/names, no placeholder brackets)",
  "personalizedHooks": ["Hook description used"],
  "callToAction": "Clear call to action"
}
Constraints:
- Email must be short, under 150 words.
- Professional yet warm tone.
- Never use placeholder brackets like [Your Name] or [Name]. Signature should be "Suraj from GrowthPilot". greeting should be "Hi the team" or specific names.
Do NOT output conversational text.`;

  const user = `Campaign Product/Goal: "${goal}"
Target Company: "${company.name}"
Company Details: "${research.description}"
Website: "${research.website}"
Qualification Reasoning: "${score.reasoning}"`;

  return { system, user };
}

/**
 * Builds prompt for Critic review.
 */
export function buildCriticPrompt(draft: Draft): { system: string; user: string } {
  const system = `You are an elite Email Critic. Evaluate the quality of the B2B outreach email draft.
Review the draft for unresolved placeholders, tone, length, specificity, grammar, hallucination risk, and CTA quality.
Return a raw JSON object matching this structure:
{
  "score": number (0-100),
  "isApproved": boolean (true if score >= 80, otherwise false),
  "issues": [
    {
      "type": "tone" | "specificity" | "length" | "personalization" | "grammar" | "hallucination" | "cta",
      "severity": "low" | "medium" | "high",
      "description": "Explanation of the issue"
    }
  ],
  "suggestions": string[]
}
Do NOT output conversational text.`;

  const user = `Draft Subject: "${draft.emailSubject}"
Draft Body:
"""
${draft.emailBody}
"""`;

  return { system, user };
}
