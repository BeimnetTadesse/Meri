import React from 'react';
import { Sparkles } from 'lucide-react';
import { PlatformConfig } from '../types';

interface LauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
  config?: PlatformConfig;
}

export const Launcher: React.FC<LauncherProps> = ({ isOpen, onToggle, unreadCount = 1, config }) => {
  if (isOpen) return null;

  const chatBtnColor = config?.theme?.chat_button || config?.theme?.primary || '#16A34A';
  const isLeft = config?.position === 'bottom-left' || config?.position === 'top-left';
  const assistantName = config?.branding?.assistant_name || `${config?.platform_name || 'Savanna'} Assistant`;

  return (
    <div
      className={`fixed bottom-6 ${
        isLeft ? 'left-6 flex-row-reverse' : 'right-6'
      } z-[999999] flex items-center gap-3 font-sans select-none`}
    >
      {/* Tooltip / Micro-label */}
      <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-xs shadow-lg backdrop-blur-sm border border-slate-700 animate-slide-up">
        <span className="font-medium">Ask {assistantName}</span>
        <span className="bg-white/20 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
          Always Ready
        </span>
      </div>

      {/* Docked Launcher Button */}
      <button
        onClick={onToggle}
        aria-label={`Open ${assistantName}`}
        style={{ backgroundColor: chatBtnColor }}
        className="relative group w-14 h-14 rounded-full active:scale-95 transition-all duration-200 flex items-center justify-center text-white shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        <Sparkles className="w-7 h-7 text-white transition-transform duration-300 group-hover:rotate-12" />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-sm animate-pulse-subtle">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
