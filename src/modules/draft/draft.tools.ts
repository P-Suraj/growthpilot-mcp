import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { DraftService } from './draft.service.js';

@Controller()
export class DraftTools {
  constructor(private readonly draftService: DraftService) {}

  @Tool({
    name: 'gp_generate_email_draft',
    description: 'Generates a highly personalized cold sales email outreach draft for a lead using Gemini API reasoning.',
    inputSchema: z.object({
      company: z.object({
        id: z.string(),
        name: z.string(),
        location: z.string(),
        industry: z.string(),
        employeeCount: z.number(),
        website: z.string().optional()
      }).describe('The target Company details'),
      research: z.object({
        companyId: z.string(),
        website: z.string(),
        description: z.string(),
        industry: z.string(),
        employeeCount: z.number(),
        confidence: z.number(),
        normalized: z.any().optional()
      }).describe('The Company web research profile'),
      score: z.object({
        companyId: z.string(),
        score: z.number(),
        tier: z.string(),
        reasoning: z.string()
      }).describe('The QualificationScore details'),
      goal: z.string().describe('The user campaign goal'),
      campaignId: z.string().optional().describe('The campaign ID reference')
    })
  })
  async generateEmailDraft(
    input: { company: any; research: any; score: any; goal: string; campaignId?: string },
    ctx: ExecutionContext
  ) {
    const startTime = Date.now();
    ctx.logger.info(`Exposing gp_generate_email_draft for company: ${input.company.name}`);

    try {
      const draft = await this.draftService.generateDraft(
        input.company,
        input.research,
        input.score,
        input.goal,
        input.campaignId
      );
      const duration = Date.now() - startTime;

      return {
        success: true,
        draft,
        metadata: {
          executionTimeMs: duration
        }
      };
    } catch (error: any) {
      ctx.logger.error(`Failed to generate email draft: ${error.message || error}`);
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }
}
