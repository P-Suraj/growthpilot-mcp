import React, { useState, useEffect } from 'react';
import type { Draft } from '../../types/index.js';
import { Copy, Save, Check, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailPanelProps {
  draft: Draft;
  onSave: (body: string) => void;
  onApprove: () => void;
}

export const EmailPanel: React.FC<EmailPanelProps> = ({ draft, onSave, onApprove }) => {
  const [body, setBody] = useState(draft.body);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  useEffect(() => {
    setBody(draft.body);
  }, [draft.body]);

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

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <FileText className="w-4 h-4 text-brand-400" />
          <span>Outreach Email Copy</span>
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

      {/* Editor Box */}
      <div className="space-y-2">
        <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
          <span className="font-semibold text-gray-400">Subject:</span>
          <span className="text-white">{draft.subject}</span>
        </div>
        
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full min-h-[220px] bg-gray-950/40 border border-white/5 focus:border-brand-500/30 rounded-xl p-4 text-sm font-sans leading-relaxed text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500/20 resize-none font-sans"
        />
      </div>

      {/* Action / Send */}
      <div className="pt-2 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDispatch}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold tracking-tight shadow-md flex items-center gap-2 ${
            dispatched 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
              : 'bg-brand-500 hover:bg-brand-600 text-white'
          }`}
        >
          {dispatched ? <Check className="w-4 h-4" /> : null}
          {dispatched ? 'Dispatched' : 'Approve & Send Email'}
        </motion.button>
      </div>
    </div>
  );
};
