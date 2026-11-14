import React, { useState, useEffect, useRef } from 'react';
import { Launcher } from './Launcher';
import { Header } from './Header';
import { ContextBar } from './ContextBar';
import { ModeSwitcher } from './ModeSwitcher';
import { StatusRibbon } from './StatusRibbon';
import { MessageList } from './MessageList';
import { QuickActions } from './QuickActions';
import { MessageInput } from './MessageInput';
import { HumanHelpModal } from './HumanHelpModal';
import { AccommodationsModal } from './AccommodationsModal';
import { Language, AssistantMode, Message, PageContext } from '../types';
import { extractPageContext } from '../context/context-extractor';
import { askMeriAI } from '../services/ai-service';
import { SpeechService } from '../services/speech';

interface WidgetProps {
  publicKey?: string;
  shadowRoot?: ShadowRoot;
}

export const Widget: React.FC<WidgetProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [simpleMode, setSimpleMode] = useState(false);
  const [mode, setMode] = useState<AssistantMode>('course_tutor');
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLiveHelp, setShowLiveHelp] = useState(false);
  const [showAccommodations, setShowAccommodations] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Page Context
  const [context, setContext] = useState<PageContext>(() => extractPageContext());

  // Conversation history
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync initial context and greeting
  useEffect(() => {
    const ctx = extractPageContext();
    setContext(ctx);

    if (ctx.pageType === 'job') {
      setMode('career_coach');
    }

    const initialGreeting: Message = {
      id: 'greeting',
      sender: 'assistant',
      text:
        language === 'am'
          ? `ሰላም! እኔ መሪ (Meri)፣ የትምህርትና የስራ አጋርዎ ነኝ። ይህንን ገጽ "${ctx.title}" ከእርስዎ ጋር አንብቤዋለሁ። ዛሬ እንዴት ልርዳዎት እችላለሁ?`
          : `ሰላም! I'm Meri (መሪ), your AI study & career companion. I've read this page with you. How can I guide you today? / እንዴት ልርዳዎት እችላለሁ?`,
      timestamp: '09:41 AM',
      syncSource: 'Savanna Sync',
    };

    setMessages([initialGreeting]);
  }, []);

  // Update greeting text if language changes while only greeting exists
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'greeting') {
      setMessages([
        {
          id: 'greeting',
          sender: 'assistant',
          text:
            language === 'am'
              ? `ሰላም! እኔ መሪ (Meri)፣ የትምህርትና የስራ አጋርዎ ነኝ። ይህንን ገጽ "${context.title}" ከእርስዎ ጋር አንብቤዋለሁ። ዛሬ እንዴት ልርዳዎት እችላለሁ?`
              : `ሰላም! I'm Meri (መሪ), your AI study & career companion. I've read this page with you. How can I guide you today? / እንዴት ልርዳዎት እችላለሁ?`,
          timestamp: '09:41 AM',
          syncSource: 'Savanna Sync',
        },
      ]);
    }
  }, [language]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleRefreshContext = () => {
    const updated = extractPageContext();
    setContext(updated);
    if (updated.pageType === 'job') {
      setMode('career_coach');
    }
    const syncMsg: Message = {
      id: `sync-${Date.now()}`,
      sender: 'assistant',
      text:
        language === 'am'
          ? `ገጹ ዳግም ተነቧል! አሁን ያለው ገጽ፡ "${updated.title}"`
          : `Page context synced! Current active content: "${updated.title}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      syncSource: 'Host Sync',
    };
    setMessages((prev) => [...prev, syncMsg]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askMeriAI(text, context, language, simpleMode, mode);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        syncSource: response.source === 'cloud' ? 'Cloud AI' : 'Savanna Grounded',
        citations: response.citations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLiveAnnouncement(`New answer from Meri: ${response.answer.slice(0, 100)}`);
    } catch {
      const fallbackMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'am'
            ? 'ይቅርታ፣ ምላሽ ለመስጠት አልተቻለም። እባክዎ እንደገና ይሞክሩ።'
            : 'Sorry, I encountered an issue processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Speech-To-Text
  const handleToggleListening = () => {
    if (isListening) {
      SpeechService.stopListening();
      setIsListening(false);
    } else {
      const started = SpeechService.startListening(
        language,
        (transcript) => {
          setIsListening(false);
          handleSendMessage(transcript);
        },
        () => {
          setIsListening(false);
        }
      );
      if (started) {
        setIsListening(true);
      }
    }
  };

  // Voice Text-To-Speech
  const handleSpeak = (text: string) => {
    setIsSpeaking(true);
    setCurrentlySpeakingId('manual');
    SpeechService.speak(text, language, voiceRate, () => {
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    });
  };

  const handleStopSpeak = () => {
    SpeechService.stopSpeaking();
    setIsSpeaking(false);
    setCurrentlySpeakingId(null);
  };

  const handleCycleVoiceRate = () => {
    const nextRate = voiceRate === 1.0 ? 1.25 : voiceRate === 1.25 ? 0.75 : 1.0;
    setVoiceRate(nextRate);
  };

  return (
    <div className="font-sans antialiased text-slate-900 select-none">
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite">
        {liveAnnouncement}
      </div>

      {/* Docked Launcher when closed */}
      <Launcher isOpen={isOpen} onToggle={() => setIsOpen(true)} unreadCount={messages.length <= 1 ? 1 : 0} />

      {/* Chat Window when open */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[999999] w-[92vw] sm:w-[410px] h-[630px] max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <Header
            language={language}
            onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'am' : 'en'))}
            onMinimize={() => setIsOpen(false)}
            onClose={() => setIsOpen(false)}
            onOpenLiveHelp={() => setShowLiveHelp(true)}
            isSpeaking={isSpeaking}
            onToggleAudio={() => (isSpeaking ? handleStopSpeak() : handleSpeak(messages[messages.length - 1]?.text || ''))}
          />

          {/* Context Bar */}
          <ContextBar
            context={context}
            onRefreshContext={handleRefreshContext}
            simpleMode={simpleMode}
            onToggleSimpleMode={() => setSimpleMode((s) => !s)}
            language={language}
          />

          {/* Mode Switcher */}
          <ModeSwitcher mode={mode} onChangeMode={setMode} language={language} />

          {/* Accessibility & Status Ribbon */}
          <StatusRibbon
            language={language}
            voiceRate={voiceRate}
            onCycleVoiceRate={handleCycleVoiceRate}
          />

          {/* Scrollable Conversation Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-slate-50/50">
            <MessageList
              messages={messages}
              language={language}
              onSpeak={handleSpeak}
              onStopSpeak={handleStopSpeak}
              currentlySpeakingId={currentlySpeakingId}
            />

            {/* Quick Actions */}
            <div className="mt-2">
              <QuickActions
                mode={mode}
                language={language}
                onSelectAction={handleSendMessage}
                onOpenAccommodations={() => setShowAccommodations(true)}
              />
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 py-3 text-xs text-slate-500 italic">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>{language === 'am' ? 'መሪ እያሰበ ነው...' : 'Meri is reading page content...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <MessageInput
            onSendMessage={handleSendMessage}
            language={language}
            isLoading={isLoading}
            isListening={isListening}
            onToggleListening={handleToggleListening}
          />
        </div>
      )}

      {/* Human Live Help Modal */}
      <HumanHelpModal
        isOpen={showLiveHelp}
        onClose={() => setShowLiveHelp(false)}
        language={language}
      />

      {/* Career Gateway: Interview Accommodations Modal */}
      <AccommodationsModal
        isOpen={showAccommodations}
        onClose={() => setShowAccommodations(false)}
        language={language}
        context={context}
      />
    </div>
  );
};
