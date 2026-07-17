import { Module } from '@nitrostack/core';
import { LLMProvider } from './llm.provider.js';
import { GeminiProvider } from './gemini.provider.js';
import { MockLLMProvider } from './mock.provider.js';

const isGeminiEnabled = !!process.env.GEMINI_API_KEY;

@Module({
  name: 'ai',
  description: 'Shared AI LLM core services',
  providers: [
    GeminiProvider,
    MockLLMProvider,
    {
      provide: LLMProvider as any,
      useClass: isGeminiEnabled ? GeminiProvider : MockLLMProvider,
    },
  ],
  exports: [
    LLMProvider as any,
    GeminiProvider,
    MockLLMProvider,
  ],
})
export class AIModule {}
