import { Injectable } from '@nitrostack/core';
import { CriticProvider } from './critic.provider.js';
import { Draft, Critique } from '../../shared/models.js';

@Injectable()
export class MockCriticProvider extends CriticProvider {
  readonly name = 'mock';

  async critique(draft: Draft): Promise<Critique> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 1.0;

    if (draft.emailBody.includes('[Your Name]')) {
      score -= 0.2;
      issues.push('Unresolved placeholder "[Your Name]" detected in email signature.');
      suggestions.push('Replace "[Your Name]" with the actual sender name (e.g., "Suraj from GrowthPilot").');
    }

    if (draft.emailBody.includes('[Name]')) {
      score -= 0.15;
      issues.push('Unresolved placeholder "[Name]" detected in greeting.');
      suggestions.push('Replace "[Name]" with "the team" or a specific contact name.');
    }

    if (draft.emailBody.length < 100) {
      score -= 0.1;
      issues.push('Email body might be too short to build rapport.');
      suggestions.push('Add a brief sentence explaining why their business stood out.');
    }

    score = Math.max(0, parseFloat(score.toFixed(2)));

    return {
      companyId: draft.companyId,
      score,
      issues,
      suggestions,
    };
  }

  async revise(draft: Draft, critique: Critique): Promise<Draft> {
    let revisedBody = draft.emailBody;
    let revisedSubject = draft.emailSubject;

    if (critique.issues.some(i => i.includes('[Your Name]'))) {
      revisedBody = revisedBody.replace('[Your Name]', 'Suraj from GrowthPilot');
    }
    if (critique.issues.some(i => i.includes('[Name]'))) {
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
