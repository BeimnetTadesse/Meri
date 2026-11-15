import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Monitor,
  ShieldCheck,
  UserCheck,
  VideoOff,
  Send,
  Clock,
  CheckCircle2,
  PhoneOff,
  Loader2,
  Headphones,
} from 'lucide-react';
import { ScreenShareService } from '../services/screen-share';
import { Language, PageContext, PlatformConfig } from '../types';
import { getApiBaseUrl } from '../core/configuration';

interface SupportMessageData {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
}

interface SupportTicketData {
  id: string;
  platform_id: string;
  learner_id: string;
  subject: string;
  status: string;
  consent_share_history: boolean;
  screen_sharing_active: boolean;
  created_at: string;
  learner_name?: string;
  platform_name?: string;
  messages: SupportMessageData[];
}

interface HumanHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  publicKey?: string;
  platformName?: string;
  context?: PageContext;
  theme?: PlatformConfig['theme'];
}

type ViewState = 'request' | 'waiting' | 'chat' | 'resolved';

export const HumanHelpModal: React.FC<HumanHelpModalProps> = ({
  isOpen,
  onClose,
  language,
  publicKey,
  platformName = 'Savanna',
  context,
  theme,
}) => {
  const [viewState, setViewState] = useState<ViewState>('request');
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Request form state
  const [learnerName, setLearnerName] = useState('Learner');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active ticket & live chat state
  const [activeTicket, setActiveTicket] = useState<SupportTicketData | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const pollIntervalRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const primaryColor = theme?.primary || '#16A34A';

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      stopPolling();
      ScreenShareService.stopSharing();
    };
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Scroll messages to bottom
  useEffect(() => {
    if (viewState === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTicket?.messages, viewState]);

  if (!isOpen) return null;

  const handleToggleScreenShare = async () => {
    if (isSharing) {
      ScreenShareService.stopSharing();
      setIsSharing(false);
      setStream(null);
    } else {
      const activeStream = await ScreenShareService.startSharing(
        () => {
          setIsSharing(false);
          setStream(null);
        },
        (err) => {
          console.warn('[Meri] Screen share error:', err);
          setIsSharing(false);
          setStream(null);
        }
      );

      if (activeStream) {
        setIsSharing(true);
        setStream(activeStream);
      }
    }
  };

  // 1. Submit human assistance request
  const handleRequestLiveHelp = async () => {
    setIsSubmitting(true);
    const apiBase = getApiBaseUrl();

    const subjectText = question.trim()
      ? question.slice(0, 100)
      : `Live Assistance on ${context?.title || 'Course Lesson'}`;

    const payload = {
      subject: subjectText,
      initial_message: question.trim() || 'Hello, I would like live assistance from a tutor regarding my lesson.',
      consent_share_history: true,
      screen_sharing_active: isSharing,
      public_key: publicKey || 'pk_live_savanna_sample_12345',
      learner_name: learnerName.trim() || 'Learner',
      page_context: context?.title || window.location.pathname,
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (publicKey) headers['X-Public-Key'] = publicKey;

      const res = await fetch(`${apiBase}/api/v1/support/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const ticket: SupportTicketData = await res.json();
        setActiveTicket(ticket);
        setViewState('waiting');

        // Start polling for tutor acceptance
        startPolling(ticket.id);
      } else {
        alert(language === 'am' ? 'እባክዎ እንደገና ይሞክሩ' : 'Failed to connect. Please try again.');
      }
    } catch (err) {
      console.error('[Meri] Live help request error:', err);
      alert(language === 'am' ? 'የግንኙነት ችግር ተፈጥሯል' : 'Network error connecting to support server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Poll ticket for status updates and messages
  const startPolling = (ticketId: string) => {
    stopPolling();
    const apiBase = getApiBaseUrl();

    pollIntervalRef.current = window.setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/api/v1/support/tickets/${ticketId}`, {
          cache: 'no-store',
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          const updated: SupportTicketData = await res.json();
          setActiveTicket(updated);

          // If tutor accepted, transition to live chat
          if (updated.status === 'in_progress') {
            setViewState((current) => (current === 'waiting' ? 'chat' : current));
          } else if (updated.status === 'resolved' || updated.status === 'closed') {
            setViewState('resolved');
            stopPolling();
          }
        }
      } catch (err) {
        console.warn('[Meri] Support ticket poll error:', err);
      }
    }, 2000);
  };

  // 3. Send message during live chat
  const handleSendMessage = async () => {
    if (!activeTicket || !chatInput.trim() || isSendingMsg) return;

    const content = chatInput.trim();
    setChatInput('');
    setIsSendingMsg(true);

    const apiBase = getApiBaseUrl();

    // Optimistically append message
    const tempMsg: SupportMessageData = {
      id: `temp-${Date.now()}`,
      ticket_id: activeTicket.id,
      sender_id: activeTicket.learner_id,
      sender_role: 'learner',
      content,
      created_at: new Date().toISOString(),
    };

    setActiveTicket((prev) =>
      prev ? { ...prev, messages: [...prev.messages, tempMsg] } : null
    );

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (publicKey) headers['X-Public-Key'] = publicKey;

      await fetch(`${apiBase}/api/v1/support/tickets/${activeTicket.id}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content }),
      });

      // Immediate refresh
      const res = await fetch(`${apiBase}/api/v1/support/tickets/${activeTicket.id}`);
      if (res.ok) {
        const refreshed = await res.json();
        setActiveTicket(refreshed);
      }
    } catch (e) {
      console.warn('[Meri] Error posting support message:', e);
    } finally {
      setIsSendingMsg(false);
    }
  };

  // 4. Cancel / End session
  const handleEndSession = async () => {
    if (!activeTicket) {
      onClose();
      return;
    }

    if (
      !confirm(
        language === 'am'
          ? 'የቀጥታ ውይይቱን ማጠናቀቅ ይፈልጋሉ?'
          : 'Are you sure you want to conclude this live tutor session?'
      )
    ) {
      return;
    }

    const apiBase = getApiBaseUrl();
    try {
      await fetch(`${apiBase}/api/v1/support/tickets/${activeTicket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
    } catch (e) {
      console.warn(e);
    }
    stopPolling();
    setViewState('resolved');
  };

  const handleModalClose = () => {
    stopPolling();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-slide-up">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* MODAL HEADER */}
        <div
          className="px-5 py-4 text-white flex items-center justify-between border-b border-black/10 shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {language === 'am' ? 'የሰው አሰልጣኝ የቀጥታ ድጋፍ' : `${platformName} Live Tutor Support`}
                </h3>
                {viewState === 'chat' ? (
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-300 animate-ping"></span>
                    Live Connected
                  </span>
                ) : viewState === 'waiting' ? (
                  <span className="bg-amber-400/30 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    Queued
                  </span>
                ) : (
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Tutors Available
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/80">
                {language === 'am'
                  ? 'ከመድረኩ አሰልጣኞች ጋር በቀጥታ ይገናኙ'
                  : `Real-time human guidance for ${platformName} learners`}
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCREEN 1: REQUEST FORM */}
        {viewState === 'request' && (
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Tutor banner */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div
                className="w-11 h-11 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                SA
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  {platformName} Academic Support Team
                </p>
                <p className="text-[11px] text-slate-500">
                  Certified Instructors • English & አማርኛ
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'am'
                ? 'በዚህ ትምህርት ወይም በኮዲንግ ላይ ተጨማሪ ማብራሪያ ከፈለጉ፣ የሰው አሰልጣኝ በቀጥታ ሊያግዝዎት ዝግጁ ነው። ጥያቄዎን ይጻፉና እርዳታ ይጠይቁ።'
                : 'Need deeper 1-on-1 explanation than AI? Escalate to a live human instructor from Savanna LMS. You will be connected as soon as a tutor accepts.'}
            </p>

            {/* Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'የእርስዎ ስም' : 'Your Name'}
                </label>
                <input
                  type="text"
                  value={learnerName}
                  onChange={(e) => setLearnerName(e.target.value)}
                  placeholder="e.g. Bereket T."
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'am' ? 'የጥያቄዎ ወይም የችግሩ ዝርዝር' : 'What do you need help with?'}
                </label>
                <textarea
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={
                    language === 'am'
                      ? 'ለምሳሌ፡ የዛሬውን የፓይዘን መልመጃ አልተረዳሁትም...'
                      : 'e.g. I am stuck on the Python recursion exercise in Lesson 2...'
                  }
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                />
              </div>
            </div>

            {/* Screen Sharing Toggle */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <Monitor className="w-4 h-4 text-emerald-600" />
                  <span>
                    {language === 'am'
                      ? 'የስክሪን ማጋራት (አማራጭ)'
                      : 'Learner Screen Sharing (Optional)'}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSharing ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isSharing ? 'Active' : 'Off'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                {language === 'am'
                  ? 'አሰልጣኙ የትምህርት ገጽዎን አይተው እንዲያግዙዎት ይፈቅዳል። በማንኛውም ሰአት ማቆም ይችላሉ።'
                  : 'Allow the tutor to see your current course screen to assist visually. You can toggle it off anytime.'}
              </p>

              <button
                onClick={handleToggleScreenShare}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isSharing
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs'
                }`}
              >
                {isSharing ? (
                  <>
                    <VideoOff className="w-4 h-4" />
                    <span>{language === 'am' ? 'ስክሪን ማጋራት አቁም' : 'Stop Screen Share'}</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'am' ? 'ስክሪን አጋራ' : 'Enable Screen Share'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {language === 'am'
                  ? 'የይለፍ ቃላትና የግል መረጃ በፍጹም አይቀረጹም።'
                  : 'Zero credentials recorded. You maintain complete control over the call.'}
              </span>
            </div>

            {/* Request Button */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={handleModalClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                {language === 'am' ? 'ተመለስ' : 'Cancel'}
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleRequestLiveHelp}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2 transition hover:opacity-90"
                style={{ backgroundColor: primaryColor }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>{language === 'am' ? 'የቀጥታ እርዳታ ጠይቅ' : 'Request Live Tutor Help'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 2: WAITING STATE */}
        {viewState === 'waiting' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            {/* Animated Beacon Ring */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-emerald-100 animate-ping opacity-60 absolute"></div>
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center relative shadow-inner">
                <Clock className="w-9 h-9 text-emerald-600 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <h4 className="font-bold text-slate-900 text-base sm:text-lg">
                {language === 'am'
                  ? 'የአሰልጣኝ ምላሽ በመጠበቅ ላይ...'
                  : 'Waiting for Savanna Platform Advisor...'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {language === 'am'
                  ? 'ጥያቄዎ ወደ ሳቫና አሰልጣኞች ቡድን ደርሷል። አሰልጣኙ ጥሪዎን ሲቀበል የቀጥታ ቻቱ ወዲያውኑ ይከፈታል። እባክዎ ይህን መስኮት አይዝጉት።'
                  : `Your request has been routed to the ${platformName} instructor team. Please keep this modal open; the live chat will start automatically once an advisor accepts.`}
              </p>
              {activeTicket && (
                <div className="text-[11px] font-mono text-slate-400 bg-slate-50 py-1 px-3 rounded-lg border border-slate-200 inline-block mt-2">
                  Session #{activeTicket.id.slice(0, 8)}
                </div>
              )}
            </div>

            <div className="w-full pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
              <button
                onClick={handleEndSession}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                {language === 'am' ? 'ጥሪውን ሰርዝ' : 'Cancel Request'}
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 3: LIVE 2-WAY CHAT */}
        {viewState === 'chat' && (
          <div className="flex-1 flex flex-col min-h-[380px] overflow-hidden">
            {/* Connected Bar */}
            <div className="bg-emerald-50/70 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold">
                  {language === 'am'
                    ? 'ከአሰልጣኝ ጋር ተገናኝተዋል'
                    : `Live Tutor Connected (${platformName})`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleScreenShare}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition ${
                    isSharing
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isSharing ? 'Screen On' : 'Share Screen'}</span>
                </button>
                <button
                  onClick={handleEndSession}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 shadow-xs transition"
                >
                  <PhoneOff className="w-3 h-3" />
                  <span>{language === 'am' ? 'ጨርስ' : 'End Call'}</span>
                </button>
              </div>
            </div>

            {/* Screen video preview if sharing */}
            {isSharing && stream && (
              <div className="bg-black aspect-video max-h-36 relative border-b border-slate-300 overflow-hidden shrink-0">
                <video
                  autoPlay
                  muted
                  ref={(v) => {
                    if (v && stream) v.srcObject = stream;
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Live Screen Stream
                </span>
              </div>
            )}

            {/* Chat Messages Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 max-h-[340px]">
              {/* Welcome banner */}
              <div className="text-center my-2">
                <span className="text-[11px] bg-slate-200/80 text-slate-600 px-3 py-1 rounded-full font-medium">
                  {language === 'am'
                    ? 'የቀጥታ ውይይቱ ተጀምሯል'
                    : 'Advisor joined session. Type your questions below.'}
                </span>
              </div>

              {activeTicket?.messages.map((m) => {
                const isStudent = m.sender_role === 'learner';
                const timeStr = new Date(m.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5 px-1">
                      <span
                        className={`font-semibold ${
                          isStudent ? 'text-slate-700' : 'text-emerald-700'
                        }`}
                      >
                        {isStudent
                          ? `${learnerName} (You)`
                          : `${platformName} Platform Advisor`}
                      </span>
                      <span>•</span>
                      <span>{timeStr}</span>
                    </div>
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isStudent
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  language === 'am'
                    ? 'ለአሰልጣኙ መልዕክት ይጻፉ...'
                    : 'Type a message to tutor... (Press Enter)'
                }
                className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <button
                disabled={isSendingMsg || !chatInput.trim()}
                onClick={handleSendMessage}
                className="h-10 px-4 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {language === 'am' ? 'ላክ' : 'Send'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: RESOLVED */}
        {viewState === 'resolved' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-base">
                {language === 'am' ? 'የቀጥታ ውይይቱ ተጠናቋል' : 'Live Session Completed'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                {language === 'am'
                  ? 'ከሳቫና አሰልጣኝ ጋር ስለተማሩ እናመሰግናለን። ጥያቄ ካለዎት በማንኛውም ሰአት መጠየቅ ይችላሉ።'
                  : 'Thank you for learning with Savanna. You can return to your lesson or start a new inquiry anytime.'}
              </p>
            </div>
            <button
              onClick={handleModalClose}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              {language === 'am' ? 'ጨርስና ዝጋ' : 'Close and Return'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
