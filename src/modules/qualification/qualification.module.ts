import { Module } from '@nitrostack/core';
import { QualificationService } from './qualification.service.js';
import { LLMQualificationProvider } from './providers/llm.provider.js';
import { HeuristicProvider } from './providers/heuristic.provider.js';
import { AIModule } from '../../core/ai/ai.module.js';
import { QualificationTools } from './qualification.tools.js';

@Module({
  name: 'qualification',
  description: 'Qualifies leads against target criteria',
  imports: [AIModule],
  providers: [
    QualificationService,
    LLMQualificationProvider,
    HeuristicProvider
  ],
  controllers: [QualificationTools],
  exports: [
    QualificationService,
    LLMQualificationProvider,
    HeuristicProvider
  ]
})
export class QualificationModule {}
