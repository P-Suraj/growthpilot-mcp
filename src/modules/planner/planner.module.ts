import { Module } from '@nitrostack/core';
import { PlannerService } from './planner.service.js';
import { PlannerTools } from './planner.tools.js';

@Module({
  name: 'planner',
  description: 'Parses goals and generates campaigns',
  providers: [PlannerService],
  controllers: [PlannerTools],
  exports: [PlannerService]
})
export class PlannerModule {}
