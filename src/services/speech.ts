import { Language } from '../types';

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export class SpeechService {
  private static recognition: SpeechRecognitionInstance | null = null;
  private static isSpeaking = false;

  static startListening(
    language: Language,
    onResult: (text: string) => void,
    onEnd: () => void
  ): boolean {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('[Meri] Speech recognition not supported in this browser.');
      return false;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.lang = language === 'am' ? 'am-ET' : 'en-US';
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onResult(transcript);
        }
      };

      this.recognition.onerror = () => {
        onEnd();
      };

      this.recognition.onend = () => {
        onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('[Meri] Error starting speech recognition:', err);
      onEnd();
      return false;
    }
  }

  static stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  static speak(
    text: string,
    language: Language,
    rate = 1.0,
    onEnd?: () => void
  ): boolean {
    if (!('speechSynthesis' in window)) {
      return false;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'am' ? 'am-ET' : 'en-US';
    utterance.rate = rate;

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  static stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  static getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}
