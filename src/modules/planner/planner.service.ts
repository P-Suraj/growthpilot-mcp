import { Injectable } from '@nitrostack/core';
import { Campaign, CampaignSearchSpec } from '../shared/models.js';
import { LIVE_MODE } from '../../core/ai/api-protection.js';

// ---------------------------------------------------------------------------
// Mapping table: product / use-case keywords → best Google Place type
// ---------------------------------------------------------------------------
const PRODUCT_TO_PLACE_TYPE: Array<{
  keywords: string[];
  placeType: string;
  industry: string;
  rejectKeywords: string[];
  rejectPlaceTypes: string[];
}> = [
  {
    keywords: ['laptop', 'computer', 'pc', 'desktop', 'notebook', 'macbook'],
    placeType: 'computer_store',
    industry: 'Electronics',
    rejectKeywords: ['fashion', 'fruit', 'salon', 'repair', 'service center', 'beauty', 'clothes', 'garments'],
    rejectPlaceTypes: ['clothing_store', 'beauty_salon', 'hair_care', 'restaurant'],
  },
  {
    keywords: ['phone', 'mobile', 'smartphone', 'iphone', 'android'],
    placeType: 'electronics_store',
    industry: 'Electronics',
    rejectKeywords: ['fashion', 'fruit', 'salon', 'repair only', 'service center', 'beauty'],
    rejectPlaceTypes: ['clothing_store', 'beauty_salon', 'restaurant'],
  },
  {
    keywords: ['apple', 'macbook', 'ipad', 'iphone', 'airpods'],
    placeType: 'electronics_store',
    industry: 'Electronics',
    rejectKeywords: ['fruit', 'juice', 'farm', 'orchard', 'grocery', 'vegetable'],
    rejectPlaceTypes: ['grocery_store', 'supermarket', 'restaurant', 'food'],
  },
  {
    keywords: ['software', 'saas', 'crm', 'erp', 'cloud', 'app'],
    placeType: 'establishment',
    industry: 'SaaS',
    rejectKeywords: ['fashion', 'salon', 'restaurant', 'grocery'],
    rejectPlaceTypes: ['clothing_store', 'beauty_salon', 'restaurant'],
  },
  {
    keywords: ['cafe', 'coffee', 'bakery'],
    placeType: 'cafe',
    industry: 'Food & Beverage',
    rejectKeywords: ['tech', 'electronics'],
    rejectPlaceTypes: ['electronics_store'],
  },
  {
    keywords: ['restaurant', 'food', 'hotel', 'dining'],
    placeType: 'restaurant',
    industry: 'Food & Beverage',
    rejectKeywords: [],
    rejectPlaceTypes: [],
  },
  {
    keywords: ['print', 'printing', 'banner', 'flex', 'stationery'],
    placeType: 'store',
    industry: 'Printing',
    rejectKeywords: ['fashion', 'salon', 'restaurant'],
    rejectPlaceTypes: ['clothing_store', 'beauty_salon'],
  },
];

// ---------------------------------------------------------------------------
// Location extraction — handles "near", "in", "around", "close to"
// ---------------------------------------------------------------------------
function extractLocation(goal: string): { city: string; state: string } {
  // Patterns: "near X", "in X", "around X", "close to X", "at X"
  const patterns = [
    /(?:near|in|around|at|close\s+to)\s+([A-Za-z\s]+?)(?:\s*,\s*([A-Za-z\s]+?))?(?:\s+with|\s+having|\s+for|$)/i,
    /([A-Za-z]+),\s*([A-Za-z]+)/i,
  ];

  for (const pattern of patterns) {
    const match = goal.match(pattern);
    if (match) {
      const city = match[1]?.trim() || 'India';
      const state = match[2]?.trim() || '';
      return { city, state };
    }
  }
  return { city: 'India', state: '' };
}

// ---------------------------------------------------------------------------
// Employee range extraction
// ---------------------------------------------------------------------------
function extractEmployeeRange(goal: string): { min: number; max: number } {
  const rangeMatch = goal.match(/(\d+)\s*(?:-|to)\s*(\d+)\s+employees/i);
  if (rangeMatch) return { min: parseInt(rangeMatch[1], 10), max: parseInt(rangeMatch[2], 10) };

  const gtMatch = goal.match(/(?:more than|>)\s*(\d+)\s+employees/i);
  if (gtMatch) return { min: parseInt(gtMatch[1], 10), max: 1000 };

  return { min: 0, max: 1000 };
}

// ---------------------------------------------------------------------------
// Heuristic fallback (no Gemini required)
// ---------------------------------------------------------------------------
function buildSearchSpecHeuristic(goal: string): CampaignSearchSpec {
  const goalLower = goal.toLowerCase();
  const { city, state } = extractLocation(goal);

  // Find best matching rule
  let matched = PRODUCT_TO_PLACE_TYPE.find(rule =>
    rule.keywords.some(kw => goalLower.includes(kw))
  );

  if (!matched) {
    // Generic fallback
    matched = {
      keywords: [],
      placeType: 'establishment',
      industry: 'Business',
      rejectKeywords: [],
      rejectPlaceTypes: [],
    };
  }

  return {
    product: goal,
    industry: matched.industry,
    googlePlaceType: matched.placeType,
    targetBusinesses: [`${matched.industry} store in ${city}`, `${matched.industry} dealer`],
    city,
    state,
    radiusMeters: 20000,
    rejectKeywords: matched.rejectKeywords,
    rejectPlaceTypes: matched.rejectPlaceTypes,
  };
}

