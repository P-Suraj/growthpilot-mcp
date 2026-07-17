import { Injectable } from '@nitrostack/core';
import { ResearchProvider } from './research.provider.js';
import { Company, ResearchResult } from '../../shared/models.js';

@Injectable()
export class MockProvider extends ResearchProvider {
  readonly name = 'mock';

  async research(company: Company): Promise<ResearchResult> {
    const domain = company.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.io';
    const website = `https://www.${domain}`;
    const description = `A leading company specializing in ${company.industry} solutions based in ${company.location}, operating with ${company.employeeCount} team members.`;
    const summary = `${company.name} is a key player in the ${company.industry} sector in ${company.location}.`;
    const timestamp = new Date().toISOString();

    return {
      companyId: company.id,
      website,
      description,
      industry: company.industry,
      employeeCount: company.employeeCount,
      confidence: 0.95,
      normalized: {
        website: { value: website, source: 'mock', confidence: 0.95 },
        description: { value: description, source: 'mock', confidence: 0.95 },
        summary: { value: summary, source: 'mock', confidence: 0.95 },
        industry: { value: company.industry, source: 'mock', confidence: 0.95 },
        companyType: { value: 'Private', source: 'mock', confidence: 0.95 },
        socialLinks: {
          value: {
            linkedin: `https://www.linkedin.com/company/${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          },
          source: 'mock',
          confidence: 0.9,
        },
        confidence: { value: 0.95, source: 'mock', confidence: 1.0 },
        timestamp: { value: timestamp, source: 'mock', confidence: 1.0 },
      },
    };
  }
}
