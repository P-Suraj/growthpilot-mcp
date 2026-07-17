import { Module } from '@nitrostack/core';
import { PlannerService } from './planner.service.js';

@Module({
  name: 'planner',
  description: 'Parses goals and generates campaigns',
  providers: [PlannerService],
  exports: [PlannerService]
})
export class PlannerModule {}
