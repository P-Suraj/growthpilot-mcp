import { Module } from '@nitrostack/core';
import { PlannerModule } from '../planner/planner.module.js';
import { DiscoveryModule } from '../discovery/discovery.module.js';
import { ResearchModule } from '../research/research.module.js';
import { QualificationModule } from '../qualification/qualification.module.js';
import { DraftModule } from '../draft/draft.module.js';
import { CriticModule } from '../critic/critic.module.js';
import { CampaignController } from './campaign.controller.js';

@Module({
  name: 'campaign',
  description: 'Coordinates the end-to-end GrowthPilot lead generation campaign',
  imports: [
    PlannerModule,
    DiscoveryModule,
    ResearchModule,
    QualificationModule,
    DraftModule,
    CriticModule
  ],
  controllers: [CampaignController]
})
export class CampaignModule {}
