import { Injectable } from '@nitrostack/core';
import { QualificationProvider } from './qualification.provider.js';
import { LLMProvider } from '../../../core/ai/llm.provider.js';
import { Company, ResearchResult, QualificationScore, Campaign } from '../../shared/models.js';
import { buildQualificationPrompt, parseAIResponse } from '../../../core/ai/llm.utils.js';
import { QualificationResult } from '../../../core/ai/llm.types.js';

@Injectable()
export class LLMQualificationProvider extends QualificationProvider {
  readonly name = 'llm';

  constructor(
    private readonly llm: LLMProvider
  ) {
    super();
  }

  async qualify(company: Company, research: ResearchResult, campaign: Campaign): Promise<QualificationScore> {
    const { system, user } = buildQualificationPrompt(campaign, company, research);

    // Call the generic LLM generation with schema details
    const responseText = await this.llm.generate(system, user, {
      responseSchema: {
        type: 'OBJECT',
        properties: {
          overallScore: { type: 'INTEGER' },
          tier: { type: 'STRING', enum: ['High', 'Medium', 'Low'] },
          confidence: { type: 'NUMBER' },
          reasoning: { type: 'ARRAY', items: { type: 'STRING' } },
          subScores: {
            type: 'OBJECT',
            properties: {
              industryMatch: { type: 'INTEGER' },
              locationMatch: { type: 'INTEGER' },
              companySize: { type: 'INTEGER' },
              websiteQuality: { type: 'INTEGER' },
              digitalPresence: { type: 'INTEGER' },
              businessFit: { type: 'INTEGER' }
            },
            required: ['industryMatch', 'locationMatch', 'companySize', 'websiteQuality', 'digitalPresence', 'businessFit']
          }
        },
        required: ['overallScore', 'tier', 'confidence', 'reasoning', 'subScores']
      }
    });

    const result = parseAIResponse<QualificationResult>(responseText);

    return {
      companyId: company.id,
      score: result.overallScore / 100, // Normalize to 0.0 - 1.0 range
      tier: result.tier,
      reasoning: result.reasoning.join('; '),
    };
  }
}
