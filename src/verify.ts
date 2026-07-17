import { PlannerService } from './modules/planner/planner.service.js';
import { DiscoveryService } from './modules/discovery/discovery.service.js';
import { GooglePlacesProvider } from './modules/discovery/providers/google-places.provider.js';
import { MockProvider as MockDiscoveryProvider } from './modules/discovery/providers/mock.provider.js';
import { ResearchService } from './modules/research/research.service.js';
import { TavilyProvider } from './modules/research/providers/tavily.provider.js';
import { MockProvider as MockResearchProvider } from './modules/research/providers/mock.provider.js';

import { QualificationService } from './modules/qualification/qualification.service.js';
import { LLMQualificationProvider } from './modules/qualification/providers/llm.provider.js';
import { HeuristicProvider } from './modules/qualification/providers/heuristic.provider.js';

import { DraftService } from './modules/draft/draft.service.js';
import { LLMDraftProvider } from './modules/draft/providers/llm.provider.js';
import { MockDraftProvider } from './modules/draft/providers/mock.provider.js';

import { CriticService } from './modules/critic/critic.service.js';
import { LLMCriticProvider } from './modules/critic/providers/llm.provider.js';
import { MockCriticProvider } from './modules/critic/providers/mock.provider.js';

import { MockLLMProvider } from './core/ai/mock.provider.js';

async function runVerification() {
  console.log('🚀 Starting GrowthPilot Vertical Slice Verification...\n');

  const mockLLM = new MockLLMProvider();

  const planner = new PlannerService();
  const discovery = new DiscoveryService(new GooglePlacesProvider(), new MockDiscoveryProvider());
  const researchService = new ResearchService(new TavilyProvider(), new MockResearchProvider());
  const qualification = new QualificationService(new LLMQualificationProvider(mockLLM), new HeuristicProvider());
  const draftService = new DraftService(new LLMDraftProvider(mockLLM), new MockDraftProvider());
  const critic = new CriticService(new LLMCriticProvider(mockLLM), new MockCriticProvider());

  const goal = 'Find SaaS companies in Bangalore with 20-100 employees';
  console.log(`[Input Goal]: "${goal}"`);

  // 1. Planner
  console.log('\n--- 1. Planner ---');
  const campaign = await planner.plan(goal);
  console.log('Campaign Object:', JSON.stringify(campaign, null, 2));

  // 2. Discovery
  console.log('\n--- 2. Discovery ---');
  const companies = await discovery.discover(campaign);
  console.log(`Discovered ${companies.length} companies:`);
  companies.forEach(c => console.log(` - ${c.name} (Location: ${c.location}, Employees: ${c.employeeCount})`));

  console.log('\n--- 2b. Discovery Cache Verification ---');
  const cachedCompanies = await discovery.discover(campaign);
  console.log(`Retrieved ${cachedCompanies.length} companies from cache.`);

  // Loop through companies
  console.log('\n--- Pipeline Loop ---');
  for (const company of companies) {
    console.log(`\nProcessing Company: ${company.name}`);

    // 3. Research
    const research = await researchService.research(company);
    console.log(` > Research website: ${research.website}`);
    console.log(` > Research desc: ${research.description}`);

    // 4. Qualification
    const score = await qualification.qualify(company, research, campaign);
    console.log(` > Qualification Score: ${score.score} | Tier: ${score.tier}`);
    console.log(` > Qualification Reasoning: ${score.reasoning}`);

    // 5. Draft
    let draft = await draftService.generateDraft(company, research, score, campaign.goal);
    console.log(` > Initial Draft Subject: ${draft.emailSubject}`);
    console.log(` > Initial Draft Version: ${draft.version}`);

    // 6. Critic
    let critique = await critic.critique(draft);
    console.log(` > Critique Score: ${critique.score}`);
    if (critique.issues.length > 0) {
      console.log(` > Critique Issues: ${critique.issues.join(', ')}`);
      console.log(` > Critique Suggestions: ${critique.suggestions.join(', ')}`);
    }

    // Revise once if score is low
    if (critique.score < 0.8) {
      console.log(` >> Draft scored below threshold. Revising...`);
      draft = await critic.revise(draft, critique);
      critique = await critic.critique(draft);
      console.log(` >> Revised Draft Subject: ${draft.emailSubject}`);
      console.log(` >> Revised Draft Version: ${draft.version}`);
      console.log(` >> Revised Critique Score: ${critique.score}`);
      if (critique.issues.length > 0) {
        console.log(` >> Remaining Issues: ${critique.issues.join(', ')}`);
      } else {
        console.log(` >> All issues resolved successfully!`);
      }
    }
  }

  // Let's manually run a test for the revision logic to show the Critic loop in action!
  console.log('\n--- 3. Testing Critic Revision Loop ---');
  const dummyCompany = companies[0];
  const dummyResearch = await researchService.research(dummyCompany);
  const dummyScore = await qualification.qualify(dummyCompany, dummyResearch, campaign);
  
  // Create a draft with placeholders
  const badDraft = {
    companyId: dummyCompany.id,
    emailSubject: 'Question for [Name]',
    emailBody: 'Hi [Name],\n\nI want to connect.\n\nBest,\n[Your Name]',
    version: 1
  };
  
  console.log('Bad Draft Body:\n' + badDraft.emailBody);
  let badCritique = await critic.critique(badDraft);
  console.log(`Initial Critique Score: ${badCritique.score}`);
  console.log(`Critique Issues: ${badCritique.issues.join(', ')}`);
  
  if (badCritique.score < 0.8) {
    console.log(`Draft scored below threshold (0.8). Revising...`);
    const fixedDraft = await critic.revise(badDraft, badCritique);
    const fixedCritique = await critic.critique(fixedDraft);
    console.log('Revised Draft Body:\n' + fixedDraft.emailBody);
    console.log(`Revised Critique Score: ${fixedCritique.score}`);
  }

  console.log('\n✅ Verification Complete! End-to-end vertical slice runs successfully with zero errors.');
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
