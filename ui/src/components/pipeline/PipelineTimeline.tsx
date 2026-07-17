import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Search, Globe, ShieldCheck, MailOpen, AlertTriangle } from 'lucide-react';


const iconsMap = {
  planner: Compass,
  discovery: Search,
  research: Globe,
  qualification: ShieldCheck,
  draft: MailOpen,
  critic: AlertTriangle,
};

export const PipelineTimeline: React.FC<{ progress: Record<string, 'waiting' | 'running' | 'completed' | 'failed'> }> = ({ progress }) => {
  const stages: { key: keyof typeof iconsMap; label: string }[] = [
    { key: 'planner', label: 'Planner' },
    { key: 'discovery', label: 'Discovery' },
    { key: 'research', label: 'Research' },
    { key: 'qualification', label: 'Qualify' },
    { key: 'draft', label: 'Draft' },
    { key: 'critic', label: 'Critic' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10 overflow-x-auto gap-4 py-2">
        {stages.map((stage, index) => {
          const status = progress[stage.key] || 'waiting';
          const Icon = iconsMap[stage.key];
          
          return (
            <React.Fragment key={stage.key}>
              {/* Connector Line */}
              {index > 0 && (
                <div className="flex-1 min-w-[20px] h-[2px] bg-gray-800 relative">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-500 via-pink-500 to-brand-500"
                    style={{ backgroundSize: '200% 100%' }}
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: progress[stages[index - 1].key] === 'completed' ? '100%' : '0%',
                      backgroundPosition: progress[stages[index - 1].key] === 'completed' ? ['0% 0%', '200% 0%'] : '0% 0%'
                    }}
                    transition={{ 
                      width: { duration: 0.5 },
                      backgroundPosition: { repeat: Infinity, duration: 1.5, ease: 'linear' }
                    }}
                  />
                </div>
              )}

              {/* Node */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 relative ${
                    status === 'completed'
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : status === 'running'
                      ? 'bg-brand-500/10 border-brand-500 animate-pulse text-brand-300'
                      : status === 'failed'
                      ? 'bg-red-500/20 border-red-500 text-red-400'
                      : 'bg-gray-900/50 border-gray-800 text-gray-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Status Indicator pulse */}
                  {status === 'running' && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-500"></span>
                    </span>
                  )}
                  {status === 'completed' && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-brand-500 text-white rounded-full p-0.5 text-[8px]"
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
                
                <span className={`text-xs mt-2 font-medium tracking-wide ${
                  status === 'running' ? 'text-brand-400 font-semibold' : status === 'completed' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {stage.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
