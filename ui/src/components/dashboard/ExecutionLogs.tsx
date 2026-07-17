import React, { useEffect, useRef } from 'react';
import type { LogMessage } from '../../types/index.js';
import { Terminal, Cpu } from 'lucide-react';

import { motion } from 'framer-motion';

interface ExecutionLogsProps {
  logs: LogMessage[];
}

export const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border-white/5 flex flex-col h-[280px]">
      {/* Terminal Title Bar */}
      <div className="bg-gray-950/80 px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs text-gray-500 font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-gray-400">Agent Execution Console</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 bg-gray-950/30 scroll-smooth"
      >
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 gap-2">
            <Cpu className="w-4 h-4 animate-pulse text-gray-700" />
            <span>Console listening for campaign task events...</span>
          </div>
        ) : (
          logs.map((log) => {
            const levelColor = 
              log.level === 'error' ? 'text-red-400' :
              log.level === 'warn' ? 'text-amber-400' :
              log.level === 'success' ? 'text-emerald-400' : 'text-brand-400';

            const moduleLabel = log.module.toUpperCase();

            return (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="flex items-start gap-2 hover:bg-white/5 py-0.5 px-1 rounded transition-colors duration-150"
              >
                <span className="text-gray-600 select-none">[{log.timestamp}]</span>
                <span className={`font-bold select-none ${levelColor}`}>[{moduleLabel}]</span>
                <span className="text-gray-300 break-all">{log.message}</span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
