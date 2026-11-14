import { Language } from '../types';

// ─── Web Speech API shim types ──────────────────────────────────────────────

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: { readonly transcript: string };
}

interface SpeechRecognitionResultList {
  readonly length: number;
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
  private static isListeningActive = false;

  // ── Speech-to-Text ────────────────────────────────────────────────────────

  /**
   * Start listening for speech.
   * - Collects words into a complete sentence while the user speaks.
   * - onInterim(liveText) gives real-time visual feedback.
   * - onResult(fullSentence) is called EXACTLY ONCE when speech concludes.
   * - onEnd() is called when the listening session finishes to reset UI.
   */
  static startListening(
    language: Language,
    onResult: (text: string) => void,
    onEnd: () => void,
    onInterim?: (text: string) => void
  ): boolean {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('[Meri] SpeechRecognition not supported in this browser.');
      return false;
    }

    // Stop any existing session
    this.stopListening();

    try {
      const rec = new SpeechRec();
      this.recognition = rec;
      this.isListeningActive = true;

      rec.lang = language === 'am' ? 'am-ET' : 'en-US';
      rec.continuous = false;     // auto-stop after user pauses
      rec.interimResults = true;  // enable live transcript accumulation

      let finalAccumulated = '';
      let bestSeenText = '';
      let hasDispatched = false;

      rec.onresult = (event: SpeechRecognitionEvent) => {
        let interimText = '';
        let fullSessionText = '';

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          const transcript = item[0]?.transcript || '';
          fullSessionText += transcript;

          if (item.isFinal) {
            finalAccumulated += transcript;
          } else {
            interimText += transcript;
          }
        }

        bestSeenText = (finalAccumulated || fullSessionText || interimText).trim();

        if (onInterim && bestSeenText) {
          onInterim(bestSeenText);
        }
      };

      rec.onerror = (e: Event) => {
        const errorMsg = (e as ErrorEvent).message || e.type;
        console.warn('[Meri] STT error event:', errorMsg);
      };

      rec.onend = () => {
        this.recognition = null;
        this.isListeningActive = false;

        if (!hasDispatched) {
          hasDispatched = true;
          const textToSend = (finalAccumulated || bestSeenText).trim();
          if (textToSend) {
            onResult(textToSend);
          }
        }
        onEnd();
      };

      rec.start();
      return true;
    } catch (err) {
      console.warn('[Meri] Could not start STT:', err);
      this.recognition = null;
      this.isListeningActive = false;
      onEnd();
      return false;
    }
  }

  /**
   * User manually clicks the mic button to finish speaking early.
   * Calls rec.stop() to let the recognizer finalize and fire onend with the transcript.
   */
  static stopListening(): void {
    if (this.recognition && this.isListeningActive) {
      this.isListeningActive = false;
      try {
        this.recognition.stop();
      } catch {
        try {
          this.recognition.abort();
        } catch {
          // ignore
        }
      }
    }
  }

  // ── Text-to-Speech ────────────────────────────────────────────────────────

  /**
   * Speak text aloud.
   * Resumes any paused synthesis state before starting.
   */
  static speak(
    text: string,
    language: Language,
    rate = 1.0,
    onEnd?: () => void
  ): boolean {
    if (!('speechSynthesis' in window)) return false;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'am' ? 'am-ET' : 'en-US';
    utterance.rate = rate;

    let hasEnded = false;
    const finish = () => {
      if (!hasEnded) {
        hasEnded = true;
        if (onEnd) onEnd();
      }
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    try {
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('[Meri] TTS speak error:', e);
      finish();
      return false;
    }
  }

  /**
   * Stop speaking immediately.
   */
  static stopSpeaking(): void {
    if (!('speechSynthesis' in window)) return;
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('[Meri] TTS cancel error:', e);
    }
  }
}
