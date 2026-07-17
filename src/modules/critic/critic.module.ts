import { Module } from '@nitrostack/core';
import { CriticService } from './critic.service.js';
import { LLMCriticProvider } from './providers/llm.provider.js';
import { MockCriticProvider } from './providers/mock.provider.js';
import { AIModule } from '../../core/ai/ai.module.js';

@Module({
  name: 'critic',
  description: 'Critiques and refines email drafts',
  imports: [AIModule],
  providers: [
    CriticService,
    LLMCriticProvider,
    MockCriticProvider
  ],
  exports: [
    CriticService,
    LLMCriticProvider,
    MockCriticProvider
  ]
})
export class CriticModule {}
