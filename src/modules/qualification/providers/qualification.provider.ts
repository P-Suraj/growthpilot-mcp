import { Company, ResearchResult, QualificationScore, Campaign } from '../../shared/models.js';

export abstract class QualificationProvider {
  abstract readonly name: string;
  abstract qualify(company: Company, research: ResearchResult, campaign: Campaign): Promise<QualificationScore>;
}
