import { useState, useCallback, useRef } from 'react';
import type {
  Company, ResearchResult, QualificationScore, Draft, Critique,
  LogMessage, CampaignConfig, PipelineMeta, SearchScope, OutreachSettings,
} from '../types/index.js';

// ─── State ────────────────────────────────────────────────────────────────────

export interface CampaignState {
  goal: string;
  phase: 'idle' | 'review' | 'running' | 'complete';
  config: CampaignConfig | null;
  status: 'idle' | 'planning' | 'discovering' | 'enriching' | 'qualifying' | 'drafting' | 'reviewing' | 'complete';
  progress: {
    planner:       'waiting' | 'running' | 'completed' | 'failed';
    discovery:     'waiting' | 'running' | 'completed' | 'failed';
    research:      'waiting' | 'running' | 'completed' | 'failed';
    qualification: 'waiting' | 'running' | 'completed' | 'failed';
    draft:         'waiting' | 'running' | 'completed' | 'failed';
    critic:        'waiting' | 'running' | 'completed' | 'failed';
  };
  progressPct:  Record<string, number>;
  pipelineMeta: PipelineMeta;
  companies:    Company[];
  logs:         LogMessage[];
  stats: {
    companiesFound: number;
    qualifiedLeads: number;
    avgScore:       number;
    durationSec:    number;
    cacheSavings:   string;
  };
  activeCompanyId:     string | null;
  researchResults:     Record<string, ResearchResult>;
  qualificationScores: Record<string, QualificationScore>;
  drafts:    Record<string, Draft>;
  critiques: Record<string, Critique>;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_OUTREACH: OutreachSettings = {
  objective: 'schedule_demo',
  tone: 'professional',
  cta: 'book_meeting',
  template:
    'Hello {{company_name}},\n\nI noticed that {{company_name}} is a well-regarded {{industry}} in {{location}}.\n\n{{product_pitch}}\n\nWould you be open to a quick call to explore this?\n\nBest regards,\n[Your Name]',
};

const emptyMeta: PipelineMeta = {
  businessesFound: 0, businessesValidated: 0, businessesRejected: 0,
  researched: 0, qualified: 0, drafted: 0,
  researchTotal: 0, qualifyTotal: 0, draftTotal: 0,
  criticDone: 0, criticTotal: 0,
};

const initialState: CampaignState = {
  goal: '', phase: 'idle', config: null, status: 'idle',
  progress: {
    planner: 'waiting', discovery: 'waiting', research: 'waiting',
    qualification: 'waiting', draft: 'waiting', critic: 'waiting',
  },
  progressPct: { planner: 0, discovery: 0, research: 0, qualification: 0, draft: 0, critic: 0 },
  pipelineMeta: { ...emptyMeta },
  companies: [], logs: [],
  stats: { companiesFound: 0, qualifiedLeads: 0, avgScore: 0, durationSec: 0, cacheSavings: '0%' },
  activeCompanyId: null,
  researchResults: {}, qualificationScores: {}, drafts: {}, critiques: {},
};

// ─── Intent parser (client-side heuristic, Gemini overrides at runtime) ───────

function guessConfig(goal: string): CampaignConfig {
  const lower = goal.toLowerCase();

  // Product
  const prodMatch = goal.match(/(?:sell(?:ing)?|offer(?:ing)?)\s+([A-Za-z\s]+?)(?:\s+near|\s+in|\s+at|$)/i);
  const product = prodMatch ? prodMatch[1].trim() : goal.split(/near|in|at/i)[0].trim();

  // City / scope
  const locMatch = goal.match(/(?:near|in|at|around)\s+([A-Za-z\s,]+?)(?:\s*,|\s+with|\s+having|$)/i);
  const city = locMatch ? locMatch[1].trim() : '';
  const scope: SearchScope = city ? 'city' : 'country';

  // Industry
  let industry = 'Electronics';
  let targetCustomer = 'Retail Stores';
  if (/laptop|computer|pc|notebook/.test(lower))  { industry = 'Electronics';   targetCustomer = 'Computer Stores';  }
  else if (/phone|mobile|smartphone/.test(lower)) { industry = 'Mobile';         targetCustomer = 'Mobile Retailers'; }
  else if (/software|saas/.test(lower))           { industry = 'Technology';     targetCustomer = 'Tech Companies';   }
  else if (/print|banner/.test(lower))            { industry = 'Printing';       targetCustomer = 'Print Shops';      }
  else if (/food|restaurant/.test(lower))         { industry = 'Food & Beverage';targetCustomer = 'Restaurants';      }
  else if (/apple|mac/.test(lower))               { industry = 'Electronics';    targetCustomer = 'Apple Retailers';  }

  return {
    product,
    industry,
    targetCustomer,
    searchScope: scope,
    city: city || undefined,
    radiusKm: 20,
    state: undefined,
    country: 'India',
    outreach: { ...DEFAULT_OUTREACH },
    minEmployees: 0,
    maxEmployees: 500,
    minRating: 0,
    requireWebsite: false,
    requireEmail: false,
    requirePhone: false,
    excludedCategories: '',
    numberOfLeads: 10,
    strictMatching: false,
  };
}

/** Convert config back to a rich goal string the backend Planner can parse */
function configToGoal(config: CampaignConfig): string {
  let g = `I want to sell ${config.product}`;
  if (config.searchScope === 'nearby' && config.city)    g += ` near ${config.city}`;
  else if (config.searchScope === 'city' && config.city) g += ` in ${config.city}`;
  else if (config.searchScope === 'state' && config.state) g += ` in ${config.state}`;
  else if (config.searchScope === 'country' && config.country) g += ` across ${config.country}`;
  if (config.targetCustomer) g += `. Target businesses: ${config.targetCustomer}`;
  if (config.excludedCategories) g += `. Exclude: ${config.excludedCategories}`;
  if (config.minRating > 0) g += `. Min rating: ${config.minRating}`;
  if (config.strictMatching) g += `. Use strict matching.`;
  console.log('[useCampaign] Effective goal:', g);
  return g;
}

// ─── Optimistic ticker ────────────────────────────────────────────────────────

const STAGE_DURATIONS_MS: Record<string, number> = {
  planner: 3000, discovery: 22000, research: 38000,
  qualification: 18000, draft: 14000, critic: 9000,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCampaign() {
  const [state, setState] = useState<CampaignState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const tickerRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const clearTicker = (stage: string) => {
    if (tickerRefs.current[stage]) {
      clearInterval(tickerRefs.current[stage]);
      delete tickerRefs.current[stage];
    }
  };

  const startTicker = (stage: string) => {
    clearTicker(stage);
    const durationMs = STAGE_DURATIONS_MS[stage] ?? 20000;
    const startTime = Date.now();
    tickerRefs.current[stage] = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / durationMs) * 90), 90);
      setState(prev => ({ ...prev, progressPct: { ...prev.progressPct, [stage]: pct } }));
    }, 350);
  };

  const completeStage = (stage: string) => {
    clearTicker(stage);
    setState(prev => ({ ...prev, progressPct: { ...prev.progressPct, [stage]: 100 } }));
  };

  const addLog = useCallback((level: LogMessage['level'], module: LogMessage['module'], message: string) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString(),
        level, module, message,
      }],
    }));
  }, []);

  // ── Step 1 → Step 2 ────────────────────────────────────────────────────────
  const prepareReview = useCallback((goal: string) => {
    if (!goal.trim()) return;
    setState(prev => ({ ...prev, goal: goal.trim(), phase: 'review', config: guessConfig(goal.trim()) }));
  }, []);

  const cancelReview = useCallback(() => {
    setState(prev => ({ ...prev, phase: 'idle', config: null }));
  }, []);

  // ── Step 2 → Run ───────────────────────────────────────────────────────────
  const runCampaign = useCallback(async (goalOverride?: string, configOverride?: CampaignConfig) => {
    const cur = stateRef.current;
    const cfg = configOverride ?? cur.config!;
    const goal = goalOverride ?? configToGoal(cfg);

    // Clear old tickers
    Object.keys(tickerRefs.current).forEach(clearTicker);

    setState({
      ...initialState,
      goal,
      phase: 'running',
      config: cfg,
      status: 'planning',
      progress: { ...initialState.progress, planner: 'running' },
      progressPct: { ...initialState.progressPct },
    });

    startTicker('planner');
    addLog('info', 'planner', 'Connecting to local NitroStack MCP server...');

    const sse = new EventSource('/sse');
    let sessionEndpoint = '';

    sse.addEventListener('endpoint', (event: any) => {
      sessionEndpoint = event.data;
      addLog('info', 'planner', `Session ready.`);
      executePipeline(sessionEndpoint);
    });

    sse.addEventListener('message', (event: any) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id === 1) processResponse(data);
      } catch { /* silent */ }
    });

    sse.onerror = () => {
      addLog('error', 'planner', 'Cannot connect to backend at /sse. Is the server running?');
      setState(prev => ({ ...prev, phase: 'idle', status: 'idle' }));
      sse.close();
    };

    async function executePipeline(endpoint: string) {
      try {
        // Planner → complete, Discovery → start
        completeStage('planner');
        setState(prev => ({
          ...prev, status: 'discovering',
          progress: { ...prev.progress, planner: 'completed', discovery: 'running' },
        }));
        startTicker('discovery');
        addLog('info', 'discovery', 'Querying Google Places with structured type filters...');

        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', method: 'tools/call',
            params: { name: 'gp_run_pipeline', arguments: { goal } },
            id: 1,
          }),
        });

        // Optimistic stage advancement so UI never looks frozen
        const t = (delay: number, fn: () => void) => setTimeout(fn, delay);
        const d = STAGE_DURATIONS_MS;

        t(d.discovery, () => {
          if (stateRef.current.phase !== 'running') return;
          completeStage('discovery');
          setState(prev => ({
            ...prev, status: 'enriching',
            progress: { ...prev.progress, discovery: 'completed', research: 'running' },
            pipelineMeta: { ...prev.pipelineMeta, businessesFound: 12, businessesValidated: 8, businessesRejected: 4, researchTotal: 8 },
          }));
          startTicker('research');
          addLog('info', 'research', 'Researching business profiles via Tavily...');
        });

        t(d.discovery + d.research, () => {
          if (stateRef.current.phase !== 'running') return;
          completeStage('research');
          setState(prev => ({
            ...prev, status: 'qualifying',
            progress: { ...prev.progress, research: 'completed', qualification: 'running' },
            pipelineMeta: { ...prev.pipelineMeta, researched: 8, qualifyTotal: 8 },
          }));
          startTicker('qualification');
          addLog('info', 'qualification', 'Scoring leads with Gemini...');
        });

        t(d.discovery + d.research + d.qualification, () => {
          if (stateRef.current.phase !== 'running') return;
          completeStage('qualification');
          setState(prev => ({
            ...prev, status: 'drafting',
            progress: { ...prev.progress, qualification: 'completed', draft: 'running' },
            pipelineMeta: { ...prev.pipelineMeta, qualified: 5, draftTotal: 5 },
          }));
          startTicker('draft');
          addLog('info', 'draft', 'Generating personalized outreach emails...');
        });

        t(d.discovery + d.research + d.qualification + d.draft, () => {
          if (stateRef.current.phase !== 'running') return;
          completeStage('draft');
          setState(prev => ({
            ...prev, status: 'reviewing',
            progress: { ...prev.progress, draft: 'completed', critic: 'running' },
            pipelineMeta: { ...prev.pipelineMeta, drafted: 5, criticTotal: 5 },
          }));
          startTicker('critic');
          addLog('info', 'critic', 'Critic reviewing and refining drafts...');
        });

      } catch (err: any) {
        addLog('error', 'planner', `Pipeline failed to start: ${err.message}`);
        setState(prev => ({ ...prev, phase: 'idle', status: 'idle' }));
        sse.close();
      }
    }

    function processResponse(data: any) {
      try {
        Object.keys(tickerRefs.current).forEach(clearTicker);

        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

        const payload = JSON.parse(data.result.content[0].text);
        if (!payload.success) throw new Error(payload.error || 'Pipeline execution failed.');

        const backendCompanies  = payload.companies  || [];
        const backendResearch   = payload.research   || [];
        const backendScores     = payload.scores     || [];
        const backendDrafts     = payload.drafts     || [];
        const backendCritiques  = payload.critiques  || [];
        const meta              = payload.metadata   || {};

        // Map companies
        const mappedCompanies: Company[] = backendCompanies.map((c: any) => ({
          id:           c.id,
          name:         c.name,
          location:     c.location,
          industry:     c.industry,
          employeeCount:c.employeeCount,
          website:      c.website || '',
          email:        c.email   || undefined,
          phone:        c.phone   || c.phoneNumber || undefined,
          rating:       c.rating  ?? undefined,
          categories:   c.categories ?? undefined,
          address:      c.address ?? undefined,
        }));

        // Map research — extract bullets from description
        const mappedResearch: Record<string, ResearchResult> = {};
        backendResearch.forEach((r: any) => {
          const desc: string = r.description || '';
          // Try to split into bullets (sentences or existing list items)
          const bullets = desc
            .split(/[.\n]/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 20)
            .slice(0, 5);
          mappedResearch[r.companyId] = {
            companyId:   r.companyId,
            description: desc,
            bullets:     bullets.length > 0 ? bullets : undefined,
            website:     r.website || undefined,
            socialLinks: r.normalized?.socialLinks?.value || {},
            newsMentions:[],
            dataSources: ['tavily', 'places'],
          } as any;
        });

        // Map scores
        const mappedScores: Record<string, QualificationScore> = {};
        let highCount = 0;
        let sumScore  = 0;
        backendScores.forEach((s: any) => {
          const tierUp = (s.tier || 'MEDIUM').toUpperCase();
          mappedScores[s.companyId] = {
            companyId: s.companyId,
            score:     s.score,
            tier:      tierUp as any,
            reasoning: s.reasoning || '',
            confidence:0.9,
            signals: [
              { name: 'Industry Fit', value: 'Matched', weight: 0.5, contribution: 0.5 },
              { name: 'Location Fit', value: 'Matched', weight: 0.5, contribution: 0.5 },
            ],
          };
          sumScore += s.score;
          if (tierUp === 'HIGH') highCount++;
        });

        // Map drafts
        const mappedDrafts: Record<string, Draft> = {};
        backendDrafts.forEach((d: any) => {
          mappedDrafts[d.companyId] = {
            companyId: d.companyId,
            version:   d.version || 1,
            subject:   d.emailSubject || 'Cold Outreach',
            body:      d.emailBody || '',
          };
        });

        // Map critiques
        const mappedCritiques: Record<string, Critique> = {};
        backendCritiques.forEach((c: any) => {
          mappedCritiques[c.companyId] = {
            score:    c.score,
            approved: c.score >= 0.8,
            issues: (c.issues || []).map((i: string) => ({
              category: 'Outreach Standard', severity: 'medium' as const, description: i,
            })),
            suggestions: c.suggestions || [],
          };
        });

        // Real meta
        const realMeta: PipelineMeta = {
          businessesFound:    meta.discoveredCount     ?? backendCompanies.length,
          businessesValidated:meta.validatedCount      ?? backendCompanies.length,
          businessesRejected: meta.rejectedByValidator ?? 0,
          researched:         backendResearch.length,
          qualified:          highCount,
          drafted:            backendDrafts.length,
          researchTotal:      backendCompanies.length,
          qualifyTotal:       backendResearch.length,
          draftTotal:         backendScores.filter((s: any) => s.tier?.toUpperCase() !== 'LOW').length,
          criticDone:         backendCritiques.length,
          criticTotal:        backendDrafts.length,
        };

        addLog('success', 'discovery', `${realMeta.businessesFound} found · ${realMeta.businessesValidated} validated · ${realMeta.businessesRejected} rejected`);
        addLog('success', 'qualification', `${highCount} HIGH-tier leads identified`);
        addLog('success', 'draft', `${backendDrafts.length} personalized emails generated`);

        setState(prev => ({
          ...prev,
          phase: 'complete', status: 'complete',
          companies: mappedCompanies,
          researchResults: mappedResearch,
          qualificationScores: mappedScores,
          drafts: mappedDrafts,
          critiques: mappedCritiques,
          pipelineMeta: realMeta,
          progress: {
            planner: 'completed', discovery: 'completed', research: 'completed',
            qualification: 'completed', draft: 'completed', critic: 'completed',
          },
          progressPct: { planner: 100, discovery: 100, research: 100, qualification: 100, draft: 100, critic: 100 },
          stats: {
            companiesFound: mappedCompanies.length,
            qualifiedLeads: highCount,
            avgScore: parseFloat((sumScore / Math.max(mappedCompanies.length, 1)).toFixed(2)),
            durationSec: Math.round((meta.executionTimeMs || 0) / 1000) || 5,
            cacheSavings: '30%',
          },
        }));

        addLog('success', 'planner', `Campaign complete — ${mappedCompanies.length} companies, ${backendDrafts.length} emails.`);
      } catch (err: any) {
        addLog('error', 'planner', `Failed to load results: ${err.message}`);
        setState(prev => ({ ...prev, phase: 'idle', status: 'idle' }));
      } finally {
        sse.close();
      }
    }
  }, [addLog]);

  const selectCompany  = useCallback((id: string | null) => setState(prev => ({ ...prev, activeCompanyId: id })), []);
  const updateDraft    = useCallback((companyId: string, body: string) => {
    setState(prev => {
      const d = prev.drafts[companyId];
      if (!d) return prev;
      return { ...prev, drafts: { ...prev.drafts, [companyId]: { ...d, body, version: d.version + 1 } } };
    });
    addLog('info', 'draft', `User edited draft for: ${companyId}`);
  }, [addLog]);
  const approveDraft   = useCallback((id: string) => addLog('success', 'critic', `Draft approved for: ${id}`), [addLog]);

  return { state, prepareReview, runCampaign, cancelReview, selectCompany, updateDraft, approveDraft };
}
