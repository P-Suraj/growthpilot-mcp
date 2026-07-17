import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Percent, Clock, Sparkles } from 'lucide-react';

interface SummaryCardsProps {
  stats: {
    companiesFound: number;
    qualifiedLeads: number;
    avgScore: number;
    durationSec: number;
    cacheSavings: string;
  };
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Companies Discovered',
      value: stats.companiesFound,
      icon: Users,
      color: 'text-blue-400',
      glow: 'shadow-blue-500/5',
    },
    {
      label: 'Qualified Leads',
      value: stats.qualifiedLeads,
      icon: CheckCircle,
      color: 'text-emerald-400',
      glow: 'shadow-emerald-500/5',
    },
    {
      label: 'Average Fit Score',
      value: `${(stats.avgScore * 100).toFixed(0)}%`,
      icon: Percent,
      color: 'text-violet-400',
      glow: 'shadow-violet-500/5',
    },
    {
      label: 'Execution Time',
      value: stats.durationSec > 0 ? `${stats.durationSec}s` : 'Counting...',
      icon: Clock,
      color: 'text-amber-400',
      glow: 'shadow-amber-500/5',
    },
    {
      label: 'Cache Efficiency',
      value: stats.cacheSavings,
      icon: Sparkles,
      color: 'text-pink-400',
      glow: 'shadow-pink-500/5',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  } as any;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-5 gap-4"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            variants={item}
            className={`glass-panel rounded-xl p-4 flex flex-col justify-between shadow-lg ${card.glow} border-white/5 hover:border-brand-500/20 transition-all duration-300`}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {card.label}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                {card.value}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
