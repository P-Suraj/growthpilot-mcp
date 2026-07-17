import { useState, useCallback, useRef } from 'react';
import type { Company, ResearchResult, QualificationScore, Draft, Critique, LogMessage } from '../types/index.js';
import { mockCompanies, mockResearch, mockQualifications, mockDrafts, mockCritiques } from '../lib/mockData.js';

export interface CampaignState {
  goal: string;
  status: 'idle' | 'planning' | 'discovering' | 'enriching' | 'qualifying' | 'drafting' | 'reviewing' | 'complete';
  progress: {
    planner: 'waiting' | 'running' | 'completed' | 'failed';
    discovery: 'waiting' | 'running' | 'completed' | 'failed';
    research: 'waiting' | 'running' | 'completed' | 'failed';
    qualification: 'waiting' | 'running' | 'completed' | 'failed';
    draft: 'waiting' | 'running' | 'completed' | 'failed';
    critic: 'waiting' | 'running' | 'completed' | 'failed';
  };
  companies: Company[];
  logs: LogMessage[];
  stats: {
    companiesFound: number;
    qualifiedLeads: number;
    avgScore: number;
    durationSec: number;
    cacheSavings: string;
  };
  activeCompanyId: string | null;
  researchResults: Record<string, ResearchResult>;
  qualificationScores: Record<string, QualificationScore>;
  drafts: Record<string, Draft>;
  critiques: Record<string, Critique>;
}

const initialState: CampaignState = {
  goal: '',
  status: 'idle',
  progress: {
    planner: 'waiting',
    discovery: 'waiting',
    research: 'waiting',
    qualification: 'waiting',
    draft: 'waiting',
    critic: 'waiting',
  },
  companies: [],
  logs: [],
  stats: {
    companiesFound: 0,
    qualifiedLeads: 0,
    avgScore: 0,
    durationSec: 0,
    cacheSavings: '0%',
  },
  activeCompanyId: null,
  researchResults: {},
  qualificationScores: {},
  drafts: {},
  critiques: {},
};

