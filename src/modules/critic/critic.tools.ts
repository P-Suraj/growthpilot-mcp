import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { CriticService } from './critic.service.js';

@Controller()
export class CriticTools {
  constructor(private readonly criticService: CriticService) {}

  @Tool({
    name: 'gp_critique_draft',
    description: 'Audits a cold email draft for placeholder flags, styling, and factual accuracy using Gemini API.',
    inputSchema: z.object({
      draft: z.object({
        companyId: z.string(),
        emailSubject: z.string(),
        emailBody: z.string(),
        version: z.number()
      }).describe('The Email Draft to analyze'),
      campaignId: z.string().optional().describe('The Campaign ID reference'),
      researchTime: z.string().optional().describe('The research verification timestamp')
    })
  })
  async critiqueDraft(
    input: { draft: any; campaignId?: string; researchTime?: string },
    ctx: ExecutionContext
  ) {
    const startTime = Date.now();
    ctx.logger.info(`Exposing gp_critique_draft for company ID: ${input.draft.companyId}`);

    try {
      const critique = await this.criticService.critique(
        input.draft,
        input.campaignId,
        input.researchTime
      );
      const duration = Date.now() - startTime;

      return {
        success: true,
        critique,
        metadata: {
          executionTimeMs: duration
        }
      };
    } catch (error: any) {
      ctx.logger.error(`Failed to critique draft: ${error.message || error}`);
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }

  @Tool({
    name: 'gp_revise_draft',
    description: 'Revises a cold email draft using the feedback and suggestions from a critique.',
    inputSchema: z.object({
      draft: z.object({
        companyId: z.string(),
        emailSubject: z.string(),
        emailBody: z.string(),
        version: z.number()
      }).describe('The original Draft email'),
      critique: z.object({
        companyId: z.string(),
        score: z.number(),
        issues: z.array(z.string()),
        suggestions: z.array(z.string())
      }).describe('The Critique feedback to apply')
    })
  })
  async reviseDraft(
    input: { draft: any; critique: any },
    ctx: ExecutionContext
  ) {
    const startTime = Date.now();
    ctx.logger.info(`Exposing gp_revise_draft for company ID: ${input.draft.companyId}`);

    try {
      const revisedDraft = await this.criticService.revise(
        input.draft,
        input.critique
      );
      const duration = Date.now() - startTime;

      return {
        success: true,
        revisedDraft,
        metadata: {
          executionTimeMs: duration
        }
      };
    } catch (error: any) {
      ctx.logger.error(`Failed to revise draft: ${error.message || error}`);
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }
}
