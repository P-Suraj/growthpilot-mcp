import React, { useState, useEffect } from 'react';
import type { Draft, Company } from '../../types/index.js';
import { Copy, Save, Check, FileText, Globe, Phone, ExternalLink, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailPanelProps {
  draft: Draft;
  company: Company;
  onSave: (body: string) => void;
  onApprove: () => void;
}

export const EmailPanel: React.FC<EmailPanelProps> = ({ draft, company, onSave, onApprove }) => {
  const [body, setBody] = useState(draft.body);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => { setBody(draft.body); }, [draft.body]);

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave(body);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDispatch = () => {
    onApprove();
    setDispatched(true);
    setTimeout(() => setDispatched(false), 2500);
  };

  const hasEmail = Boolean(company.email && company.email.length > 3);
  const hasWebsite = Boolean(company.website && company.website.length > 4);
  const hasPhone = Boolean(company.phone && company.phone.length > 4);
  const hasLinkedIn = Boolean((company as any).socialLinks?.linkedin);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <FileText className="w-4 h-4 text-brand-400" />
          <span>Outreach Email</span>
          <span className="text-[10px] bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full font-mono">
            V{draft.version}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs bg-gray-900 border border-white/5 hover:border-brand-500/30 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-xs bg-gray-900 border border-white/5 hover:border-brand-500/30 px-3 py-1.5 rounded-lg text-gray-300 hover:text-white transition-all"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Email content */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
          <span className="font-semibold text-gray-400">Subject:</span>
          <span className="text-white">{draft.subject}</span>
        </div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          className="w-full min-h-[200px] bg-gray-950/40 border border-white/5 focus:border-brand-500/30 rounded-xl p-4 text-sm font-sans leading-relaxed text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500/20 resize-none"
        />
      </div>

      {/* Send / No-email fallback */}
      <div className="pt-1">
        {hasEmail ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <Mail className="w-3.5 h-3.5" />
              {company.email}
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDispatch}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center gap-2 cursor-pointer ${
                dispatched ? 'bg-emerald-600 text-white' : 'bg-brand-500 hover:bg-brand-600 text-white'
              }`}
            >
              {dispatched ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
              {dispatched ? 'Sent' : 'Send Email'}
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>No verified email found. Use an alternative contact method.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hasWebsite && (
                <a
                  href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-gray-900 border border-white/10 hover:border-brand-500/30 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Open Website
                </a>
              )}
              {hasPhone && (
                <button
                  onClick={() => navigator.clipboard.writeText(company.phone!)}
                  className="flex items-center gap-1.5 text-xs bg-gray-900 border border-white/10 hover:border-brand-500/30 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Copy Phone
                </button>
              )}
              {hasLinkedIn && (
                <a
                  href={(company as any).socialLinks?.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-gray-900 border border-white/10 hover:border-brand-500/30 px-3 py-2 rounded-lg text-gray-300 hover:text-white transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
