import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Mic, Send, Lock } from 'lucide-react';
import { Language, PlatformConfig } from '../types';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  language: Language;
  isLoading: boolean;
  isListening: boolean;
  listeningPreview?: string;
  onToggleListening: () => void;
  config?: PlatformConfig;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  language,
  isLoading,
  isListening,
  listeningPreview,
  onToggleListening,
  config,
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const primaryColor = config?.theme?.primary || '#16A34A';
  const allowVoice = config?.features?.voice !== false;

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="p-3 bg-white border-t border-slate-100 rounded-b-2xl select-none">
      {/* Input container */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl border border-slate-200 bg-slate-50/70 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200 transition-all shadow-2xs">
        {/* Attachment button */}
        <button
          type="button"
          title="Attach notes or screenshots"
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Voice Input Mic Button (respects feature flag) */}
        {allowVoice && (
          <button
            type="button"
            onClick={onToggleListening}
            title={isListening ? 'ማዳመጥ አቁም (Stop voice)' : 'በድምጽ ይጠይቁ (Voice input)'}
            style={{
              backgroundColor: isListening ? primaryColor : undefined,
            }}
            className={`relative p-1.5 rounded-lg transition-all ${
              isListening
                ? 'text-white animate-pulse'
                : 'text-slate-500 hover:text-emerald-700 hover:bg-slate-200/60'
            }`}
          >
            <Mic className="w-4 h-4" />
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
            )}
          </button>
        )}

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? listeningPreview
                ? `🎙️ "${listeningPreview}..."`
                : language === 'am'
                ? 'እያዳመጥኩ ነው... ይናገሩ'
                : 'Listening... speak now'
              : language === 'am'
              ? 'ስለዚሁ ገጽ ማንኛውንም ይጠይቁ...'
              : 'Ask anything about this page...'
          }
          className="flex-1 bg-transparent border-none text-slate-900 text-sm focus:outline-none placeholder-slate-400 px-1 py-1 font-sans"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          style={{
            backgroundColor: text.trim() && !isLoading ? primaryColor : undefined,
          }}
          className={`p-2 rounded-lg font-bold flex items-center justify-center transition-all ${
            text.trim() && !isLoading
              ? 'text-white shadow-xs active:scale-95 hover:brightness-110'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          title="Send message (ላክ)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Footer helper & encryption row */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
        <div className="flex items-center gap-1 text-slate-500">
          <Lock className="w-3 h-3" style={{ color: primaryColor }} />
          <span>{language === 'am' ? 'የተጠበቀ እና ሚስጥራዊ' : 'Private & End-to-End Encrypted'}</span>
        </div>

        <div className="text-[10px]">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-600 font-mono">Enter</kbd> to ask
        </div>
      </div>
    </div>
  );
};
