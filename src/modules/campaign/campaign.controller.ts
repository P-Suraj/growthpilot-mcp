import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { PlannerService } from '../planner/planner.service.js';
import { DiscoveryService } from '../discovery/discovery.service.js';
import { ResearchService } from '../research/research.service.js';
import { QualificationService } from '../qualification/qualification.service.js';
import { DraftService } from '../draft/draft.service.js';
import { CriticService } from '../critic/critic.service.js';
import { ResearchResult, QualificationScore, Draft, Critique } from '../shared/models.js';

@Controller('campaign')
export class CampaignController {
  constructor(
    private readonly planner: PlannerService,
    private readonly discovery: DiscoveryService,
    private readonly research: ResearchService,
    private readonly qualification: QualificationService,
    private readonly draft: DraftService,
    private readonly critic: CriticService
  ) {}

  @Tool({
    name: 'run_campaign',
    description: 'Executes the entire GrowthPilot lead generation campaign pipeline for a given user goal.',
    inputSchema: z.object({
      goal: z.string().describe('The campaign goal, e.g. "Find SaaS companies in Bangalore with 20-100 employees"')
    })
  })
  async runCampaign(input: { goal: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Starting campaign for goal: "${input.goal}"`);

    // 1. Planner
    const campaign = await this.planner.plan(input.goal);
    ctx.logger.info(`Campaign planned with ID: ${campaign.id}`);

    // 2. Discovery
    const companies = await this.discovery.discover(campaign);
    ctx.logger.info(`Discovered ${companies.length} companies`);

    const researchList: ResearchResult[] = [];
    const scores: QualificationScore[] = [];
    const drafts: Draft[] = [];
    const critiques: Critique[] = [];

    // Loop through discovered companies
    for (const company of companies) {
      // 3. Research
      const research = await this.research.research(company);
      researchList.push(research);

      // 4. Qualification
      const score = await this.qualification.qualify(company, research, campaign);
      scores.push(score);

      // 5. Draft
      let draft = await this.draft.generateDraft(company, research, score, campaign.goal, campaign.id);

      // 6. Critic / Review
      const researchTime = research.normalized?.timestamp?.value || new Date().toISOString();
      let critique = await this.critic.critique(draft, campaign.id, researchTime);
      
      // If score is below threshold (e.g. < 0.8), revise once
      if (critique.score < 0.8) {
        ctx.logger.info(`Draft for ${company.name} scored ${critique.score}. Revising...`);
        draft = await this.critic.revise(draft, critique);
        // Re-evaluate the revised draft
        critique = await this.critic.critique(draft, campaign.id, researchTime);
      }

      drafts.push(draft);
      critiques.push(critique);
    }

    return {
      campaign,
      companies,
      research: researchList,
      scores,
      drafts,
      critiques
    };
  }
}
