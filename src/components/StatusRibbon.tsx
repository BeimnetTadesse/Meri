import React from 'react';
import { ShieldCheck, Volume2, Eye } from 'lucide-react';
import { Language } from '../types';

interface StatusRibbonProps {
  language: Language;
  voiceRate: number;
  onCycleVoiceRate: () => void;
}

export const StatusRibbon: React.FC<StatusRibbonProps> = ({
  language,
  voiceRate,
  onCycleVoiceRate,
}) => {
  return (
    <div className="px-4 py-1.5 bg-slate-100/80 border-b border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-medium select-none">
      {/* Low Bandwidth badge */}
      <div className="flex items-center gap-1 text-emerald-800">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>{language === 'am' ? 'ለደካማ ኢንተርኔት የተመቻቸ' : 'Low-Bandwidth Optimized'}</span>
      </div>

      {/* Voice Speed Toggle */}
      <button
        onClick={onCycleVoiceRate}
        title="Cycle speech speed (የድምጽ ፍጥነት ቀይር)"
        className="flex items-center gap-1 hover:text-emerald-700 hover:bg-slate-200/60 px-1.5 py-0.5 rounded transition-all"
      >
        <Volume2 className="w-3 h-3 text-slate-400" />
        <span>{voiceRate}x Voice</span>
      </button>

      {/* Accessibility Contrast badge */}
      <div className="flex items-center gap-1 text-slate-600 font-semibold">
        <Eye className="w-3 h-3 text-slate-400" />
        <span>AAA 11:1</span>
      </div>
    </div>
  );
};
