import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { PlannerService } from './planner.service.js';

@Controller()
export class PlannerTools {
  constructor(private readonly plannerService: PlannerService) {}

  @Tool({
    name: 'gp_plan_campaign',
    description: 'Processes a user goal (e.g. "Find SaaS companies in Bangalore with 20-100 employees") and plans the campaign parameters.',
    inputSchema: z.object({
      goal: z.string().describe('The user campaign goal to parse and plan')
    })
  })
  async planCampaign(input: { goal: string }, ctx: ExecutionContext) {
    const startTime = Date.now();
    ctx.logger.info(`Exposing gp_plan_campaign for goal: "${input.goal}"`);

    try {
      const campaign = await this.plannerService.plan(input.goal);
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        campaign,
        metadata: {
          executionTimeMs: duration
        }
      };
    } catch (error: any) {
      ctx.logger.error(`Failed to plan campaign: ${error.message || error}`);
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }
}