export function useCampaign() {
  const [state, setState] = useState<CampaignState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const addLog = useCallback((level: LogMessage['level'], module: LogMessage['module'], message: string) => {
    const newLog: LogMessage = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      level,
      module,
      message,
    };
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog],
    }));
  }, []);

  const runCampaign = useCallback(async (goal: string) => {
    // Reset state first
    setState({
      ...initialState,
      goal,
      status: 'planning',
      progress: {
        ...initialState.progress,
        planner: 'running',
      },
    });

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    // 1. Planner Stage
    addLog('info', 'planner', `Initializing outbound campaign planner...`);
    addLog('info', 'planner', `Parsing goal criteria: "${goal}"`);
    await sleep(1500);
    addLog('success', 'planner', `Campaign parameters extracted: targetIndustry="SaaS", targetLocation="Bangalore", minEmployees=20, maxEmployees=100`);
    addLog('info', 'planner', `Planned execution graph: Discovery -> Research -> Qualification -> Draft -> Critic`);
    
    setState(prev => ({
      ...prev,
      status: 'discovering',
      progress: { ...prev.progress, planner: 'completed', discovery: 'running' },
    }));

    // 2. Discovery Stage
    addLog('info', 'discovery', `[Google Places] [Cache Miss] Text Searching: "SaaS companies in Bangalore with 20-100 employees"`);
    await sleep(2000);
    addLog('info', 'discovery', `[Google Places] Returned 5 matching places. Mapping results...`);
    
    setState(prev => ({
      ...prev,
      status: 'enriching',
      companies: mockCompanies,
      stats: {
        ...prev.stats,
        companiesFound: mockCompanies.length,
        cacheSavings: '20%',
      },
      progress: { ...prev.progress, discovery: 'completed', research: 'running' },
    }));
    addLog('success', 'discovery', `Discovered ${mockCompanies.length} companies successfully.`);

    // 3. Research Stage (Tavily)
    addLog('info', 'research', `Enriching companies data via Tavily search...`);
    const tempResearch: Record<string, ResearchResult> = {};
    
    for (const comp of mockCompanies) {
      addLog('info', 'research', `[Tavily] Scraping online profiles for: ${comp.name}`);
      await sleep(1000);
      const res = mockResearch[comp.id];
      if (res) {
        tempResearch[comp.id] = res;
        addLog('success', 'research', `[Tavily] [Request Success] Profile built for ${comp.name} (${res.dataSources.length} sources linked)`);
      }
    }

    setState(prev => ({
      ...prev,
      status: 'qualifying',
      researchResults: tempResearch,
      progress: { ...prev.progress, research: 'completed', qualification: 'running' },
    }));

    // 4. Qualification Stage (Gemini)
    addLog('info', 'qualification', `Calculating qualification matrices using Gemini LLM...`);
    const tempQual: Record<string, QualificationScore> = {};
    let highCount = 0;
    let sumScore = 0;

    for (const comp of mockCompanies) {
      addLog('info', 'qualification', `[Gemini] Scoring alignment metrics for: ${comp.name}`);
      await sleep(800);
      const score = mockQualifications[comp.id];
      if (score) {
        tempQual[comp.id] = score;
        sumScore += score.score;
        if (score.tier === 'HIGH') highCount++;
        addLog('success', 'qualification', `[Gemini] Scored: ${score.score} | Tier: ${score.tier} for ${comp.name}`);
      }
    }

    const avgScore = sumScore / mockCompanies.length;

    setState(prev => ({
      ...prev,
      status: 'drafting',
      qualificationScores: tempQual,
      stats: {
        ...prev.stats,
        qualifiedLeads: highCount,
        avgScore: parseFloat(avgScore.toFixed(2)),
      },
      progress: { ...prev.progress, qualification: 'completed', draft: 'running' },
    }));

    // 5. Draft Stage (Gemini Draft)
    addLog('info', 'draft', `Generating highly personalized outreach email copy via Gemini...`);
    const tempDrafts: Record<string, Draft> = {};

    for (const comp of mockCompanies) {
      addLog('info', 'draft', `[Gemini] Designing draft structure for: ${comp.name}`);
      await sleep(800);
      const draft = mockDrafts[comp.id];
      if (draft) {
        tempDrafts[comp.id] = draft;
        addLog('success', 'draft', `[Gemini] Created draft version ${draft.version} for ${comp.name}`);
      }
    }

    setState(prev => ({
      ...prev,
      status: 'reviewing',
      drafts: tempDrafts,
      progress: { ...prev.progress, draft: 'completed', critic: 'running' },
    }));

    // 6. Critic Stage (Gemini Critic)
    addLog('info', 'critic', `Reviewing email drafts against quality rubrics...`);
    const tempCritiques: Record<string, Critique> = {};

    for (const comp of mockCompanies) {
      addLog('info', 'critic', `[Gemini] Auditing draft for: ${comp.name}`);
      await sleep(1000);
      const critic = mockCritiques[comp.id];
      if (critic) {
        tempCritiques[comp.id] = critic;
        if (!critic.approved) {
          addLog('warn', 'critic', `[Gemini] [Low Score: ${critic.score}] Draft for ${comp.name} requires revision: ${critic.issues[0]?.description}`);
          await sleep(1200);
          addLog('success', 'critic', `[Gemini] [Revised Version 2] Draft updated. Score improved to 0.90.`);
        } else {
          addLog('success', 'critic', `[Gemini] [Score: ${critic.score}] Draft approved for ${comp.name}`);
        }
      }
    }

    setState(prev => ({
      ...prev,
      status: 'complete',
      critiques: tempCritiques,
      progress: { ...prev.progress, critic: 'completed' },
      stats: {
        ...prev.stats,
        durationSec: 15,
      },
    }));
    addLog('success', 'planner', `Campaign process execution fully complete! 5 companies processed.`);
  }, [addLog]);

  const selectCompany = useCallback((companyId: string | null) => {
    setState(prev => ({
      ...prev,
      activeCompanyId: companyId,
    }));
  }, []);

  const updateDraft = useCallback((companyId: string, updatedBody: string) => {
    setState(prev => {
      const currentDraft = prev.drafts[companyId];
      if (!currentDraft) return prev;
      return {
        ...prev,
        drafts: {
          ...prev.drafts,
          [companyId]: {
            ...currentDraft,
            body: updatedBody,
            version: currentDraft.version + 1,
          },
        },
      };
    });
    addLog('info', 'draft', `User edited email draft for company ID: ${companyId}`);
  }, [addLog]);

  const approveDraft = useCallback((companyId: string) => {
    addLog('success', 'critic', `Outreach draft approved by user for company ID: ${companyId}. Email dispatched.`);
  }, [addLog]);

  return {
    state,
    runCampaign,
    selectCompany,
    updateDraft,
    approveDraft,
  };
}
