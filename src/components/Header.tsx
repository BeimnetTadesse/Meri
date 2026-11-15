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
    <div
      className="px-4 py-3 border-b border-white/15 flex items-center justify-between rounded-t-2xl select-none text-white shadow-sm transition-colors duration-200"
      style={{ backgroundColor: primaryColor }}
    >
      {/* Brand & Status */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Brand Icon / Logo */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-white/20 border border-white/25 shadow-sm overflow-hidden shrink-0"
        >
          {logoUrl && logoUrl.startsWith('http') ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Sparkles className="w-4 h-4 text-white" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-white text-sm sm:text-base leading-tight truncate max-w-[140px] sm:max-w-[180px]">
              {assistantTitle}
            </h2>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white border border-white/30 shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Online
            </span>
          </div>
          <p className="text-[11px] text-white/85 font-medium truncate max-w-[140px] sm:max-w-[180px]">{subtitle}</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Language Toggle */}
        <button
          onClick={onToggleLanguage}
          title={language === 'en' ? 'ወደ አማርኛ ይቀይሩ' : 'Switch to English'}
          className="px-2 py-1 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20 flex items-center gap-1"
        >
          <span className={language === 'en' ? 'font-black text-white' : 'text-white/60'}>
            EN
          </span>
          <span className="text-white/40">|</span>
          <span className={language === 'am' ? 'font-black text-white' : 'text-white/60'}>
            አማ
          </span>
        </button>

        {/* Read-Aloud / Audio button (respects voice toggle & instant TTS stop) */}
        {allowVoice && (
          <button
            onClick={onToggleAudio}
            title={isSpeaking ? (language === 'am' ? 'ድምጽ አቁም' : 'Stop speaking') : (language === 'am' ? 'ድምጽ አሰማ' : 'Read aloud')}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-white/90 hover:bg-white/20'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Live Help Escalation button (respects human_support toggle) */}
        {allowHumanHelp && (
          <button
            onClick={onOpenLiveHelp}
            title="Connect with Human Live Tutor (የሰው እገዛ)"
            className="px-2 py-1 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/20 flex items-center gap-1 text-white transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Help</span>
          </button>
        )}

        {/* Minimize Button */}
        <button
          onClick={onMinimize}
          title="Minimize"
          className="w-7 h-7 rounded-lg text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          title="Close"
          className="w-7 h-7 rounded-lg text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
