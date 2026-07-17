import { Injectable } from '@nitrostack/core';
import { QualificationProvider } from './qualification.provider.js';
import { Company, ResearchResult, QualificationScore, Campaign } from '../../shared/models.js';

@Injectable()
export class HeuristicProvider extends QualificationProvider {
  readonly name = 'heuristic';

  async qualify(company: Company, research: ResearchResult, campaign: Campaign): Promise<QualificationScore> {
    let score = 0.5;
    const reasons: string[] = [];
    const spec = campaign.searchSpec;

    // ------------------------------------------------------------------
    // Industry / category match
    // ------------------------------------------------------------------
    const companyTypes: string[] = company.categories ?? [];
    const expectedPlaceType = spec?.googlePlaceType ?? '';
    const expectedIndustry = (spec?.industry ?? campaign.targetIndustry ?? '').toLowerCase();
    const companyIndustryLower = company.industry.toLowerCase();

    // Check 1: exact placeType match in Google types array (most reliable)
    const exactTypeMatch = expectedPlaceType && companyTypes.includes(expectedPlaceType);

    // Check 2: industry string match (now uses real Google category, not copied value)
    const industryMatch =
      expectedIndustry &&
      (companyIndustryLower.includes(expectedIndustry) || expectedIndustry.includes(companyIndustryLower));

    // Check 3: partial category overlap — any types containing store/tech/electronics etc.
    const broadMatch = expectedPlaceType
      ? companyTypes.some(t =>
          t.includes('store') ||
          t.includes('shop') ||
          t.includes('dealer') ||
          t.includes('tech') ||
          t.includes('electronic')
        )
      : false;

    if (exactTypeMatch) {
      score += 0.25;
      reasons.push(`Google place type exactly matches expected type: "${expectedPlaceType}"`);
    } else if (industryMatch) {
      score += 0.15;
      reasons.push(`Industry "${company.industry}" aligns with target "${spec?.industry ?? campaign.targetIndustry}"`);
    } else if (broadMatch) {
      score += 0.05;
      reasons.push(`Company has a broadly relevant Google category`);
    } else {
      score -= 0.15;
      reasons.push(
        `Industry/type mismatch — Google types: [${companyTypes.slice(0, 3).join(', ')}], expected: "${expectedPlaceType || expectedIndustry}"`
      );
    }

    // ------------------------------------------------------------------
    // Location match
    // ------------------------------------------------------------------
    const expectedLocation = (spec?.city ?? campaign.targetLocation ?? '').toLowerCase();
    if (expectedLocation && company.location.toLowerCase().includes(expectedLocation)) {
      score += 0.1;
      reasons.push(`Location "${company.location}" matches target "${spec?.city ?? campaign.targetLocation}"`);
    } else if (expectedLocation) {
      score -= 0.05;
      reasons.push(`Location "${company.location}" does not match target "${spec?.city ?? campaign.targetLocation}"`);
    }

    // ------------------------------------------------------------------
    // Employee count
    // ------------------------------------------------------------------
    const minEmp = campaign.minEmployees ?? 0;
    const maxEmp = campaign.maxEmployees ?? 1000;
    if (company.employeeCount >= minEmp && company.employeeCount <= maxEmp) {
      score += 0.1;
      reasons.push(`Employee count (${company.employeeCount}) is within range [${minEmp}, ${maxEmp}]`);
    } else {
      score -= 0.1;
      reasons.push(`Employee count (${company.employeeCount}) is outside range [${minEmp}, ${maxEmp}]`);
    }

    // ------------------------------------------------------------------
    // Rating signal (positive only — a good rating boosts; absence is neutral)
    // ------------------------------------------------------------------
    if (company.rating !== null && company.rating !== undefined && company.rating >= 4.0) {
      score += 0.05;
      reasons.push(`Strong rating: ${company.rating}`);
    }

    // ------------------------------------------------------------------
    // Website presence (positive signal for B2B leads)
    // ------------------------------------------------------------------
    if (research.website && research.website.length > 0) {
      score += 0.05;
      reasons.push(`Business has a website: ${research.website}`);
    }

    score = Math.max(0, Math.min(1, score));

    let tier: 'High' | 'Medium' | 'Low' = 'Medium';
    if (score >= 0.75) {
      tier = 'High';
    } else if (score < 0.40) {
      tier = 'Low';
    }

    return {
      companyId: company.id,
      score:     parseFloat(score.toFixed(2)),
      tier,
      reasoning: reasons.join('; '),
    };
  }
}
