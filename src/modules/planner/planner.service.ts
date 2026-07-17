import { Injectable } from '@nitrostack/core';
import { Campaign } from '../shared/models.js';

@Injectable()
export class PlannerService {
  async plan(goal: string): Promise<Campaign> {
    const id = `camp-${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();

    // Simple heuristic parser for the hackathon MVP
    let targetIndustry = 'Generic';
    let targetLocation = 'Global';
    let minEmployees = 0;
    let maxEmployees = 1000;

    // Detect location, e.g., "in Bangalore", "in Kochi", "in Chennai"
    const locationMatch = goal.match(/in\s+([A-Za-z]+)/i);
    if (locationMatch) {
      targetLocation = locationMatch[1];
    }

    // Detect employee range, e.g., "20-100 employees" or "20 to 100 employees"
    const rangeMatch = goal.match(/(\d+)\s*(?:-|to)\s*(\d+)\s+employees/i);
    if (rangeMatch) {
      minEmployees = parseInt(rangeMatch[1], 10);
      maxEmployees = parseInt(rangeMatch[2], 10);
    } else {
      // Look for e.g. "more than 20 employees"
      const gtMatch = goal.match(/(?:more than|>)\s*(\d+)\s+employees/i);
      if (gtMatch) {
        minEmployees = parseInt(gtMatch[1], 10);
      }
    }

    // Detect industry or business type, e.g. "SaaS", "Printing", "Cafe"
    if (goal.toLowerCase().includes('saas')) {
      targetIndustry = 'SaaS';
    } else if (goal.toLowerCase().includes('print')) {
      targetIndustry = 'Printing';
    } else if (goal.toLowerCase().includes('cafe')) {
      targetIndustry = 'Cafe';
    } else {
      // Find the word before "companies" or "shops" or "businesses"
      const industryMatch = goal.match(/(\w+)\s+(?:companies|shops|businesses)/i);
      if (industryMatch && !['find', 'the', 'some', 'any'].includes(industryMatch[1].toLowerCase())) {
        targetIndustry = industryMatch[1];
      }
    }

    return {
      id,
      goal,
      createdAt,
      targetIndustry,
      targetLocation,
      minEmployees,
      maxEmployees,
    };
  }
}
