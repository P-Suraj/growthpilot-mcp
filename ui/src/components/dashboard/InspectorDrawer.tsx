import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Company, ResearchResult, QualificationScore, Draft, Critique } from '../../types/index.js';
import { X } from 'lucide-react';
import { EmailPanel } from '../email/EmailPanel.js';
import { CriticPanel } from '../critic/CriticPanel.js';

interface InspectorDrawerProps {
  company: Company | null;
  research: ResearchResult | null;
  qualification: QualificationScore | null;
  draft: Draft | null;
  critique: Critique | null;
  onClose: () => void;
  onSaveDraft: (companyId: string, body: string) => void;
  onApproveDraft: (companyId: string) => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  company,
  research,
  qualification,
  draft,
  critique,
  onClose,
  onSaveDraft,
  onApproveDraft,
}) => {
  return (
    <AnimatePresence>
      {company && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[640px] bg-[#070b19] border-l border-white/5 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-widest font-mono">
                  Lead Profiler / Copilot
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight mt-1">{company.name}</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content Container */}
            <motion.div 
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {/* 1. Research Enrichments */}
              {research ? (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                  }}
                  className="space-y-3"
                >
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono">
                    Tavily Research Profile
                  </h4>
                  <div className="glass-panel p-4 rounded-xl space-y-3 text-sm">
                    <p className="text-gray-300 leading-relaxed font-sans">{research.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {research.dataSources.map((src, i) => (
                        <span key={i} className="bg-white/5 border border-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
              )}

              {/* 2. Qualification Signals */}
              {qualification ? (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                  }}
                  className="space-y-3"
                >
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono">
                    Gemini Lead Scoring
                  </h4>
                  <div className="glass-panel p-4 rounded-xl space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed">{qualification.reasoning}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {qualification.signals.map((sig, i) => (
                        <div key={i} className="bg-gray-950/40 p-2.5 rounded-lg border border-white/5 flex flex-col justify-between gap-1">
                          <span className="text-[10px] text-gray-500 font-medium">{sig.name}</span>
                          <span className="text-white font-semibold truncate">{sig.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {/* 3. Outreach Editor */}
              {draft ? (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                  }}
                  className="space-y-3"
                >
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono">
                    Personalized Outreach Email
                  </h4>
                  <div className="glass-panel p-4 rounded-xl">
                    <EmailPanel 
                      draft={draft} 
                      onSave={(body) => onSaveDraft(company.id, body)}
                      onApprove={() => onApproveDraft(company.id)}
                    />
                  </div>
                </motion.div>
              ) : null}

              {/* 4. Critique Panel */}
              {critique ? (
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                  }}
                  className="space-y-3"
                >
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono">
                    Self-Correction Audit
                  </h4>
                  <div className="glass-panel p-4 rounded-xl">
                    <CriticPanel critique={critique} />
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
