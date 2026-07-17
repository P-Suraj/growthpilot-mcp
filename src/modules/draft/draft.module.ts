import { Module } from '@nitrostack/core';
import { DraftService } from './draft.service.js';
import { LLMDraftProvider } from './providers/llm.provider.js';
import { MockDraftProvider } from './providers/mock.provider.js';
import { AIModule } from '../../core/ai/ai.module.js';
import { DraftTools } from './draft.tools.js';

@Module({
  name: 'draft',
  description: 'Generates email drafts for qualified leads',
  imports: [AIModule],
  providers: [
    DraftService,
    LLMDraftProvider,
    MockDraftProvider
  ],
  controllers: [DraftTools],
  exports: [
    DraftService,
    LLMDraftProvider,
    MockDraftProvider
  ]
})
export class DraftModule {}
