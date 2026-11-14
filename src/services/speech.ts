import { Language } from '../types';

// ─── Web Speech API shim types ─────────────────────────────────────────────

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

// ─── SpeechService ──────────────────────────────────────────────────────────

export class SpeechService {
  private static recognition: SpeechRecognitionInstance | null = null;
  private static isSpeaking = false;

  // Active utterance ref — needed to work around Chrome's cancel() bug
  private static activeUtterance: SpeechSynthesisUtterance | null = null;
  private static activeOnEnd: (() => void) | null = null;

  // ── Speech-to-Text ────────────────────────────────────────────────────────

  static startListening(
    language: Language,
    onResult: (text: string) => void,
    onEnd: () => void
  ): boolean {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('[Meri] SpeechRecognition not supported in this browser.');
      return false;
    }

    // Abort any active session cleanly before starting a new one
    this._abortListening();

    try {
      const rec = new SpeechRec();
      this.recognition = rec;

      rec.lang = language === 'am' ? 'am-ET' : 'en-US';
      rec.continuous = false;      // stop after one utterance
      rec.interimResults = true;   // get interim so we can collect the best transcript
      rec.maxAlternatives = 1;

      // We collect the best transcript seen so far.
      // The browser keeps calling onresult with longer and longer transcripts
      // as it hears more words. We store the latest one and send it at the end.
      let bestTranscript = '';
      let resultSent = false;

      rec.onresult = (event: SpeechRecognitionEvent) => {
        // Always take the last result's first alternative — it is the most
        // complete transcript the browser has built so far this session.
        const lastResult = event.results[event.results.length - 1];
        const candidate = lastResult[0].transcript.trim();
        if (candidate) {
          bestTranscript = candidate;
        }

        // If the browser marks this segment as final we can send immediately
        // and prevent onend from sending again.
        if (lastResult.isFinal && bestTranscript && !resultSent) {
          resultSent = true;
          onResult(bestTranscript);
        }
      };

      rec.onerror = (event: Event) => {
        const errorType = (event as ErrorEvent).type;
        console.warn('[Meri] STT error:', errorType);
        // Don't call onEnd here — onend always fires after onerror too,
        // so we handle everything in onend to avoid double-calling.
      };

      rec.onend = () => {
        this.recognition = null;
        if (!resultSent) {
          // Browser ended without a final result — send whatever we collected
          // (interim transcript), or just call onEnd to reset the mic button.
          if (bestTranscript) {
            resultSent = true;
            onResult(bestTranscript);
          } else {
            onEnd();
          }
        } else {
          // Result was already sent — just reset listening state
          onEnd();
        }
      };

      rec.start();
      return true;
    } catch (err) {
      console.warn('[Meri] Error starting STT:', err);
      this.recognition = null;
      onEnd();
      return false;
    }
  }

  static stopListening(): void {
    this._abortListening();
  }

  private static _abortListening(): void {
    if (this.recognition) {
      try {
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.abort();
      } catch {
        // ignore — recognition may already be stopped
      }
      this.recognition = null;
    }
  }

  // ── Text-to-Speech ────────────────────────────────────────────────────────

  static speak(
    text: string,
    language: Language,
    rate = 1.0,
    onEnd?: () => void
  ): boolean {
    if (!('speechSynthesis' in window)) return false;

    // Cancel any in-progress speech and manually fire its onEnd so the UI
    // resets before we start the new utterance. Chrome's cancel() does NOT
    // reliably fire utterance.onend, so we do it ourselves.
    this._cancelSpeechAndNotify();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'am' ? 'am-ET' : 'en-US';
    utterance.rate = rate;

    const handleEnd = () => {
      if (this.activeUtterance === utterance) {
        this.activeUtterance = null;
        this.activeOnEnd = null;
        this.isSpeaking = false;
      }
      if (onEnd) onEnd();
    };

    utterance.onend = handleEnd;
    utterance.onerror = handleEnd;

    this.activeUtterance = utterance;
    this.activeOnEnd = onEnd ?? null;
    this.isSpeaking = true;

    window.speechSynthesis.speak(utterance);
    return true;
  }

  static stopSpeaking(): void {
    this._cancelSpeechAndNotify();
  }

  private static _cancelSpeechAndNotify(): void {
    if (!('speechSynthesis' in window)) return;

    // If there's a pending onEnd callback, call it now — Chrome's cancel()
    // won't fire utterance.onend, so the React state would stay stuck on
    // "Speaking..." without this.
    const pendingOnEnd = this.activeOnEnd;
    this.activeUtterance = null;
    this.activeOnEnd = null;
    this.isSpeaking = false;

    window.speechSynthesis.cancel();

    if (pendingOnEnd) {
      // Small delay so React batch update doesn't collide with cancel()
      setTimeout(pendingOnEnd, 50);
    }
  }

  static getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}
