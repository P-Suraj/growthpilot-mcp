import { Injectable } from '@nitrostack/core';
import { DraftProvider } from './draft.provider.js';
import { LLMProvider } from '../../../core/ai/llm.provider.js';
import { Company, ResearchResult, QualificationScore, Draft } from '../../shared/models.js';
import { buildDraftPrompt, parseAIResponse } from '../../../core/ai/llm.utils.js';
import { DraftResult } from '../../../core/ai/llm.types.js';

@Injectable()
export class LLMDraftProvider extends DraftProvider {
  readonly name = 'llm';

  constructor(private readonly llm: LLMProvider) {
    super();
  }

  async generateDraft(company: Company, research: ResearchResult, score: QualificationScore, goal: string): Promise<Draft> {
    const { system, user } = buildDraftPrompt(company, research, score, goal);
    const responseText = await this.llm.generate(system, user, {
      responseSchema: {
        type: 'OBJECT',
        properties: {
          emailSubject: { type: 'STRING' },
          emailBody: { type: 'STRING' },
          personalizedHooks: { type: 'ARRAY', items: { type: 'STRING' } },
          callToAction: { type: 'STRING' }
        },
        required: ['emailSubject', 'emailBody', 'personalizedHooks', 'callToAction']
      }
    });

    const result = parseAIResponse<DraftResult>(responseText);
    return {
      companyId: company.id,
      emailSubject: result.emailSubject,
      emailBody: result.emailBody,
      version: 1
    };
  }
}
