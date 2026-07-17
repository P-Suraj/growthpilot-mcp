import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { PlannerService } from '../planner/planner.service.js';
import { DiscoveryService } from '../discovery/discovery.service.js';
import { BusinessValidatorService } from '../discovery/providers/business-validator.service.js';
import { ResearchService } from '../research/research.service.js';
import { QualificationService } from '../qualification/qualification.service.js';
import { DraftService } from '../draft/draft.service.js';
import { CriticService } from '../critic/critic.service.js';
import { ResearchResult, QualificationScore, Draft, Critique, ValidationResult } from '../shared/models.js';

@Controller()
export class CampaignController {
  constructor(
    private readonly planner: PlannerService,
    private readonly discovery: DiscoveryService,
    private readonly validator: BusinessValidatorService,
    private readonly research: ResearchService,
    private readonly qualification: QualificationService,
    private readonly draft: DraftService,
    private readonly critic: CriticService,
  ) {}

  @Tool({
    name: 'gp_run_pipeline',
    description: 'Executes the entire GrowthPilot lead generation campaign pipeline end-to-end for a given user goal.',
    inputSchema: z.object({
      goal: z.string().describe('The campaign goal, e.g. "Find SaaS companies in Bangalore with 20-100 employees"')
    })
  })
  async runCampaign(input: { goal: string }, ctx: ExecutionContext) {
    const startTime = Date.now();
    ctx.logger.info(`Starting campaign for goal: "${input.goal}"`);

    try {
      // ----------------------------------------------------------------
      // Stage 1 — Planner
      // ----------------------------------------------------------------
      const campaign = await this.planner.plan(input.goal);
      ctx.logger.info(`Campaign planned: id=${campaign.id} industry="${campaign.targetIndustry}" location="${campaign.targetLocation}"`);
      if (campaign.searchSpec) {
        ctx.logger.info(`Search spec: placeType="${campaign.searchSpec.googlePlaceType}" rejectKeywords=[${campaign.searchSpec.rejectKeywords.join(', ')}]`);
      }

      // ----------------------------------------------------------------
      // Stage 2 — Discovery
      // ----------------------------------------------------------------
      const companies = await this.discovery.discover(campaign);
      ctx.logger.info(`Discovered ${companies.length} companies after keyword filter`);

      const researchList: ResearchResult[] = [];
      const scores: QualificationScore[] = [];
      const drafts: Draft[] = [];
      const critiques: Critique[] = [];

      // Tracking for final metadata
      let validatedCount = 0;
      let rejectedByValidator = 0;
      let rejectedByQualification = 0;
      const validationResults: Array<{ companyId: string; companyName: string } & ValidationResult> = [];

      // ----------------------------------------------------------------
      // Loop through discovered companies
      // ----------------------------------------------------------------
      for (const company of companies) {
        // --------------------------------------------------------------
        // Stage 3 — Validator (zero-cost deterministic gate)
        // --------------------------------------------------------------
        const validation = this.validator.validate(company, campaign);
        validationResults.push({ companyId: company.id, companyName: company.name, ...validation });

        if (!validation.isValid) {
          rejectedByValidator++;
          ctx.logger.info(
            `[Validator] REJECTED "${company.name}" — ${validation.reason} (confidence: ${validation.confidence})`
          );
          // Still add placeholder entries so frontend can show rejected count
          continue;
        }

        validatedCount++;
        ctx.logger.info(`[Validator] ACCEPTED "${company.name}" (confidence: ${validation.confidence.toFixed(2)})`);

        // --------------------------------------------------------------
        // Stage 4 — Research (Tavily)
        // --------------------------------------------------------------
        const research = await this.research.research(company);
        researchList.push(research);

        // --------------------------------------------------------------
        // Stage 5 — Qualification (Gemini or Heuristic)
        // --------------------------------------------------------------
        const score = await this.qualification.qualify(company, research, campaign);
        scores.push(score);

        ctx.logger.info(`[Qualify] "${company.name}" → tier=${score.tier} score=${score.score.toFixed(2)}`);

        // Skip expensive Draft + Critic for Low-tier leads
        if (score.tier === 'Low') {
          rejectedByQualification++;
          ctx.logger.info(`[Qualify] Skipping Draft+Critic for Low-tier lead: "${company.name}"`);
          continue;
        }

        // --------------------------------------------------------------
        // Stage 6 — Draft (Gemini)
        // --------------------------------------------------------------
        let draft = await this.draft.generateDraft(company, research, score, campaign.goal, campaign.id);

        // --------------------------------------------------------------
        // Stage 7 — Critic + optional revision
        // --------------------------------------------------------------
        const researchTime = research.normalized?.timestamp?.value || new Date().toISOString();
        let critique = await this.critic.critique(draft, campaign.id, researchTime);

        if (critique.score < 0.8) {
          ctx.logger.info(`Draft for "${company.name}" scored ${critique.score}. Revising...`);
          draft = await this.critic.revise(draft, critique);
          critique = await this.critic.critique(draft, campaign.id, researchTime);
        }

        drafts.push(draft);
        critiques.push(critique);
      }

      const duration = Date.now() - startTime;

      ctx.logger.info(
        `Pipeline complete in ${duration}ms. ` +
        `Discovered=${companies.length} ValidatorPassed=${validatedCount} ` +
        `QualifyRejected=${rejectedByQualification} Drafted=${drafts.length}`
      );

      return {
        success: true,
        campaign,
        companies,
        research: researchList,
        scores,
        drafts,
        critiques,
        metadata: {
          executionTimeMs:      duration,
          discoveredCount:      companies.length,
          validatedCount,
          rejectedByValidator,
          rejectedByQualification,
          draftedCount:         drafts.length,
          validationResults,
        },
      };
    } catch (error: any) {
      ctx.logger.error(`Campaign execution failed: ${error.message || error}`);
      return {
        success: false,
        error: error.message || String(error),
      };
    }
  }
}
