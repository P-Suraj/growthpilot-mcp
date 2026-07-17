import { LLMGenerateOptions } from './llm.types.js';

export abstract class LLMProvider {
  abstract readonly name: string;
  abstract generate(systemPrompt: string, userPrompt: string, options?: LLMGenerateOptions): Promise<string>;
}
