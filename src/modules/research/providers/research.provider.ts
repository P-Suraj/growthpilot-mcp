import { Company, ResearchResult } from '../../shared/models.js';

export abstract class ResearchProvider {
  abstract readonly name: string;
  abstract research(company: Company): Promise<ResearchResult>;
}
