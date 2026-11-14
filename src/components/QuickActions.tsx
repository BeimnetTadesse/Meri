import React from 'react';
import { Lightbulb, Edit3, HelpCircle, Briefcase, CheckCircle, Mic, Accessibility } from 'lucide-react';
import { AssistantMode, Language } from '../types';

interface QuickActionsProps {
  mode: AssistantMode;
  language: Language;
  onSelectAction: (query: string) => void;
  onOpenAccommodations: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  mode,
  language,
  onSelectAction,
  onOpenAccommodations,
}) => {
  if (mode === 'career_coach') {
    return (
      <div className="py-2 select-none">
        <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
          <span>⚡</span>
          <span>{language === 'am' ? 'የስራ ፈጣን ጥያቄዎች፡' : 'Quick questions for this job:'}</span>
        </p>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() =>
              onSelectAction(
                language === 'am' ? 'ይህ ስራ ምን እንደሚፈልግ በአጭሩ አስረዳኝ' : 'Explain this job and its daily responsibilities.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'am' ? 'ይህን ስራ አስረዳኝ' : 'Explain this job'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am' ? 'ለዚህ ስራ በክህሎቴ ብቁ ነኝ ወይ?' : 'Am I qualified for this role based on my ALX skills?'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'am' ? 'ብቁ ነኝ?' : 'Am I qualified?'}</span>
          </button>

          <button
            onClick={() =>
              onSelectAction(
                language === 'am' ? 'ለዚህ ስራ የተለመዱ የቃለ መጠይቅ ጥያቄዎችን አዘጋጅተህ ጠይቀኝ' : 'Start a mock interview prep for this role.'
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
          >
            <Mic className="w-3.5 h-3.5 text-purple-600" />
            <span>{language === 'am' ? 'የቃለ መጠይቅ ልምምድ' : 'Mock interview'}</span>
          </button>

          <button
            onClick={onOpenAccommodations}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all shadow-2xs"
          >
            <Accessibility className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'am' ? 'የቃለ መጠይቅ ድጋፍ ጠይቅ' : 'Request accommodations'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Course Tutor Mode (Savanna)
  return (
    <div className="py-2 select-none">
      <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
        <span>⚡</span>
        <span>{language === 'am' ? 'ለዚህ ትምህርት ፈጣን ጥያቄዎች፡' : 'Quick questions for this lesson:'}</span>
      </p>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() =>
            onSelectAction(
              language === 'am' ? 'ይህ ትምህርት ስለ ምንድን ነው የሚያስረዳው?' : 'Explain this lesson in clear detail.'
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'am' ? '💡 ይህን ትምህርት አስረዳኝ' : '💡 Explain this lesson'}</span>
        </button>

        <button
          onClick={() =>
            onSelectAction(
              language === 'am' ? 'ይህን ትምህርት በጣም በቀላል ቃላት አጠቃልለህ ንገረኝ' : 'Summarize the core takeaways simply.'
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'am' ? '✍️ በቀላሉ አጠቃልል' : '✍️ Summarize simply'}</span>
        </button>

        <button
          onClick={() =>
            onSelectAction(
              language === 'am' ? 'በክፍል 2 የተጠቀሱትን አስቸጋሪ ቃላትና ልዩነቶች አብራራልኝ' : 'Can you explain what separates a General Virtual Assistant from a Specialized one based on Section 2?'
            )
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition-all shadow-2xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>{language === 'am' ? '❓ አስቸጋሪ ቃላት' : '❓ Difficult terms'}</span>
        </button>
      </div>
    </div>
  );
};
