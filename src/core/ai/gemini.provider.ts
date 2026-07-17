import { Injectable } from '@nitrostack/core';
import { LLMProvider } from './llm.provider.js';
import { LLMGenerateOptions } from './llm.types.js';

@Injectable()
export class GeminiProvider extends LLMProvider {
  readonly name = 'gemini';

  async generate(systemPrompt: string, userPrompt: string, options?: LLMGenerateOptions): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    // Endpoint for Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const contents = [
      {
        role: 'user',
        parts: [
          { text: `System Instructions: ${systemPrompt}\n\nUser Input: ${userPrompt}` }
        ]
      }
    ];

    const generationConfig: any = {
      temperature: 0.1,
    };

    // Configure Gemini to output JSON if schema is provided
    if (options?.responseSchema) {
      generationConfig.responseMimeType = 'application/json';
      generationConfig.responseSchema = options.responseSchema;
    }

    const payload = {
      contents,
      generationConfig,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API request failed: status ${response.status} - ${errText}`);
    }

    const data = (await response.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini API returned an empty or invalid response');
    }

    return text;
  }
}
