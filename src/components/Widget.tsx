import React, { useState, useEffect, useRef } from 'react';
import { Launcher } from './Launcher';
import { Header } from './Header';
import { ContextBar } from './ContextBar';
import { StatusRibbon } from './StatusRibbon';
import { MessageList } from './MessageList';
import { QuickActions } from './QuickActions';
import { MessageInput } from './MessageInput';
import { HumanHelpModal } from './HumanHelpModal';
import { AccommodationsModal } from './AccommodationsModal';
import { Language, Message, PageContext, PlatformConfig } from '../types';
import { extractPageContext, initSpaContextTracking } from '../context/context-extractor';
import { askMeriAI } from '../services/ai-service';
import { SpeechService } from '../services/speech';

interface WidgetProps {
  publicKey?: string;
  shadowRoot?: ShadowRoot;
  config?: PlatformConfig;
}

export const Widget: React.FC<WidgetProps> = ({ publicKey, config: initialConfig }) => {
  const [liveConfig, setLiveConfig] = useState<PlatformConfig | undefined>(initialConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>(initialConfig?.language || 'en');
  const [simpleMode, setSimpleMode] = useState(false);
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

  // Sync config updates from live background sync
  useEffect(() => {
    if (initialConfig) {
      setLiveConfig(initialConfig);
    }
  }, [initialConfig]);

  useEffect(() => {
    const handleConfigEvent = (e: Event) => {
      const customEvent = e as CustomEvent<PlatformConfig>;
      if (customEvent.detail) {
        setLiveConfig(customEvent.detail);
      }
    };
    window.addEventListener('meri:config-updated', handleConfigEvent);
    return () => {
      window.removeEventListener('meri:config-updated', handleConfigEvent);
    };
  }, []);

  const generateGreeting = (ctx: PageContext, lang: Language): string => {
    const assistant = liveConfig?.branding?.assistant_name || `${liveConfig?.platform_name || 'Meri'} (መሪ)`;

    if (liveConfig?.welcome_message && (ctx.pageType === 'general' || ctx.pageType === 'course')) {
      return liveConfig.welcome_message;
    }

    switch (ctx.pageType) {
      case 'job':
        return lang === 'am'
          ? `ሰላም! እኔ ${assistant}፣ የእርስዎ የስራ አሰልጣኝ ነኝ። የ"${ctx.jobTitle || 'ቴክኖሎጂ'}" የስራ እድልን ከእርስዎ ጋር እያየሁ ነው። ለቃለ-መጠይቅ ለመዘጋጀት፣ የክህሎት ብቃትዎን ለማወቅ ወይም የድጋፍ ጥያቄ ለማቅረብ እንዴት ልርዳዎት?`
          : `ሰላም! I'm ${assistant}, your Career Coach for this ${ctx.jobTitle || 'Tech Opportunity'} role. I can check your qualification match, run mock interviews, or help request accommodations. How can I guide you today?`;

      case 'assignment':
        return lang === 'am'
          ? `ሰላም! የዚህን ምደባ/ፕሮጀክት "${ctx.title}" መመሪያዎች እና መስፈርቶች እያየሁ ነው። ስራውን ለመረዳት ወይም የተፈለገውን ውጤት ለማምጣት ምን ላብራራልዎት?`
          : `ሰላም! I'm inspecting your assignment "${ctx.title}". I can explain instructions, break down key rubric requirements, or help plan your deliverables. What would you like to review?`;

      case 'application':
        return lang === 'am'
          ? `ሰላም! በማመልከቻ ሂደት ላይ ነዎት። የሽፋን ደብዳቤ (Cover Letter) ለማዘጋጀት ወይም መስፈርቶቹን ለማረጋገጥ እንዴት ልርዳዎት እችላለሁ?`
          : `ሰላም! You're on an application page. I can assist with cover letter suggestions, check your qualifications, and verify your submission checklist. How can I assist?`;

      case 'course':
        if (ctx.url.includes('paced') && !ctx.url.includes('self-paced')) {
          return lang === 'am'
            ? `ሰላም Björn! በWR 100: Fundamentals of Effective Communication (ሳምንት 10) ላይ ነዎት። የሳምንቱ የውይይትና የጽሁፍ ስራዎች እንዴት እየሄዱ ነው?`
            : `ሰላም Björn! I see you are on WR 100: Fundamentals of Effective Communication (Week 10 of 15). How can I assist with your immediate deliverables or score progress today?`;
        }
        return lang === 'am'
          ? `ሰላም Amara! በVA-1: VA Foundations ላይ ነዎት፤ ሞጁል 1 ተጠናቋል። ቀጣዩን ሞጁል ለመጀመር ዝግጁ ነዎት? ምን ላብራራልዎት?`
          : `ሰላም Amara! You are on VA-1: VA Foundations & Professional Identity. Module 1 is complete. How can I guide your next milestone today?`;

      case 'lesson':
        return lang === 'am'
          ? `ሰላም! እኔ ${assistant}፣ የትምህርት አጋርዎ ነኝ። ይህንን የትምህርት ገጽ "${ctx.lessonName || ctx.title}" ከእርስዎ ጋር አንብቤዋለሁ። ዛሬ ምን ላስረዳዎት እችላለሁ?`
          : `ሰላም! I'm ${assistant}, your AI study companion. I've read "${ctx.lessonName || ctx.title}" with you. How can I guide you through this lesson today?`;

      default:
        return (
          liveConfig?.welcome_message ||
          (lang === 'am'
            ? `ሰላም! እኔ ${assistant} ነኝ። ይህንን ገጽ "${ctx.title}" እያየሁ ነው። ዛሬ እንዴት ልርዳዎት እችላለሁ?`
            : `ሰላም! I'm ${assistant}, your AI learning and career guide. I'm active on "${ctx.title}". How can I guide you today?`)
        );
    }
  };

  // Sync initial context and greeting
  useEffect(() => {
    const ctx = extractPageContext();
    setContext(ctx);

    const greeting: Message = {
      id: 'greeting',
      sender: 'assistant',
      text: generateGreeting(ctx, language),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      syncSource: 'Host Sync',
    };

    setMessages([greeting]);

    // Initialize SPA URL change tracking and DOM mutation observation
    initSpaContextTracking((updated) => {
      setContext(updated);
      const syncNotice: Message = {
        id: `sync-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'am'
            ? `አዲስ ገጽ ተገኝቷል፡ "${updated.title}"`
            : `Active page updated: "${updated.title}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        syncSource: 'SPA Route Sync',
      };
      setMessages((prev) => [...prev, syncNotice]);
    });
  }, []);

  // Update greeting text if liveConfig welcome message or language changes while only greeting exists
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([
        {
          id: 'greeting',
          sender: 'assistant',
          text: generateGreeting(context, language),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          syncSource: 'Host Sync',
        },
      ]);
    }
  }, [language, liveConfig?.welcome_message, liveConfig?.platform_name, liveConfig?.branding?.assistant_name]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleRefreshContext = () => {
    const updated = extractPageContext();
    setContext(updated);
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

    // Immediately extract fresh DOM context so the active week/module is always accurate
    const liveContext = extractPageContext();
    setContext(liveContext);

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await askMeriAI(text, liveContext, language, simpleMode, publicKey);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        syncSource: response.source === 'cloud' ? 'Cloud AI' : 'Knowledge Base',
        citations: response.citations,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setLiveAnnouncement(`New answer from Meri: ${response.answer.slice(0, 100)}`);
    } catch {
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'am'
            ? 'ይቅርታ፣ ጥያቄዎን ለማስተናገድ ችግር አጋጥሟል። እባክዎ እንደገና ይሞክሩ።'
            : "I'm sorry, I encountered a temporary connection issue. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const [listeningPreview, setListeningPreview] = useState('');

  // Voice Speech-To-Text
  const handleToggleListening = () => {
    if (isListening) {
      SpeechService.stopListening();
      setIsListening(false);
      setListeningPreview('');
    } else {
      setListeningPreview('');
      const started = SpeechService.startListening(
        language,
        (transcript) => {
          setIsListening(false);
          setListeningPreview('');
          handleSendMessage(transcript);
        },
        () => {
          setIsListening(false);
          setListeningPreview('');
        },
        (interim) => {
          setListeningPreview(interim);
        }
      );
      if (started) {
        setIsListening(true);
      }
    }
  };

  // Voice Text-To-Speech — accepts message id so per-message stop button works
  const handleSpeak = (text: string, messageId?: string) => {
    SpeechService.stopSpeaking(); // Cancel any in-progress speech first
    const speakingId = messageId ?? 'manual';
    setIsSpeaking(true);
    setCurrentlySpeakingId(speakingId);
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
      <Launcher isOpen={isOpen} onToggle={() => setIsOpen(true)} unreadCount={messages.length <= 1 ? 1 : 0} config={liveConfig} />

      {/* Chat Window when open */}
      {isOpen && (
        <div
          className={`fixed bottom-6 ${
            liveConfig?.position === 'bottom-left' || liveConfig?.position === 'top-left' ? 'left-6' : 'right-6'
          } z-[999999] w-[92vw] sm:w-[410px] h-[630px] max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-slide-up`}
        >
          {/* Header */}
          <Header
            language={language}
            onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'am' : 'en'))}
            onMinimize={() => setIsOpen(false)}
            onClose={() => setIsOpen(false)}
            onOpenLiveHelp={() => setShowLiveHelp(true)}
            isSpeaking={isSpeaking}
            onToggleAudio={() => {
              if (isSpeaking) {
                handleStopSpeak();
              } else {
                const lastAssistantMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
                if (lastAssistantMsg) {
                  handleSpeak(lastAssistantMsg.text, lastAssistantMsg.id);
                }
              }
            }}
            config={liveConfig}
          />

          {/* Context Bar */}
          <ContextBar
            context={context}
            onRefreshContext={handleRefreshContext}
            simpleMode={simpleMode}
            onToggleSimpleMode={() => setSimpleMode((s) => !s)}
            language={language}
            config={liveConfig}
          />

          {/* Status / Accessibility Ribbon */}
          <StatusRibbon
            language={language}
            voiceRate={voiceRate}
            onCycleVoiceRate={handleCycleVoiceRate}
          />

          {/* Unified Conversation Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-2 bg-slate-50/50">
            <MessageList
              messages={messages}
              language={language}
              onSpeak={handleSpeak}
              onStopSpeak={handleStopSpeak}
              currentlySpeakingId={currentlySpeakingId}
            />

            {/* Context-Aware Quick Actions */}
            <div className="mt-2">
              <QuickActions
                pageType={context.pageType}
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
            listeningPreview={listeningPreview}
            onToggleListening={handleToggleListening}
            config={liveConfig}
          />
        </div>
      )}

      {/* Human Live Help Modal */}
      <HumanHelpModal
        isOpen={showLiveHelp}
        onClose={() => setShowLiveHelp(false)}
        language={language}
        publicKey={publicKey}
        platformName={liveConfig?.platform_name || 'Savanna'}
        context={context}
        theme={liveConfig?.theme}
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
