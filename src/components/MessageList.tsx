import React from 'react';
import { Volume2, VolumeX, ExternalLink, User, Sparkles } from 'lucide-react';
import { Message, Language } from '../types';
import { highlightHostSection } from '../context/context-extractor';

interface MessageListProps {
  messages: Message[];
  language: Language;
  onSpeak: (text: string, messageId: string) => void;
  onStopSpeak: () => void;
  currentlySpeakingId: string | null;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  language,
  onSpeak,
  onStopSpeak,
  currentlySpeakingId,
}) => {
  return (
    <div className="flex flex-col gap-4 py-2 font-sans">
      {messages.map((msg) => {
        const isUser = msg.sender === 'user';
        const isSpeaking = currentlySpeakingId === msg.id;

        if (isUser) {
          return (
            <div key={msg.id} className="flex justify-end gap-2 items-end">
              <div className="flex flex-col items-end max-w-[85%]">
                <div className="bg-emerald-100/90 text-slate-900 px-4 py-2.5 rounded-2xl rounded-br-xs text-sm leading-relaxed border border-emerald-200/60 shadow-2xs">
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 mr-1">{msg.timestamp}</span>
              </div>

              {/* User Avatar */}
              <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs shrink-0 mb-4 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            </div>
          );
        }

        // Assistant Message
        const isGreeting = msg.id === 'greeting';

        return (
          <div key={msg.id} className="flex justify-start gap-2.5 items-start">
            {/* Assistant Avatar */}
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-sm shadow-emerald-600/30">
              <Sparkles className="w-4 h-4 text-emerald-100" />
            </div>

            <div className="flex flex-col max-w-[88%]">
              <div
                className={`px-4 py-3 rounded-2xl rounded-tl-xs text-sm leading-relaxed shadow-2xs border ${
                  isGreeting
                    ? 'bg-purple-50/80 text-slate-900 border-purple-200/70'
                    : 'bg-white text-slate-900 border-slate-200/80'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Citations Card */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-col gap-2">
                    {msg.citations.map((cite) => (
                      <div
                        key={cite.id}
                        className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <span>📖</span>
                            <span>{cite.title}</span>
                          </span>
                          <button
                            onClick={() => highlightHostSection(cite.section)}
                            className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-0.5 hover:underline"
                            title="Scroll to this section on the page"
                          >
                            <span>{language === 'am' ? 'ገጹን አሳይ' : 'Jump to source'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-slate-600 italic line-clamp-2">{cite.snippet}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Footer: Timestamp, Savanna Sync, Audio button */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 ml-1">
                <span>{msg.timestamp} {msg.syncSource ? `• ${msg.syncSource}` : ''}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => (isSpeaking ? onStopSpeak() : onSpeak(msg.text, msg.id))}
                    className="hover:text-emerald-700 flex items-center gap-1 transition-colors"
                    title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-[10px] text-rose-600 font-semibold">Speaking...</span>
                      </>
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
