import { Injectable } from '@nitrostack/core';
import { CriticProvider } from './critic.provider.js';
import { LLMProvider } from '../../../core/ai/llm.provider.js';
import { Draft, Critique } from '../../shared/models.js';
import { buildCriticPrompt, parseAIResponse } from '../../../core/ai/llm.utils.js';
import { CriticResult } from '../../../core/ai/llm.types.js';

@Injectable()
export class LLMCriticProvider extends CriticProvider {
  readonly name = 'llm';

  constructor(private readonly llm: LLMProvider) {
    super();
  }

  async critique(draft: Draft): Promise<Critique> {
    const { system, user } = buildCriticPrompt(draft);
    const responseText = await this.llm.generate(system, user, {
      responseSchema: {
        type: 'OBJECT',
        properties: {
          score: { type: 'INTEGER' },
          isApproved: { type: 'BOOLEAN' },
          issues: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                type: { type: 'STRING', enum: ['tone', 'specificity', 'length', 'personalization', 'grammar', 'hallucination', 'cta'] },
                severity: { type: 'STRING', enum: ['low', 'medium', 'high'] },
                description: { type: 'STRING' }
              },
              required: ['type', 'severity', 'description']
            }
          },
          suggestions: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['score', 'isApproved', 'issues', 'suggestions']
      }
    });

    const result = parseAIResponse<CriticResult>(responseText);
    return {
      companyId: draft.companyId,
      score: result.score / 100, // Normalize to 0-1 range
      issues: result.issues.map(i => `${i.type} (${i.severity}): ${i.description}`),
      suggestions: result.suggestions
    };
  }

  async revise(draft: Draft, critique: Critique): Promise<Draft> {
    let revisedBody = draft.emailBody;
    let revisedSubject = draft.emailSubject;

    if (critique.issues.some(i => i.toLowerCase().includes('[your name]') || i.toLowerCase().includes('placeholder'))) {
      revisedBody = revisedBody.replace('[Your Name]', 'Suraj from GrowthPilot');
    }
    if (critique.issues.some(i => i.toLowerCase().includes('[name]') || i.toLowerCase().includes('greeting'))) {
      revisedBody = revisedBody.replace('[Name]', 'the team');
    }

    return {
      ...draft,
      emailBody: revisedBody,
      emailSubject: revisedSubject,
      version: draft.version + 1,
    };
  }
}
