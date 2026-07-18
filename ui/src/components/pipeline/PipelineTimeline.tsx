import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Search, Globe, ShieldCheck, MailOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import type { PipelineMeta } from '../../types/index.js';

const ICONS = {
  planner:       Compass,
  discovery:     Search,
  research:      Globe,
  qualification: ShieldCheck,
  draft:         MailOpen,
  critic:        AlertTriangle,
};

const STAGE_LABELS: Record<string, string> = {
  planner:       'Planner',
  discovery:     'Discovery',
  research:      'Research',
  qualification: 'Qualify',
  draft:         'Draft',
  critic:        'Critic',
};

const RUNNING_HINTS: Record<string, string> = {
  planner:       'Parsing intent...',
  discovery:     'Searching Google Places...',
  research:      'Scraping business profiles...',
  qualification: 'Scoring with Gemini...',
  draft:         'Writing outreach emails...',
  critic:        'Reviewing & refining...',
};

type StageStatus = 'waiting' | 'running' | 'completed' | 'failed';

interface PipelineTimelineProps {
  progress:    Record<string, StageStatus>;
  progressPct: Record<string, number>;
  meta:        PipelineMeta;
}

const STAGES: (keyof typeof ICONS)[] = [
  'planner', 'discovery', 'research', 'qualification', 'draft', 'critic',
];

export const PipelineTimeline: React.FC<PipelineTimelineProps> = ({ progress, progressPct, meta }) => {
  const runningStage = STAGES.find(s => progress[s] === 'running');

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-5 relative overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent pointer-events-none" />

      {/* ── Stage nodes row ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        {STAGES.map((key, idx) => {
          const status = progress[key] ?? 'waiting';
          const Icon   = ICONS[key];
          const isLast = idx === STAGES.length - 1;

          return (
            <React.Fragment key={key}>
              {/* Node */}
              <div className="flex flex-col items-center min-w-[60px]">
                <motion.div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border relative transition-all duration-300 ${
                    status === 'completed' ? 'bg-brand-500/20 border-brand-500   text-brand-400'  :
                    status === 'running'   ? 'bg-brand-500/10 border-brand-500   text-brand-300'  :
                    status === 'failed'    ? 'bg-red-500/20   border-red-500     text-red-400'    :
                                            'bg-gray-900/50  border-gray-800    text-gray-600'
                  }`}
                  whileHover={{ scale: 1.06 }}
                >
                  {status === 'completed'
                    ? <CheckCircle className="w-4 h-4 text-brand-400" />
                    : <Icon className="w-4 h-4" />
                  }

                  {/* Ping badge for running */}
                  {status === 'running' && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500" />
                    </span>
                  )}
                </motion.div>

                <span className={`text-[10px] mt-1.5 font-mono font-semibold tracking-wide ${
                  status === 'running'   ? 'text-brand-400' :
                  status === 'completed' ? 'text-gray-300'  : 'text-gray-600'
                }`}>
                  {STAGE_LABELS[key]}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="flex-1 h-[2px] bg-gray-800 relative mt-[-14px]">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-500 to-pink-500"
                    initial={{ width: '0%' }}
                    animate={{ width: progress[STAGES[idx + 1]] === 'waiting' && progress[key] !== 'completed' ? '0%' : '100%' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Running stage detail ───────────────────────────────────────── */}
      {runningStage && (
        <motion.div
          key={runningStage}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="relative z-10 space-y-2"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-mono">{RUNNING_HINTS[runningStage]}</span>
            <span className="text-brand-400 font-mono font-bold tabular-nums">
              {progressPct[runningStage] ?? 0}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-violet-500 to-pink-500"
              animate={{ width: `${progressPct[runningStage] ?? 0}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>

          {/* Live counters — shown during discovery */}
          {runningStage === 'discovery' && (
            <div className="flex gap-4 text-[10px] font-mono text-gray-500 pt-0.5">
              {meta.businessesFound > 0 && (
                <span className="text-gray-400">{meta.businessesFound} found</span>
              )}
              {meta.businessesValidated > 0 && (
                <span className="text-emerald-400">{meta.businessesValidated} validated</span>
              )}
              {meta.businessesRejected > 0 && (
                <span className="text-red-400">{meta.businessesRejected} rejected</span>
              )}
            </div>
          )}

          {runningStage === 'research' && meta.researched > 0 && (
            <div className="text-[10px] font-mono text-gray-500">
              <span className="text-gray-400">{meta.researched} profiles researched</span>
            </div>
          )}

          {runningStage === 'qualification' && meta.qualified > 0 && (
            <div className="text-[10px] font-mono text-gray-500">
              <span className="text-emerald-400">{meta.qualified} qualified leads</span>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Discovery Summary (shown once discovery is complete) ───────── */}
      {progress.discovery === 'completed' && meta.businessesFound > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="relative z-10 grid grid-cols-4 gap-3 pt-2 border-t border-white/5"
        >
          {[
            { label: 'Searched',  value: meta.businessesFound,     color: 'text-gray-300'    },
            { label: 'Validated', value: meta.businessesValidated,  color: 'text-emerald-400' },
            { label: 'Rejected',  value: meta.businessesRejected,   color: 'text-red-400'     },
            { label: 'Researched',value: meta.researched || meta.businessesValidated, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-[9px] uppercase tracking-widest font-mono text-gray-600">{s.label}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};
