import { Module } from '@nitrostack/core';
import { ResearchService } from './research.service.js';
import { TavilyProvider } from './providers/tavily.provider.js';
import { MockProvider } from './providers/mock.provider.js';
import { ResearchTools } from './research.tools.js';

@Module({
  name: 'research',
  description: 'Gathers research details for companies',
  providers: [
    ResearchService,
    TavilyProvider,
    MockProvider
  ],
  controllers: [ResearchTools],
  exports: [
    ResearchService,
    TavilyProvider,
    MockProvider
  ]
})
export class ResearchModule {}
