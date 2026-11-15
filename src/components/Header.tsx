import React from 'react';
import { Sparkles, Minus, X, Volume2, VolumeX, UserCheck } from 'lucide-react';
import { Language, PlatformConfig } from '../types';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onOpenLiveHelp: () => void;
  isSpeaking: boolean;
  onToggleAudio: () => void;
  config?: PlatformConfig;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  onMinimize,
  onClose,
  onOpenLiveHelp,
  isSpeaking,
  onToggleAudio,
  config,
}) => {
  const primaryColor = config?.theme?.primary || '#16A34A';
  const assistantTitle = config?.branding?.assistant_name || `${config?.platform_name || 'Savanna'} Assistant`;
  const subtitle = config?.branding?.subtitle || `${config?.platform_name || 'Savanna'} AI Guide • አስጠኚ`;
  const logoUrl = config?.branding?.logo_url;
  const allowVoice = config?.features?.voice !== false;
  const allowHumanHelp = config?.features?.human_support !== false;

  return (
    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-2xl select-none">
      {/* Brand & Status */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Brand Icon / Logo */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm overflow-hidden shrink-0 transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          {logoUrl && logoUrl.startsWith('http') ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate max-w-[150px] sm:max-w-[190px]">
              {assistantTitle}
            </h2>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0"
              style={{
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                borderColor: `${primaryColor}30`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }}></span>
              Online
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px] sm:max-w-[190px]">{subtitle}</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          title={language === 'en' ? 'ወደ አማርኛ ይቀይሩ' : 'Switch to English'}
          className="px-2 py-1 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all text-slate-700 flex items-center gap-1"
        >
          <span style={{ color: language === 'en' ? primaryColor : undefined }} className={language === 'en' ? 'font-black' : 'text-slate-400'}>
            EN
          </span>
          <span className="text-slate-300">|</span>
          <span style={{ color: language === 'am' ? primaryColor : undefined }} className={language === 'am' ? 'font-black' : 'text-slate-400'}>
            አማ
          </span>
        </button>

        {/* Read-Aloud / Audio button (respects voice toggle & instant TTS stop) */}
        {allowVoice && (
          <button
            onClick={onToggleAudio}
            title={isSpeaking ? (language === 'am' ? 'ድምጽ አቁም' : 'Stop speaking') : (language === 'am' ? 'ድምጽ አሰማ' : 'Read aloud')}
            style={
              !isSpeaking
                ? undefined
                : {
                    backgroundColor: '#ffe4e6',
                    color: '#be123c',
                  }
            }
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isSpeaking
                ? 'bg-rose-100 text-rose-700 animate-pulse'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}

        {/* Live Help Escalation button (respects human_support toggle) */}
        {allowHumanHelp && (
          <button
            onClick={onOpenLiveHelp}
            title="Connect with Human Live Tutor (የሰው እገዛ)"
            style={{
              backgroundColor: `${primaryColor}10`,
              color: primaryColor,
              borderColor: `${primaryColor}30`,
            }}
            className="px-2 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 hover:brightness-95 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Help</span>
          </button>
        )}

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
