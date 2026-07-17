import { Injectable } from '@nitrostack/core';
import { ResearchProvider } from './research.provider.js';
import { Company, ResearchResult } from '../../shared/models.js';

@Injectable()
export class TavilyProvider extends ResearchProvider {
  readonly name = 'tavily';

  async research(company: Company): Promise<ResearchResult> {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error('TAVILY_API_KEY is not configured in environment variables');
    }

    const searchQuery = `"${company.name}" ${company.location} ${company.industry} official website social links description`;
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: searchQuery,
        search_depth: 'advanced',
        include_answer: true,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Tavily API error: status ${response.status} - ${errText}`);
    }

    const data = (await response.json()) as {
      results?: { title: string; url: string; content: string; score: number }[];
      answer?: string;
    };

    const results = data.results || [];
    const answer = data.answer || '';

    // 1. Determine website
    // Prioritize existing website from discovery, otherwise find first non-directory URL
    let website = company.website || null;
    if (!website) {
      const candidate = results.find(r => 
        !r.url.includes('linkedin.com') && 
        !r.url.includes('facebook.com') && 
        !r.url.includes('twitter.com') && 
        !r.url.includes('x.com') && 
        !r.url.includes('crunchbase.com') && 
        !r.url.includes('justdial.com') && 
        !r.url.includes('indiamart.com')
      );
      if (candidate) {
        website = candidate.url;
      }
    }

    // 2. Parse social links
    const socialLinks: Record<string, string> = {};
    results.forEach(r => {
      if (r.url.includes('linkedin.com/company/') || r.url.includes('linkedin.com/in/')) {
        socialLinks.linkedin = r.url;
      } else if (r.url.includes('x.com/') || r.url.includes('twitter.com/')) {
        socialLinks.x = r.url;
      } else if (r.url.includes('facebook.com/')) {
        socialLinks.facebook = r.url;
      }
    });

    // 3. Build description and summary
    let description = '';
    if (answer) {
      description = answer;
    } else if (results.length > 0) {
      description = results.map(r => r.content).slice(0, 3).join(' ');
    } else {
      description = `Information gathered about ${company.name} in ${company.location} specializing in ${company.industry}.`;
    }

    const summary = `Found ${company.name} in ${company.location}. Official website is ${website || 'unknown'}.`;
    const timestamp = new Date().toISOString();

    return {
      companyId: company.id,
      website: website || '',
      description: description,
      industry: company.industry,
      employeeCount: company.employeeCount,
      confidence: 0.9,
      normalized: {
        website: { value: website, source: 'tavily', confidence: website ? 0.95 : 0 },
        description: { value: description, source: 'tavily', confidence: 0.9 },
        summary: { value: summary, source: 'tavily', confidence: 0.95 },
        industry: { value: company.industry, source: 'tavily', confidence: 0.95 },
        companyType: { value: 'Private', source: 'tavily', confidence: 0.7 },
        socialLinks: { value: socialLinks, source: 'tavily', confidence: 0.8 },
        confidence: { value: 0.9, source: 'tavily', confidence: 1.0 },
        timestamp: { value: timestamp, source: 'tavily', confidence: 1.0 },
      },
    };
  }
}
