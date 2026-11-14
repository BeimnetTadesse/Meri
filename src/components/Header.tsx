import React from 'react';
import { Sparkles, Minus, X, Volume2, UserCheck } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onOpenLiveHelp: () => void;
  isSpeaking: boolean;
  onToggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onMinimize,
  onClose,
  onOpenLiveHelp,
  isSpeaking,
  onToggleAudio,
}) => {
  return (
    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl select-none">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        {/* Brand Icon */}
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
          <Sparkles className="w-5 h-5 text-emerald-100" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-base leading-tight">Meri (መሪ)</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">AI Guide • አስጠኚ</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5">
        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          title={language === 'en' ? 'ወደ አማርኛ ይቀይሩ' : 'Switch to English'}
          className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 flex items-center gap-1"
        >
          <span className={language === 'en' ? 'text-emerald-700 font-black' : 'text-slate-400'}>EN</span>
          <span className="text-slate-300">|</span>
          <span className={language === 'am' ? 'text-emerald-700 font-black' : 'text-slate-400'}>አማ</span>
        </button>

        {/* Read-Aloud / Audio button */}
        <button
          onClick={onToggleAudio}
          title={isSpeaking ? 'ድምጽ አቁም' : 'ድምጽ አሰማ (Read Aloud)'}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            isSpeaking
              ? 'bg-emerald-100 text-emerald-800 animate-pulse'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>

        {/* Live Help Escalation button */}
        <button
          onClick={onOpenLiveHelp}
          title="Connect with Human Live Tutor (የሰው እገዛ)"
          className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 transition-all"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Live Help</span>
        </button>

        {/* Minimize Button */}
        <button
          onClick={onMinimize}
          title="Minimize"
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          title="Close"
          className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
