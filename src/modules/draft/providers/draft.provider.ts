import { Company, ResearchResult, QualificationScore, Draft } from '../../shared/models.js';

export abstract class DraftProvider {
  abstract readonly name: string;
  abstract generateDraft(company: Company, research: ResearchResult, score: QualificationScore, goal: string): Promise<Draft>;
}
