import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { QualificationService } from './qualification.service.js';

@Controller()
export class QualificationTools {
  constructor(private readonly qualificationService: QualificationService) {}

  @Tool({
    name: 'gp_qualify_lead',
    description: 'Calculates the sales qualification fit score for a discovered company using Gemini API reasoning.',
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
      campaign: z.object({
        id: z.string(),
        goal: z.string(),
        createdAt: z.string(),
        targetIndustry: z.string().optional(),
        targetLocation: z.string().optional(),
        minEmployees: z.number().optional(),
        maxEmployees: z.number().optional()
      }).describe('The Campaign parameters')
    })
  })
  async qualifyLead(
    input: { company: any; research: any; campaign: any },
    ctx: ExecutionContext
  ) {
    const startTime = Date.now();
    ctx.logger.info(`Exposing gp_qualify_lead for company: ${input.company.name}`);

    try {
      const score = await this.qualificationService.qualify(
        input.company,
        input.research,
        input.campaign
      );
      const duration = Date.now() - startTime;

      return {
        success: true,
        score,
        metadata: {
          executionTimeMs: duration
        }
      };
    } catch (error: any) {
      ctx.logger.error(`Failed to qualify lead: ${error.message || error}`);
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }
}
