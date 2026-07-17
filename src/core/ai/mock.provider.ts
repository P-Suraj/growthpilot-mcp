import { Injectable } from '@nitrostack/core';
import { LLMProvider } from './llm.provider.js';
import { LLMGenerateOptions } from './llm.types.js';

@Injectable()
export class MockLLMProvider extends LLMProvider {
  readonly name = 'mock_llm';

  async generate(systemPrompt: string, userPrompt: string, options?: LLMGenerateOptions): Promise<string> {
    // Generate deterministic mock JSON based on the systemPrompt type or keywords
    if (systemPrompt.includes('Qualification') || userPrompt.includes('qualification') || systemPrompt.includes('qualify')) {
      return JSON.stringify({
        overallScore: 87,
        tier: 'High',
        confidence: 0.92,
        reasoning: [
          'Company profile aligns fully with target criteria.',
          'Active web presence and clear business goals match campaign industry.',
          'Operational size is optimal for product deployment.'
        ],
        subScores: {
          industryMatch: 95,
          locationMatch: 100,
          companySize: 80,
          websiteQuality: 84,
          digitalPresence: 72,
          businessFit: 90
        }
      });
    }

    if (systemPrompt.includes('Draft') || userPrompt.includes('draft') || systemPrompt.includes('personalize')) {
      const companyMatch = userPrompt.match(/company:\s*"([^"]+)"/i) || userPrompt.match(/name:\s*"([^"]+)"/i);
      const companyName = companyMatch ? companyMatch[1] : 'Prospect';

      return JSON.stringify({
        emailSubject: `Partnership proposal for ${companyName}`,
        emailBody: `Hi the team,\n\nI was impressed by your digital footprint and target profile. We are launching an automated printing platform and would love to chat.\n\nBest,\nSuraj from GrowthPilot`,
        personalizedHooks: [
          `Your operations in Bangalore stand out in the SaaS space.`
        ],
        callToAction: 'Would you be open to a 10-minute call next Tuesday?'
      });
    }

    if (systemPrompt.includes('Critic') || userPrompt.includes('critic') || systemPrompt.includes('evaluate')) {
      const isApproved = !userPrompt.includes('[Your Name]') && !userPrompt.includes('[Name]');
      return JSON.stringify({
        score: isApproved ? 90 : 55,
        isApproved,
        issues: isApproved ? [] : [
          {
            type: 'personalization',
            severity: 'high',
            description: 'Placeholder "[Your Name]" or "[Name]" detected.'
          }
        ],
        suggestions: isApproved ? [] : [
          'Replace placeholders with real names.'
        ]
      });
    }

    return JSON.stringify({
      message: 'Generic mock output'
    });
  }
}
