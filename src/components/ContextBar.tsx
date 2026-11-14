import React from 'react';
import { MapPin, RefreshCw, BookOpen } from 'lucide-react';
import { PageContext, Language } from '../types';

interface ContextBarProps {
  context: PageContext;
  onRefreshContext: () => void;
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
  language: Language;
}

export const ContextBar: React.FC<ContextBarProps> = ({
  context,
  onRefreshContext,
  simpleMode,
  onToggleSimpleMode,
  language,
}) => {
  const isJob = context.pageType === 'job';
  const label = isJob
    ? `Job: ${context.jobTitle || 'Tech Opportunity'}`
    : `Lesson: ${context.lessonName || context.title || 'Course Content'}`;

  return (
    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 text-xs select-none">
      {/* Active Host Context Pill */}
      <button
        onClick={onRefreshContext}
        title="Sync context from host page (ገጹን ዳግም አንብብ)"
        className="flex-1 min-w-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:text-emerald-800 transition-all text-left shadow-2xs group"
      >
        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span className="truncate font-medium">{label}</span>
        <RefreshCw className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-300 shrink-0 ml-auto" />
      </button>

      {/* Simple Mode Toggle */}
      <button
        onClick={onToggleSimpleMode}
        title={simpleMode ? 'ቀላል ሁነታ በርቷል (Simple Mode On)' : 'ወደ ቀላል ሁነታ ቀይር (Switch to Simple Mode)'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border transition-all shrink-0 shadow-2xs ${
          simpleMode
            ? 'bg-purple-100 text-purple-900 border-purple-300 shadow-sm'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
        }`}
      >
        <BookOpen className={`w-3.5 h-3.5 ${simpleMode ? 'text-purple-700' : 'text-slate-500'}`} />
        <span>{language === 'am' ? 'ቀላል ሁነታ' : 'Simple / ቀላል'}</span>
      </button>
    </div>
  );
};
