import { ControllerDecorator as Controller, ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { DiscoveryService } from './discovery.service.js';

@Controller()
export class DiscoveryTools {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Tool({
    name: 'gp_discover_companies',
    description: 'Searches for and discovers target companies matching the campaign parameters.',
    inputSchema: z.object({
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
  async discoverCompanies(input: { campaign: any }, ctx: ExecutionContext) {
    const startTime = Date.now();
    ctx.logger.info(`Exposing gp_discover_companies for campaign: ${input.campaign.id}`);

    try {
      const companies = await this.discoveryService.discover(input.campaign);
      const duration = Date.now() - startTime;

      return {
        success: true,
        companies,
        metadata: {
          executionTimeMs: duration
        }
      };
    } catch (error: any) {
      ctx.logger.error(`Failed to discover companies: ${error.message || error}`);
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }
}
