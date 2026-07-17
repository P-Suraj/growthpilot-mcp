import { Injectable } from '@nitrostack/core';
import { Company, Campaign, ValidationResult } from '../../shared/models.js';

// ---------------------------------------------------------------------------
// Google Place types that are almost universally wrong for B2B outreach
// ---------------------------------------------------------------------------
const ALWAYS_REJECT_TYPES = new Set([
  'cemetery',
  'funeral_home',
  'parking',
  'atm',
  'bank',  // not universally wrong but rarely a lead for product sales
  'lodging',
]);

// Minimum rating to consider the business operational enough
const MIN_RATING = 2.5;
const MIN_RATING_COUNT = 2;

/**
 * Lightweight Validator — runs BEFORE Tavily Research.
 *
 * Decision order (cheapest checks first):
 *  1. rejectPlaceTypes from searchSpec   → instant string-set lookup
 *  2. rejectKeywords in business name     → string includes check
 *  3. Rating floor                        → numeric comparison
 *  4. Expected type overlap               → set intersection
 *
 * No Gemini / Tavily calls are made here intentionally — this stage must be
 * fast and free so it can run on every discovered company.
 */
@Injectable()
export class BusinessValidatorService {
  validate(company: Company, campaign: Campaign): ValidationResult {
    const spec = campaign.searchSpec;
    const companyTypes: string[] = company.categories ?? [];
    const nameLower = company.name.toLowerCase();

    // ------------------------------------------------------------------
    // Check 1: always-reject place types (e.g. cemetery, parking)
    // ------------------------------------------------------------------
    const alwaysRejectHit = companyTypes.find(t => ALWAYS_REJECT_TYPES.has(t));
    if (alwaysRejectHit) {
      return {
        isValid: false,
        confidence: 0,
        reason: `Business type "${alwaysRejectHit}" is never a valid B2B lead.`,
      };
    }

    if (!spec) {
      // No searchSpec means legacy campaign — pass through with medium confidence
      return { isValid: true, confidence: 0.5 };
    }

    // ------------------------------------------------------------------
    // Check 2: rejectPlaceTypes from the campaign spec
    // ------------------------------------------------------------------
    const rejectedType = companyTypes.find(t => spec.rejectPlaceTypes.includes(t));
    if (rejectedType) {
      return {
        isValid: false,
        confidence: 0,
        reason: `Google category "${rejectedType}" is in the rejection list for this campaign (expected: ${spec.googlePlaceType}).`,
      };
    }

    // ------------------------------------------------------------------
    // Check 3: rejectKeywords in business name
    // ------------------------------------------------------------------
    const rejectedKeyword = spec.rejectKeywords.find(kw =>
      nameLower.includes(kw.toLowerCase())
    );
    if (rejectedKeyword) {
      return {
        isValid: false,
        confidence: 0,
        reason: `Business name contains rejected keyword: "${rejectedKeyword}".`,
      };
    }

    // ------------------------------------------------------------------
    // Check 4: rating floor (only fail if rating data exists AND is clearly bad)
    // ------------------------------------------------------------------
    if (
      company.rating !== null &&
      company.rating !== undefined &&
      company.rating < MIN_RATING
    ) {
      // Only reject if we have enough reviews to trust the rating
      // (companies with 1-2 reviews may just be new)
      // We don't have userRatingCount in the Company model, so just warn
      return {
        isValid: false,
        confidence: 0.1,
        reason: `Business rating ${company.rating} is below minimum threshold ${MIN_RATING}.`,
      };
    }

    // ------------------------------------------------------------------
    // Check 5: expected type overlap (soft check — yields confidence score)
    // ------------------------------------------------------------------
    const expectedType = spec.googlePlaceType;
    let confidence = 0.6; // base confidence for a non-rejected business

    if (companyTypes.includes(expectedType)) {
      // Exact match with expected type — high confidence
      confidence = 0.95;
    } else if (companyTypes.includes('establishment') || companyTypes.includes('store')) {
      // Generic match — medium confidence
      confidence = 0.65;
    } else if (companyTypes.length === 0) {
      // No types from Google — cannot validate type, be cautious
      confidence = 0.5;
    } else {
      // Types exist but don't include expected — lower confidence but not a hard reject
      // (e.g. a laptop shop tagged as "electronics_store" when we expected "computer_store")
      const closeEnough = companyTypes.some(t =>
        t.includes('store') || t.includes('shop') || t.includes('dealer') || t.includes('tech')
      );
      confidence = closeEnough ? 0.7 : 0.45;
    }

    // Hard reject only if confidence is very low AND types clearly don't match
    if (confidence < 0.45 && companyTypes.length > 0) {
      return {
        isValid: false,
        confidence,
        reason: `Business Google types [${companyTypes.slice(0, 3).join(', ')}] do not match expected type "${expectedType}".`,
      };
    }

    return { isValid: true, confidence };
  }
}
