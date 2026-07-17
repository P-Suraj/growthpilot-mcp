import React from 'react';
import type { Critique } from '../../types/index.js';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CriticPanelProps {
  critique: Critique;
}

export const CriticPanel: React.FC<CriticPanelProps> = ({ critique }) => {
  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Factual Accuracy & Style Audit</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
          <span className="text-gray-500">Quality Score:</span>
          <span className={`${critique.score >= 0.85 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {(critique.score * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Issues / Highlights List */}
      <div className="space-y-3">
        {critique.issues.length === 0 ? (
          <div className="glass-panel p-4 rounded-xl flex items-start gap-3 border-emerald-500/20 bg-emerald-500/5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-semibold text-emerald-300">Draft Passed Review</h5>
              <p className="text-xs text-emerald-400/80 mt-1 leading-relaxed">
                Zero quality flags detected. No placeholder elements or hallucination metrics exceeded.
              </p>
            </div>
          </div>
        ) : (
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {critique.issues.map((issue, idx) => {
              const severityColor = 
                issue.severity === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                issue.severity === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 
                'bg-blue-500/10 text-blue-400 border-blue-500/30';

              return (
                <motion.div 
                  key={idx} 
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                  }}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${severityColor}`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">{issue.category}</span>
                      <span className="text-[9px] uppercase font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                        {issue.severity} priority
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">{issue.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Action / Suggestions */}
      {critique.suggestions.length > 0 && (
        <div className="space-y-2 pt-2">
          <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">
            Optimizations Applied:
          </h5>
          <ul className="space-y-1 text-xs text-gray-500 list-disc pl-4 leading-relaxed">
            {critique.suggestions.map((sug, idx) => (
              <li key={idx}>{sug}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
