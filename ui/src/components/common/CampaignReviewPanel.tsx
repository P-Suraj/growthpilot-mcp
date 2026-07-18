import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CampaignConfig, SearchScope, OutreachSettings } from '../../types/index.js';
import {
  ChevronDown, ChevronUp, Play, ArrowLeft,
  MapPin, Package, Building2, Sliders, Target,
  MessageSquare, Zap,
} from 'lucide-react';

// ─── Field primitives ─────────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({ children, icon }) => (
  <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-500 font-mono font-bold mb-1.5">
    {icon}<span>{children}</span>
  </label>
);

const TextInput: React.FC<{
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}> = ({ value, onChange, placeholder, className = '' }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5
      focus:outline-none focus:border-brand-500/50 focus:bg-white/[0.06] transition-all
      placeholder-gray-600 font-sans ${className}`}
  />
);

const NumberInput: React.FC<{
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number; suffix?: string;
}> = ({ value, onChange, min = 0, max, step = 1, suffix }) => (
  <div className="flex items-center gap-2">
    <input
      type="number" value={value} min={min} max={max} step={step}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5
        focus:outline-none focus:border-brand-500/50 transition-all font-sans"
    />
    {suffix && <span className="text-xs text-gray-500 shrink-0">{suffix}</span>}
  </div>
);

const Toggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
    <span className="text-xs text-gray-400">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-brand-500' : 'bg-white/10'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  </div>
);

const SelectInput: React.FC<{
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className="w-full bg-[#0d1117] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5
      focus:outline-none focus:border-brand-500/50 transition-all appearance-none cursor-pointer"
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Scope selector ───────────────────────────────────────────────────────────

const SCOPE_OPTIONS: { value: SearchScope; label: string; desc: string }[] = [
  { value: 'nearby', label: 'Nearby',  desc: 'Around a city, within a radius' },
  { value: 'city',   label: 'City',    desc: 'Entire city or metro area'      },
  { value: 'state',  label: 'State',   desc: 'Search across a state'          },
  { value: 'country',label: 'Country', desc: 'Search across a country'        },
];

const ScopeSelector: React.FC<{
  value: SearchScope; onChange: (v: SearchScope) => void;
}> = ({ value, onChange }) => (
  <div className="grid grid-cols-4 gap-2">
    {SCOPE_OPTIONS.map(s => (
      <button
        key={s.value}
        onClick={() => onChange(s.value)}
        className={`p-2.5 rounded-xl border text-center transition-all ${
          value === s.value
            ? 'bg-brand-500/15 border-brand-500/50 text-brand-300'
            : 'bg-white/[0.03] border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
        }`}
      >
        <span className="block text-xs font-semibold">{s.label}</span>
      </button>
    ))}
  </div>
);

// ─── Scope-specific location fields ──────────────────────────────────────────

const ScopeFields: React.FC<{ cfg: CampaignConfig; set: <K extends keyof CampaignConfig>(k: K, v: CampaignConfig[K]) => void }> = ({ cfg, set }) => {
  switch (cfg.searchScope) {
    case 'nearby':
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label><span>City</span></Label>
            <TextInput value={cfg.city ?? ''} onChange={v => set('city', v)} placeholder="e.g. Amritapuri" />
          </div>
          <div>
            <Label><span>Radius</span></Label>
            <NumberInput value={cfg.radiusKm} onChange={v => set('radiusKm', v)} min={1} max={100} suffix="km" />
          </div>
        </div>
      );
    case 'city':
      return (
        <div>
          <Label><span>City</span></Label>
          <TextInput value={cfg.city ?? ''} onChange={v => set('city', v)} placeholder="e.g. Kochi, Kerala" />
        </div>
      );
    case 'state':
      return (
        <div>
          <Label><span>State</span></Label>
          <TextInput value={cfg.state ?? ''} onChange={v => set('state', v)} placeholder="e.g. Kerala" />
        </div>
      );
    case 'country':
      return (
        <div>
          <Label><span>Country</span></Label>
          <TextInput value={cfg.country ?? ''} onChange={v => set('country', v)} placeholder="e.g. India" />
        </div>
      );
  }
};

// ─── Outreach settings ─────────────────────────────────────────────────────────

const OBJECTIVE_OPTS = [
  { value: 'sell_software',   label: 'Sell Software'        },
  { value: 'schedule_demo',   label: 'Schedule a Demo'      },
  { value: 'book_meeting',    label: 'Book a Meeting'        },
  { value: 'distributor',     label: 'Become a Distributor' },
  { value: 'partnership',     label: 'Request Partnership'  },
  { value: 'other',           label: 'Other'                },
];
const TONE_OPTS = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly',     label: 'Friendly'     },
  { value: 'executive',    label: 'Executive'    },
  { value: 'short',        label: 'Short & Crisp'},
];
const CTA_OPTS = [
  { value: 'book_meeting',   label: 'Book a Meeting'  },
  { value: 'reply',          label: 'Reply to Email'  },
  { value: 'schedule_demo',  label: 'Schedule a Demo' },
  { value: 'call_me',        label: 'Call Me'         },
];

const OutreachEditor: React.FC<{
  outreach: OutreachSettings;
  onChange: (o: OutreachSettings) => void;
}> = ({ outreach, onChange }) => {
  const set = <K extends keyof OutreachSettings>(k: K, v: OutreachSettings[K]) =>
    onChange({ ...outreach, [k]: v });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label icon={<Target className="w-3 h-3" />}>Objective</Label>
          <SelectInput value={outreach.objective} onChange={v => set('objective', v as any)} options={OBJECTIVE_OPTS} />
        </div>
        <div>
          <Label icon={<MessageSquare className="w-3 h-3" />}>Tone</Label>
          <SelectInput value={outreach.tone} onChange={v => set('tone', v as any)} options={TONE_OPTS} />
        </div>
        <div>
          <Label icon={<Zap className="w-3 h-3" />}>CTA</Label>
          <SelectInput value={outreach.cta} onChange={v => set('cta', v as any)} options={CTA_OPTS} />
        </div>
      </div>
      <div>
        <Label><span>Email Template</span></Label>
        <p className="text-[10px] text-gray-600 font-mono mb-2">
          Use {'{{company_name}}'}, {'{{industry}}'}, {'{{location}}'}, {'{{product_pitch}}'} — AI personalizes, not rewrites.
        </p>
        <textarea
          value={outreach.template}
          onChange={e => set('template', e.target.value)}
          rows={7}
          className="w-full bg-white/[0.04] border border-white/10 text-gray-300 text-xs rounded-xl px-4 py-3
            focus:outline-none focus:border-brand-500/50 transition-all resize-none font-mono leading-relaxed"
        />
      </div>
    </div>
  );
};

// ─── Accordion section ────────────────────────────────────────────────────────

const AccordionSection: React.FC<{
  title: string; icon: React.ReactNode;
  open: boolean; onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon, open, onToggle, children }) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-1 py-2.5 text-xs text-gray-400 hover:text-gray-300 transition-all"
    >
      <span className="flex items-center gap-2 font-mono uppercase tracking-widest text-[10px]">
        {icon}{title}
      </span>
      {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
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
          <div className="glass-panel rounded-2xl p-5 mt-1 mb-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface CampaignReviewPanelProps {
  goal: string;
  config: CampaignConfig;
  onConfirm: (config: CampaignConfig) => void;
  onBack: () => void;
}

export const CampaignReviewPanel: React.FC<CampaignReviewPanelProps> = ({
  goal, config: init, onConfirm, onBack,
}) => {
  const [cfg, setCfg] = useState<CampaignConfig>({ ...init });
  const [openOutreach, setOpenOutreach] = useState(false);
  const [openAdvanced, setOpenAdvanced] = useState(false);

  const set = <K extends keyof CampaignConfig>(k: K, v: CampaignConfig[K]) =>
    setCfg(prev => ({ ...prev, [k]: v }));

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 80, damping: 18 }}
      className="max-w-2xl mx-auto w-full"
    >
      {/* Header */}
      <div className="mb-5 text-center">
        <span className="text-[10px] uppercase tracking-widest font-mono text-brand-400 font-bold">
          Step 2 of 2 — Review Campaign
        </span>
        <h2 className="text-xl font-bold text-white tracking-tight mt-1">Confirm your campaign</h2>
        <p className="text-xs text-gray-500 mt-1">AI pre-filled these from your intent. Edit anything before launching.</p>
      </div>

      {/* Intent pill */}
      <div className="mb-5 text-center">
        <span className="inline-block text-xs text-gray-400 bg-white/[0.04] border border-white/8 px-4 py-1.5 rounded-full font-mono truncate max-w-full">
          &ldquo;{goal}&rdquo;
        </span>
      </div>

      {/* Core fields */}
      <div className="glass-panel rounded-2xl p-5 space-y-4 mb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label icon={<Package className="w-3 h-3" />}>Product</Label>
            <TextInput value={cfg.product} onChange={v => set('product', v)} placeholder="e.g. Laptop" />
          </div>
          <div>
            <Label icon={<Building2 className="w-3 h-3" />}>Industry</Label>
            <TextInput value={cfg.industry} onChange={v => set('industry', v)} placeholder="e.g. Electronics" />
          </div>
          <div>
            <Label icon={<Target className="w-3 h-3" />}>Target Customer</Label>
            <TextInput value={cfg.targetCustomer} onChange={v => set('targetCustomer', v)} placeholder="e.g. Computer Stores" />
          </div>
        </div>

        {/* Search Scope */}
        <div className="pt-1">
          <Label icon={<MapPin className="w-3 h-3" />}>Search Scope</Label>
          <ScopeSelector value={cfg.searchScope} onChange={v => set('searchScope', v)} />
        </div>

        {/* Scope-specific fields */}
        <AnimatePresence mode="wait">
          <motion.div
            key={cfg.searchScope}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            <ScopeFields cfg={cfg} set={set} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Outreach Settings accordion */}
      <AccordionSection
        title="Email Outreach Settings"
        icon={<MessageSquare className="w-3 h-3" />}
        open={openOutreach}
        onToggle={() => setOpenOutreach(v => !v)}
      >
        <OutreachEditor outreach={cfg.outreach} onChange={o => set('outreach', o)} />
      </AccordionSection>

      {/* Advanced Options accordion */}
      <AccordionSection
        title="Advanced Options"
        icon={<Sliders className="w-3 h-3" />}
        open={openAdvanced}
        onToggle={() => setOpenAdvanced(v => !v)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label><span>Number of Leads</span></Label>
              <NumberInput value={cfg.numberOfLeads} onChange={v => set('numberOfLeads', v)} min={1} max={50} />
            </div>
            <div>
              <Label><span>Min Rating ★</span></Label>
              <NumberInput value={cfg.minRating} onChange={v => set('minRating', v)} min={0} max={5} step={0.5} />
            </div>
            <div>
              <Label><span>Min Employees</span></Label>
              <NumberInput value={cfg.minEmployees} onChange={v => set('minEmployees', v)} min={0} />
            </div>
            <div>
              <Label><span>Max Employees</span></Label>
              <NumberInput value={cfg.maxEmployees} onChange={v => set('maxEmployees', v)} min={0} />
            </div>
          </div>
          <div>
            <Label><span>Excluded Categories</span></Label>
            <TextInput
              value={cfg.excludedCategories}
              onChange={v => set('excludedCategories', v)}
              placeholder="e.g. Fashion, Salon, Repair Shop"
            />
          </div>
          <div className="border-t border-white/5 pt-2">
            <Toggle label="Require Website"       value={cfg.requireWebsite}    onChange={v => set('requireWebsite', v)}    />
            <Toggle label="Require Email"          value={cfg.requireEmail}      onChange={v => set('requireEmail', v)}      />
            <Toggle label="Require Phone"          value={cfg.requirePhone}      onChange={v => set('requirePhone', v)}      />
            <Toggle label="Strict Category Match"  value={cfg.strictMatching}    onChange={v => set('strictMatching', v)}    />
          </div>
        </div>
      </AccordionSection>

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 px-4 py-2.5 rounded-xl border border-white/8 hover:border-white/15 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
        <motion.button
          onClick={() => onConfirm(cfg)}
          whileHover={{ scale: 1.02, boxShadow: '0 0 22px rgba(139,92,246,0.4)' }}
          whileTap={{ scale: 0.97 }}
          className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2.5 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Launch Campaign
        </motion.button>
      </div>
    </motion.div>
  );
};
