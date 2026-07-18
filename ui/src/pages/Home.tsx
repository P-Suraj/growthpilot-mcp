import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampaign } from '../hooks/useCampaign.js';
import { PipelineTimeline } from '../components/pipeline/PipelineTimeline.js';
import { SummaryCards } from '../components/dashboard/SummaryCards.js';
import { CompanyList } from '../components/company/CompanyList.js';
import { ExecutionLogs } from '../components/dashboard/ExecutionLogs.js';
import { InspectorDrawer } from '../components/dashboard/InspectorDrawer.js';
import { TypewriterPlaceholder } from '../components/common/TypewriterPlaceholder.js';
import { CampaignReviewPanel } from '../components/common/CampaignReviewPanel.js';
import { SynapticGrid } from '../components/common/SynapticGrid.js';
import type { CampaignConfig } from '../types/index.js';
import { Sparkles, RefreshCw, Terminal, ChevronRight, X, Cpu, Network, Shield } from 'lucide-react';

// ─── About modal ──────────────────────────────────────────────────────────────

const AboutModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0a0f1e] border border-white/10 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </div>
            <span className="font-bold text-white text-lg">About GrowthPilot</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 text-sm text-gray-400 leading-relaxed">
          <p className="text-gray-300">
            <strong className="text-white">GrowthPilot</strong> helps you find businesses that are likely to buy your product
            and automatically generates personalized outreach — so you spend time on conversations, not research.
          </p>

          <div className="space-y-3">
            {[
              {
                icon: <Cpu className="w-4 h-4 text-brand-400" />,
                title: 'AI Pipeline',
                desc: '6 specialized AI agents run in sequence: Planner, Discovery, Research, Qualification, Draft, and Critic. Each stage has a specific job.',
              },
              {
                icon: <Network className="w-4 h-4 text-violet-400" />,
                title: 'MCP Architecture',
                desc: 'Built on the Model Context Protocol (MCP). Each agent module is independent and can be reused by any external system without depending on the whole application.',
              },
              {
                icon: <Shield className="w-4 h-4 text-emerald-400" />,
                title: 'Hallucination Reduction',
                desc: 'Businesses are validated against real Google Places categories before AI touches them. The Critic agent reviews every email for factual accuracy.',
              },
            ].map(item => (
              <div key={item.title} className="flex gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                <div className="mt-0.5 shrink-0">{item.icon}</div>
                <div>
                  <div className="font-semibold text-white text-xs mb-1">{item.title}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
        >
          Got it
        </button>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Variants ─────────────────────────────────────────────────────────────────

const heroContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.11, delayChildren: 0.06 } },
  exit:   { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
};

const fadeUp = {
  hidden:  { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 80, damping: 16 } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Home: React.FC = () => {
  const { state, prepareReview, runCampaign, cancelReview, selectCompany, updateDraft, approveDraft } = useCampaign();
  const [goalInput, setGoalInput]  = useState('');
  const [showAbout, setShowAbout]  = useState(false);

  const activeCompany       = state.companies.find(c => c.id === state.activeCompanyId) ?? null;
  const activeResearch      = activeCompany ? (state.researchResults[activeCompany.id]      ?? null) : null;
  const activeQualification = activeCompany ? (state.qualificationScores[activeCompany.id]  ?? null) : null;
  const activeDraft         = activeCompany ? (state.drafts[activeCompany.id]               ?? null) : null;
  const activeCritique      = activeCompany ? (state.critiques[activeCompany.id]            ?? null) : null;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    prepareReview(goalInput.trim());
  };

  const handleConfirmConfig = (cfg: CampaignConfig) => runCampaign(undefined, cfg);

  const isIdle      = state.phase === 'idle';
  const isReview    = state.phase === 'review';
  const isDashboard = state.phase === 'running' || state.phase === 'complete';
  const isRunning   = state.phase === 'running';
  const isComplete  = state.phase === 'complete';

  // Pipeline stage gating — what's visible depends on which stages have completed
  const showCompanies     = state.progress.discovery     === 'completed' && state.companies.length > 0;
  const showQualification = state.progress.qualification !== 'waiting';

  return (
    <div className="min-h-screen obsidian-vault relative overflow-hidden font-sans select-none">
      <SynapticGrid />

      {/* Ambient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[650px] h-[650px] rounded-full pointer-events-none mesh-gradient"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1 }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[550px] h-[550px] rounded-full pointer-events-none mesh-gradient"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1, animationDelay: '-12s' }} />

      {/* About modal */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col py-6" style={{ zIndex: 10 }}>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between border-b border-white/5 pb-4 shrink-0"
        >
          <button
            onClick={cancelReview}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <span className="font-bold text-white tracking-tight">GrowthPilot</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAbout(true)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors font-mono flex items-center gap-1"
            >
              About
              <ChevronRight className="w-3 h-3" />
            </button>
            <span className="flex items-center gap-1.5 text-xs font-mono text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              MCP Active
            </span>
          </div>
        </motion.header>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center my-6">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Hero ────────────────────────────────────────── */}
            {isIdle && (
              <motion.div
                key="landing"
                variants={heroContainer}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center max-w-3xl mx-auto w-full"
              >
                {/* Badge */}
                <motion.div variants={fadeUp} className="mb-6">
                  <span className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest font-mono text-brand-400 bg-brand-500/10 border border-brand-500/25 px-4 py-1.5 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    AI-Powered Outbound Sales
                  </span>
                </motion.div>

                {/* Headline — value-focused, no MCP jargon */}
                <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-5 font-sans">
                  <span className="text-white">Find buyers.</span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-violet-400 to-pink-500">
                    Reach them first.
                  </span>
                </motion.h1>

                {/* Subtitle — answers what/who/what-happens */}
                <motion.p variants={fadeUp} className="text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed mb-8">
                  GrowthPilot finds businesses that are likely to buy your product and generates
                  personalized outreach automatically — in under 2 minutes.
                </motion.p>

                {/* Stats */}
                <motion.div variants={fadeUp} className="flex items-center justify-center gap-8 mb-8">
                  {[
                    { value: '6',      label: 'AI Agents'      },
                    { value: '94%',    label: 'Lead Precision' },
                    { value: '< 2min', label: 'Per Campaign'   },
                  ].map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex flex-col items-center gap-0.5"
                    >
                      <span className="text-2xl font-extrabold text-white tabular-nums">{s.value}</span>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">{s.label}</span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Input — just the intent, nothing more */}
                <motion.form onSubmit={handleContinue} variants={fadeUp} className="relative max-w-2xl mx-auto">
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    animate={{ boxShadow: ['0 0 0px 0px rgba(139,92,246,0)', '0 0 22px 4px rgba(139,92,246,0.22)', '0 0 0px 0px rgba(139,92,246,0)'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className="glow-border glass-panel p-2 rounded-2xl flex items-center gap-2 shadow-2xl" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                    <div className="flex-1 flex items-center gap-3 pl-3">
                      <Sparkles className="w-4 h-4 text-gray-600 shrink-0" />
                      <div className="relative flex-1 flex items-center">
                        <input
                          type="text"
                          value={goalInput}
                          onChange={e => setGoalInput(e.target.value)}
                          className="bg-transparent text-white text-sm w-full focus:outline-none relative z-10 py-1"
                        />
                        {goalInput === '' && (
                          <div className="absolute inset-0 flex items-center pointer-events-none z-0">
                            <TypewriterPlaceholder />
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(139,92,246,0.45)' }}
                      whileTap={{ scale: 0.96 }}
                      className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      Get Started
                      <ChevronRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.form>

                {/* What to type — clear instructions */}
                <motion.p variants={fadeUp} className="mt-3 text-[11px] text-gray-600 font-mono">
                  Describe what you sell: &ldquo;I sell printer automation software&rdquo; or &ldquo;I want to sell laptops&rdquo;
                </motion.p>
                <motion.p variants={fadeUp} className="mt-1 text-[11px] text-gray-700 font-mono">
                  You'll confirm location, target, and outreach settings on the next screen.
                </motion.p>

                {/* Pipeline pills */}
                <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-1.5 flex-wrap">
                  {['Planner', 'Discovery', 'Research', 'Qualify', 'Draft', 'Critic'].map((s, i) => (
                    <React.Fragment key={s}>
                      <span className="text-[10px] font-mono text-gray-500 bg-white/[0.03] border border-white/[0.06] px-3 py-1 rounded-full">
                        {s}
                      </span>
                      {i < 5 && <span className="text-gray-700 text-[10px]">→</span>}
                    </React.Fragment>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ── STEP 2: Review Panel ─────────────────────────────────── */}
            {isReview && state.config && (
              <motion.div key="review" className="flex justify-center overflow-y-auto max-h-[calc(100vh-160px)] pb-4">
                <CampaignReviewPanel
                  goal={state.goal}
                  config={state.config}
                  onConfirm={handleConfirmConfig}
                  onBack={cancelReview}
                />
              </motion.div>
            )}

            {/* ── STEP 3: Dashboard ────────────────────────────────────── */}
            {isDashboard && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Campaign header bar */}
                <div className="glass-panel px-5 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] text-brand-400 font-bold uppercase tracking-widest font-mono">
                      {isComplete ? 'Campaign Complete' : 'Campaign Running'}
                    </span>
                    <h2 className="text-sm font-bold text-white tracking-tight mt-0.5 truncate">{state.goal}</h2>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isRunning && (
                      <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-xs">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-gray-300 font-medium capitalize">Processing…</span>
                      </div>
                    )}
                    {isComplete && (
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Complete
                      </div>
                    )}
                    <motion.button
                      whileHover={{ rotate: 180, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => runCampaign(state.goal)}
                      title="Re-run campaign"
                      className="p-2 rounded-lg bg-gray-900 border border-white/5 hover:border-brand-500/30 text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Summary cards — only after complete */}
                {isComplete && <SummaryCards stats={state.stats} />}

                {/* Pipeline timeline — always visible during running/complete */}
                <PipelineTimeline
                  progress={state.progress}
                  progressPct={state.progressPct}
                  meta={state.pipelineMeta}
                />

                {/* Lead list + logs — gated by stage completion */}
                {showCompanies ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                    <div className="lg:col-span-2 space-y-3">
                      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono px-1">
                        Lead Pipeline · {state.companies.length} discovered
                      </h3>
                      <CompanyList
                        companies={state.companies}
                        scores={state.qualificationScores}
                        activeId={state.activeCompanyId}
                        onSelect={selectCompany}
                        // Gate scores/drafts by stage
                        showScores={showQualification}
                      />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                        <Terminal className="w-3 h-3" />
                        Activity Log
                      </h3>
                      <ExecutionLogs logs={state.logs} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                      <Terminal className="w-3 h-3" />
                      Activity Log
                    </h3>
                    <ExecutionLogs logs={state.logs} />
                  </div>
                )}

                {/* Inspector drawer */}
                <InspectorDrawer
                  company={activeCompany}
                  research={activeResearch}
                  qualification={activeQualification}
                  draft={activeDraft}
                  critique={activeCritique}
                  onClose={() => selectCompany(null)}
                  onSaveDraft={updateDraft}
                  onApproveDraft={approveDraft}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="text-center border-t border-white/5 pt-4 text-[10px] text-gray-700 font-mono shrink-0">
          GrowthPilot · AI Outbound Sales Platform · Built for Hackathon 2026
        </footer>
      </div>
    </div>
  );
};
