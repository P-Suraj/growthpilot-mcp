import { Injectable } from '@nitrostack/core';
import { DraftProvider } from './draft.provider.js';
import { Company, ResearchResult, QualificationScore, Draft } from '../../shared/models.js';

@Injectable()
export class MockDraftProvider extends DraftProvider {
  readonly name = 'mock';

  async generateDraft(company: Company, research: ResearchResult, score: QualificationScore, goal: string): Promise<Draft> {
    const subject = `Partnership opportunity for ${company.name} around ${research.industry}`;
    const body = `Hi Team at ${company.name},\n\n` +
      `I came across ${company.name} while researching ${research.industry} companies in ${company.location}. ` +
      `We noticed that you are doing great work with your team of ${company.employeeCount} people.\n\n` +
      `Based on our analysis, we believe your focus matches our goal: "${goal}". ` +
      `Specifically, your business description matches our target profile: "${research.description}".\n\n` +
      `Would you be open to a brief call next week to discuss how we might collaborate?\n\n` +
      `Best regards,\nGrowthPilot Team`;

    return {
      companyId: company.id,
      emailSubject: subject,
      emailBody: body,
      version: 1,
    };
  }
}
