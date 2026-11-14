import React from 'react';
import { GraduationCap, Briefcase } from 'lucide-react';
import { AssistantMode, Language } from '../types';

interface ModeSwitcherProps {
  mode: AssistantMode;
  onChangeMode: (mode: AssistantMode) => void;
  language: Language;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onChangeMode, language }) => {
  return (
    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 select-none">
      {/* Course Tutor Tab */}
      <button
        onClick={() => onChangeMode('course_tutor')}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
          mode === 'course_tutor'
            ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <GraduationCap className={`w-4 h-4 ${mode === 'course_tutor' ? 'text-emerald-600' : 'text-slate-400'}`} />
        <span>{language === 'am' ? 'የኮርስ አስጠኚ' : '🎓 Course Tutor'}</span>
      </button>

      {/* Career Coach Tab */}
      <button
        onClick={() => onChangeMode('career_coach')}
        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
          mode === 'career_coach'
            ? 'bg-white text-emerald-800 shadow-sm border border-slate-200'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Briefcase className={`w-4 h-4 ${mode === 'career_coach' ? 'text-emerald-600' : 'text-slate-400'}`} />
        <span>{language === 'am' ? 'የስራ አሰልጣኝ' : '💼 Career Coach'}</span>
      </button>
    </div>
  );
};
