import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Company, ResearchResult, QualificationScore, Draft, Critique } from '../../types/index.js';
import {
  X, CheckCircle2, XCircle, MapPin, Globe, Star, Building2, Tag, Zap,
  ChevronDown, ChevronUp, ShieldCheck, Mail,
} from 'lucide-react';
import { EmailPanel } from '../email/EmailPanel.js';
import { CriticPanel } from '../critic/CriticPanel.js';

interface InspectorDrawerProps {
  company:       Company | null;
  research:      ResearchResult | null;
  qualification: QualificationScore | null;
  draft:         Draft | null;
  critique:      Critique | null;
  onClose:       () => void;
  onSaveDraft:   (companyId: string, body: string) => void;
  onApproveDraft:(companyId: string) => void;
}

// ─── Lead signal builder ──────────────────────────────────────────────────────

function buildSignals(company: Company) {
  const sigs: { icon: React.ReactNode; text: string; ok: boolean }[] = [];

  // Category
  if (company.categories && company.categories.length > 0) {
    const nice = company.categories[0].replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    sigs.push({ icon: <Tag className="w-3.5 h-3.5" />, text: nice, ok: true });
    sigs.push({ icon: <CheckCircle2 className="w-3.5 h-3.5" />, text: 'Category Match', ok: true });
  } else {
    sigs.push({ icon: <Building2 className="w-3.5 h-3.5" />, text: company.industry, ok: true });
  }

  // Website
  if (company.website && company.website.length > 4) {
    sigs.push({ icon: <Globe className="w-3.5 h-3.5" />, text: 'Website Found', ok: true });
  } else {
    sigs.push({ icon: <Globe className="w-3.5 h-3.5" />, text: 'No Website', ok: false });
  }

  // Email
  if (company.email) {
    sigs.push({ icon: <Mail className="w-3.5 h-3.5" />, text: 'Email Found', ok: true });
  }

  // Rating
  if (company.rating != null) {
    sigs.push({ icon: <Star className="w-3.5 h-3.5" />, text: `Rating ${company.rating.toFixed(1)}★`, ok: company.rating >= 4.0 });
  }

  // Location
  sigs.push({
    icon: <MapPin className="w-3.5 h-3.5" />,
    text: company.distanceKm != null ? `${company.distanceKm.toFixed(1)} km away` : company.location,
    ok: true,
  });

  return sigs;
}

// ─── Collapsible section ──────────────────────────────────────────────────────

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = false, badge, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3.5 text-left hover:bg-white/[0.015] rounded-lg px-1 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-gray-500">{icon}</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">{title}</span>
          {badge && (
            <span className="text-[9px] bg-brand-500/20 text-brand-400 border border-brand-500/30 px-1.5 py-0.5 rounded-full font-mono">
              {badge}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-600" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-600" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  company, research, qualification, draft, critique,
  onClose, onSaveDraft, onApproveDraft,
}) => {
  return (
    <AnimatePresence>
      {company && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 210 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[600px] bg-[#070b19] border-l border-white/5 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Drawer header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-widest font-mono block">
                  Lead Profile
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight mt-0.5 truncate">{company.name}</h3>
                {company.address && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />{company.address}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-3 shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable sections */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-0.5">

                {/* ── Section 1: Business Overview ─────────────────────── */}
                <Section title="Business Overview" icon={<Building2 className="w-4 h-4" />} defaultOpen>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Category',    value: company.categories?.[0]?.replace(/_/g, ' ') || company.industry },
                      { label: 'Rating',      value: company.rating != null ? `${company.rating.toFixed(1)} ★` : '—' },
                      { label: 'Website',     value: company.website ? company.website.replace('https://', '') : '—' },
                      { label: 'Phone',       value: company.phone || '—' },
                      { label: 'Location',    value: company.location },
                      { label: 'Email',       value: company.email || 'Not found' },
                    ].map(f => (
                      <div key={f.label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1">{f.label}</div>
                        <div className="text-xs text-white font-medium truncate">{f.value}</div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* ── Section 2: Why this lead? ─────────────────────────── */}
                <Section
                  title="Why This Lead?"
                  icon={<Zap className="w-4 h-4" />}
                  defaultOpen
                  badge={qualification ? `${(qualification.score * 100).toFixed(0)}% match` : undefined}
                >
                  <div className="space-y-2.5">
                    {buildSignals(company).map((sig, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        <span className={sig.ok ? 'text-emerald-400' : 'text-red-400'}>
                          {sig.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </span>
                        <span className={`flex items-center gap-1.5 text-xs ${sig.ok ? 'text-gray-300' : 'text-gray-500'}`}>
                          <span className={sig.ok ? 'text-emerald-400/60' : 'text-red-400/60'}>{sig.icon}</span>
                          {sig.text}
                        </span>
                      </div>
                    ))}

                    {qualification && (
                      <div className="pt-3 border-t border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-mono">Confidence</span>
                          <span className={`font-bold font-mono tabular-nums ${
                            qualification.tier === 'HIGH' ? 'text-emerald-400' :
                            qualification.tier === 'BORDERLINE' ? 'text-amber-400' : 'text-gray-400'
                          }`}>
                            {(qualification.score * 100).toFixed(0)}% — {qualification.tier}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              qualification.tier === 'HIGH' ? 'bg-gradient-to-r from-brand-500 to-emerald-400' :
                              qualification.tier === 'BORDERLINE' ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                              'bg-gray-700'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${qualification.score * 100}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                          />
                        </div>
                        {qualification.reasoning && (
                          <p className="text-[11px] text-gray-500 leading-relaxed pt-1">{qualification.reasoning}</p>
                        )}
                      </div>
                    )}
                  </div>
                </Section>

                {/* ── Section 3: Research Summary ───────────────────────── */}
                <Section
                  title="Research Summary"
                  icon={<Globe className="w-4 h-4" />}
                  badge={research ? 'Tavily' : undefined}
                >
                  {research ? (
                    <div className="space-y-2.5">
                      {research.bullets && research.bullets.length > 0 ? (
                        <ul className="space-y-2">
                          {research.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
                              <span className="text-brand-500 mt-0.5 shrink-0">•</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400 leading-relaxed">{research.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {research.dataSources.map((s, i) => (
                          <span key={i} className="text-[10px] bg-white/5 border border-white/5 text-gray-500 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                  )}
                </Section>

                {/* ── Section 4: Personalized Email ────────────────────── */}
                <Section
                  title="Personalized Email"
                  icon={<Mail className="w-4 h-4" />}
                  badge={draft ? `v${draft.version}` : undefined}
                >
                  {draft ? (
                    <EmailPanel
                      draft={draft}
                      company={company}
                      onSave={body => onSaveDraft(company.id, body)}
                      onApprove={() => onApproveDraft(company.id)}
                    />
                  ) : (
                    <div className="h-16 bg-white/5 rounded-xl animate-pulse" />
                  )}
                </Section>

                {/* ── Section 5: Critic Audit ──────────────────────────── */}
                {critique && (
                  <Section
                    title="Quality Audit"
                    icon={<ShieldCheck className="w-4 h-4" />}
                    badge={critique.approved ? 'Passed' : 'Issues'}
                  >
                    <CriticPanel critique={critique} />
                  </Section>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
