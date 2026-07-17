import { Injectable } from '@nitrostack/core';
import { QualificationProvider } from './qualification.provider.js';
import { Company, ResearchResult, QualificationScore, Campaign } from '../../shared/models.js';

@Injectable()
export class HeuristicProvider extends QualificationProvider {
  readonly name = 'heuristic';

  async qualify(company: Company, research: ResearchResult, campaign: Campaign): Promise<QualificationScore> {
    let score = 0.5;
    const reasons: string[] = [];

    // Industry check
    if (campaign.targetIndustry && company.industry.toLowerCase() === campaign.targetIndustry.toLowerCase()) {
      score += 0.2;
      reasons.push(`Industry matches target: ${campaign.targetIndustry}`);
    } else {
      score -= 0.1;
      reasons.push(`Industry (${company.industry}) does not match target (${campaign.targetIndustry})`);
    }

    // Location check
    if (campaign.targetLocation && company.location.toLowerCase() === campaign.targetLocation.toLowerCase()) {
      score += 0.15;
      reasons.push(`Location matches target: ${campaign.targetLocation}`);
    } else {
      score -= 0.05;
      reasons.push(`Location (${company.location}) does not match target (${campaign.targetLocation})`);
    }

    // Employee count check
    const minEmp = campaign.minEmployees ?? 0;
    const maxEmp = campaign.maxEmployees ?? 1000;
    if (company.employeeCount >= minEmp && company.employeeCount <= maxEmp) {
      score += 0.15;
      reasons.push(`Employee count (${company.employeeCount}) is in range [${minEmp}, ${maxEmp}]`);
    } else {
      score -= 0.2;
      reasons.push(`Employee count (${company.employeeCount}) is outside range [${minEmp}, ${maxEmp}]`);
    }

    score = Math.max(0, Math.min(1, score));

    let tier: 'High' | 'Medium' | 'Low' = 'Medium';
    if (score >= 0.75) {
      tier = 'High';
    } else if (score < 0.4) {
      tier = 'Low';
    }

    return {
      companyId: company.id,
      score: parseFloat(score.toFixed(2)),
      tier,
      reasoning: reasons.join('; '),
    };
  }
}
