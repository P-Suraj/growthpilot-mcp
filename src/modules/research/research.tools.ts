import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { ResearchService } from './research.service.js';

@Controller()
export class ResearchTools {
  constructor(private readonly researchService: ResearchService) {}

  @Tool({
    name: 'gp_research_company',
    description: 'Runs deep web research on a specific company using Tavily search API.',
    inputSchema: z.object({
      company: z.object({
        id: z.string(),
        name: z.string(),
        location: z.string(),
        industry: z.string(),
        employeeCount: z.number(),
        website: z.string().optional()
      }).describe('The target Company details')
    })
  })
  async researchCompany(input: { company: any }, ctx: ExecutionContext) {
    const startTime = Date.now();
    ctx.logger.info(`Exposing gp_research_company for company: ${input.company.name}`);

    try {
      const research = await this.researchService.research(input.company);
      const duration = Date.now() - startTime;

      return {
        success: true,
        research,
        metadata: {
          executionTimeMs: duration
        }
      };
    } catch (error: any) {
      ctx.logger.error(`Failed to research company: ${error.message || error}`);
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }
}