// ---------------------------------------------------------------------------
// Gemini extraction prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a B2B campaign intent parser. Extract structured JSON from the user's sales goal.

Return ONLY a valid JSON object with this exact shape:
{
  "product": "short product name, e.g. Laptop",
  "industry": "target industry label, e.g. Electronics",
  "googlePlaceType": "ONE Google Places type from this list: computer_store | electronics_store | clothing_store | restaurant | cafe | store | hardware_store | car_dealer | real_estate_agency | travel_agency | school | hospital | gym | establishment",
  "targetBusinesses": ["3-5 textual search phrases like 'Computer Store', 'Laptop Dealer', 'Electronics Shop'"],
  "city": "city name only, e.g. Amritapuri",
  "state": "state or region, e.g. Kerala",
  "radiusMeters": 20000,
  "rejectKeywords": ["words found in wrong-match business names, e.g. Fashion, Salon, Repair, Fruit, Service Center, Grocery"],
  "rejectPlaceTypes": ["Google place types that indicate a wrong match, e.g. clothing_store, beauty_salon, restaurant"]
}

Rules:
- If the product is "Apple" and context is electronics, rejectKeywords MUST include "fruit", "juice", "grocery"
- If the product is laptop/computer, googlePlaceType MUST be "computer_store" NOT "electronics_store"
- Be conservative with rejectKeywords — only add words that clearly indicate the WRONG business
- radiusMeters default: 20000 (20 km). Use 5000 for hyper-local, 50000 for metro-wide
- Do NOT output any explanation or markdown, only raw JSON`;

@Injectable()
export class PlannerService {
  async plan(goal: string): Promise<Campaign> {
    const id = `camp-${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();
    const { min: minEmployees, max: maxEmployees } = extractEmployeeRange(goal);

    // Build the searchSpec
    let searchSpec: CampaignSearchSpec;

    if (LIVE_MODE && process.env.GEMINI_API_KEY) {
      try {
        searchSpec = await this.extractWithGemini(goal);
        console.log(`[Planner] Gemini extracted spec:`, JSON.stringify(searchSpec));
      } catch (err: any) {
        console.warn(`[Planner] Gemini extraction failed: ${err.message}. Using heuristic fallback.`);
        searchSpec = buildSearchSpecHeuristic(goal);
      }
    } else {
      searchSpec = buildSearchSpecHeuristic(goal);
      console.log(`[Planner] Heuristic spec built:`, JSON.stringify(searchSpec));
    }

    return {
      id,
      goal,
      createdAt,
      // Legacy flat fields — derived from searchSpec for backward compat
      targetIndustry: searchSpec.industry,
      targetLocation: searchSpec.city,
      minEmployees,
      maxEmployees,
      // Structured spec used by Discovery and Validator
      searchSpec,
    };
  }

  // --------------------------------------------------------------------------
  // Gemini call — returns a strongly-typed CampaignSearchSpec
  // --------------------------------------------------------------------------
  private async extractWithGemini(goal: string): Promise<CampaignSearchSpec> {
    const apiKey = process.env.GEMINI_API_KEY!;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `System Instructions: ${SYSTEM_PROMPT}\n\nUser Input: ${goal}` }],
        },
      ],
      generationConfig: {
        temperature: 0.0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            product:           { type: 'STRING' },
            industry:          { type: 'STRING' },
            googlePlaceType:   { type: 'STRING' },
            targetBusinesses:  { type: 'ARRAY', items: { type: 'STRING' } },
            city:              { type: 'STRING' },
            state:             { type: 'STRING' },
            radiusMeters:      { type: 'INTEGER' },
            rejectKeywords:    { type: 'ARRAY', items: { type: 'STRING' } },
            rejectPlaceTypes:  { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['product', 'industry', 'googlePlaceType', 'targetBusinesses', 'city', 'state', 'radiusMeters', 'rejectKeywords', 'rejectPlaceTypes'],
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = (await response.json()) as any;
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned empty response');

    // Gemini returns JSON directly when responseMimeType is application/json
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`Gemini returned non-JSON: ${text.substring(0, 200)}`);
    }

    // Validate required fields exist
    const required: (keyof CampaignSearchSpec)[] = ['product', 'industry', 'googlePlaceType', 'targetBusinesses', 'city', 'state', 'radiusMeters', 'rejectKeywords', 'rejectPlaceTypes'];
    for (const field of required) {
      if (parsed[field] === undefined) {
        throw new Error(`Gemini response missing field: ${field}`);
      }
    }

    return parsed as CampaignSearchSpec;
  }
}
