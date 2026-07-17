import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { PingModule } from './modules/ping/ping.module.js';
import { CampaignModule } from './modules/campaign/campaign.module.js';
import { PlannerModule } from './modules/planner/planner.module.js';
import { DiscoveryModule } from './modules/discovery/discovery.module.js';
import { ResearchModule } from './modules/research/research.module.js';
import { QualificationModule } from './modules/qualification/qualification.module.js';
import { DraftModule } from './modules/draft/draft.module.js';
import { CriticModule } from './modules/critic/critic.module.js';
import { AIModule } from './core/ai/ai.module.js';
import { SystemHealthCheck } from './health/system.health.js';

/**
 * Root Application Module
 * 
 * This is the main module that bootstraps the MCP server.
 * It registers all feature modules and health checks.
 */
@McpApp({
  module: AppModule,
  server: {
    name: 'growthpilot-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root application module',
  imports: [
    ConfigModule.forRoot(),
    PingModule,
    CampaignModule,
    PlannerModule,
    DiscoveryModule,
    ResearchModule,
    QualificationModule,
    DraftModule,
    CriticModule,
    AIModule
  ],
  providers: [
    // Health Checks
    SystemHealthCheck,
  ]
})
export class AppModule {}
