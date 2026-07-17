import React from 'react';
import { motion } from 'framer-motion';
import type { Company, QualificationScore } from '../../types/index.js';
import { MapPin, Globe, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CompanyListProps {
  companies: Company[];
  scores: Record<string, QualificationScore>;
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const CompanyList: React.FC<CompanyListProps> = ({ companies, scores, activeId, onSelect }) => {
  if (companies.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-panel p-4 rounded-xl flex items-center justify-between gap-4 border-l-2 border-white/5 relative overflow-hidden h-[76px]">
            <div className="absolute inset-0 shimmer-bg opacity-20 pointer-events-none" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 bg-white/10 rounded w-[180px]" />
              <div className="h-3 bg-white/5 rounded w-[260px]" />
            </div>
            <div className="w-16 h-8 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company, index) => {
        const qual = scores[company.id];
        const isActive = activeId === company.id;
        
        return (
          <motion.div
            key={company.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(company.id)}
            className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-l-2 ${
              isActive 
                ? 'border-brand-500 bg-brand-500/5 shadow-brand-500/5 shadow-md' 
                : qual?.tier === 'HIGH'
                ? 'border-emerald-500/60 hover:border-brand-500/40'
                : qual?.tier === 'BORDERLINE'
                ? 'border-amber-500/60 hover:border-brand-500/40'
                : 'border-white/5 hover:border-brand-500/40'
            }`}
            whileHover={{ y: isActive ? 0 : -2, scale: isActive ? 1 : 1.005, boxShadow: "0 10px 25px -10px rgba(139, 92, 246, 0.15)" }}
            whileTap={{ scale: 0.995 }}
          >
            {/* Background spotlight */}
            {isActive && (
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            )}

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white tracking-tight">{company.name}</h4>
                <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                  {company.industry}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {company.location}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  {company.website.replace('https://', '')}
                </span>
                <span className="font-mono text-[10px] text-gray-600">
                  Size: {company.employeeCount} emp
                </span>
              </div>
            </div>

            {/* Score & Tier indicator */}
            <div className="flex items-center gap-3">
              {qual ? (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white flex items-center gap-1 justify-end">
                      <Award className="w-4 h-4 text-brand-400" />
                      {(qual.score * 100).toFixed(0)}%
                    </div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${
                      qual.tier === 'HIGH' ? 'text-emerald-400' : qual.tier === 'BORDERLINE' ? 'text-amber-400' : 'text-gray-400'
                    }`}>
                      {qual.tier}
                    </div>
                  </div>
                  {qual.tier === 'HIGH' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : qual.tier === 'BORDERLINE' ? (
                    <ShieldAlert className="w-5 h-5 text-amber-500 animate-pulse" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-700" />
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 animate-pulse">Running AI Scorer...</span>
                  <div className="w-4 h-4 rounded-full border-2 border-gray-800 border-t-brand-500 animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
