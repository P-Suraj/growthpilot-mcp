import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCampaign } from '../hooks/useCampaign.js';
import { PipelineTimeline } from '../components/pipeline/PipelineTimeline.js';
import { SummaryCards } from '../components/dashboard/SummaryCards.js';
import { CompanyList } from '../components/company/CompanyList.js';
import { ExecutionLogs } from '../components/dashboard/ExecutionLogs.js';
import { InspectorDrawer } from '../components/dashboard/InspectorDrawer.js';
import { TypewriterPlaceholder } from '../components/common/TypewriterPlaceholder.js';
import { SynapticGrid } from '../components/common/SynapticGrid.js';
import { Compass, Play, RefreshCw, Sparkles, Terminal } from 'lucide-react';

export const Home: React.FC = () => {
  const { state, runCampaign, selectCompany, updateDraft, approveDraft } = useCampaign();
  const [goalInput, setGoalInput] = useState('');

  const activeCompany = state.companies.find(c => c.id === state.activeCompanyId) || null;
  const activeResearch = activeCompany ? state.researchResults[activeCompany.id] || null : null;
  const activeQualification = activeCompany ? state.qualificationScores[activeCompany.id] || null : null;
  const activeDraft = activeCompany ? state.drafts[activeCompany.id] || null : null;
  const activeCritique = activeCompany ? state.critiques[activeCompany.id] || null : null;

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    runCampaign(goalInput.trim());
  };

  const isIdle = state.status === 'idle';

  // Stagger Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 90, damping: 14 }
    }
  };

  return (
    <div className="min-h-screen obsidian-vault relative overflow-hidden font-sans select-none">
      {/* Interactive Elastic Synaptic Grid Mesh */}
      <SynapticGrid />
      
      {/* Floating Rotating Ambient Gradient Meshes */}
      <div className="absolute top-[-25%] left-[-15%] w-[700px] h-[700px] rounded-full bg-brand-500/10 blur-[130px] pointer-events-none z-0 mesh-gradient" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full bg-pink-500/5 blur-[130px] pointer-events-none z-0 mesh-gradient" style={{ animationDelay: '-12s' }} />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-between py-8">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between border-b border-white/5 pb-4"
        >
          <div className="flex items-center gap-2">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.05 }}
              className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-brand-400" />
            </motion.div>
            <span className="font-bold text-white tracking-tight text-lg">GrowthPilot</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              MCP Server Mode: Active
            </span>
          </div>
        </motion.header>

        {/* Dynamic Pages Area */}
        <div className="flex-1 flex flex-col justify-center my-8">
          <AnimatePresence mode="wait">
            {isIdle ? (
              /* LANDING PAGE (Hero + Command Input) */
              <motion.div
                key="landing"
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                variants={containerVariants}
                className="text-center max-w-3xl mx-auto space-y-8"
              >
                <div className="space-y-4">
                  <motion.span 
                    variants={itemVariants}
                    className="text-[10px] uppercase font-bold tracking-widest font-mono text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full inline-block"
                  >
                    Next-Generation AI Sales Agent
                  </motion.span>
                  <motion.h1 
                    variants={itemVariants}
                    className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white font-sans leading-none"
                  >
                    OUTBOUND ON <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-pink-500">
                      AUTOPILOT
                    </span>
                  </motion.h1>
                  <motion.p 
                    variants={itemVariants}
                    className="text-gray-400 text-sm md:text-base font-normal max-w-xl mx-auto font-sans leading-relaxed"
                  >
                    AI-powered outbound sales utilizing Model Context Protocol. Discover, research, score, and draft personalized sequences automatically.
                  </motion.p>
                </div>

                {/* Floating Command Box */}
                <motion.form
                  onSubmit={handleSubmitGoal}
                  layoutId="command-bar"
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className="glow-border glass-panel p-2 rounded-2xl flex items-center gap-2 max-w-2xl mx-auto shadow-2xl focus-within:border-brand-500/30 transition-all duration-300 relative"
                >
                  <div className="flex-1 flex items-center gap-3 pl-3 relative">
                    <Compass className="w-5 h-5 text-gray-500 shrink-0" />
                    <div className="relative flex-1 flex items-center">
                      <input
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value)}
                        className="bg-transparent text-white font-sans text-sm w-full focus:outline-none relative z-10 py-1"
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
                    whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Run Campaign</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </motion.button>
                </motion.form>
              </motion.div>
            ) : (
              /* CAMPAIGN DASHBOARD */
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header Status Bar (Morphed Command Input) */}
                <motion.div 
                  layoutId="command-bar"
                  className="glass-panel px-6 py-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-400 font-bold uppercase tracking-widest font-mono">
                      Active AI Outbound Campaign
                    </span>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {state.goal}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-xs">
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                      <span className="capitalize text-gray-300 font-medium">Status: {state.status}</span>
                    </div>
                    <motion.button
                      whileHover={{ rotate: 180, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => runCampaign(state.goal)}
                      className="p-2 rounded-lg bg-gray-900 border border-white/5 hover:border-brand-500/30 text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>

                {/* Metrics Grid */}
                <SummaryCards stats={state.stats} />

                {/* Pipeline Progression Stage Graph */}
                <PipelineTimeline progress={state.progress} />

                {/* Main Dashboard Layout splits */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  
                  {/* Left & Middle: Companies List Cards */}
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono px-1">
                      Lead Pipeline
                    </h3>
                    <CompanyList 
                      companies={state.companies} 
                      scores={state.qualificationScores} 
                      activeId={state.activeCompanyId}
                      onSelect={selectCompany}
                    />
                  </div>

                  {/* Right Column: Mini-Logs / Audit overview */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono px-1 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      System Activity
                    </h3>
                    <ExecutionLogs logs={state.logs} />
                  </div>
                </div>

                {/* Side Inspector Drawer Overlay */}
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
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center border-t border-white/5 pt-4 text-[10px] text-gray-600 font-mono"
        >
          <span>GrowthPilot Copilot v1.0.0 · Funded via Personal Resources · Cost Protected</span>
        </motion.footer>
      </div>
    </div>
  );
};
