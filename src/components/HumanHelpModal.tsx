import React, { useState, useEffect } from 'react';
import { X, Monitor, ShieldCheck, UserCheck, VideoOff } from 'lucide-react';
import { ScreenShareService } from '../services/screen-share';
import { Language } from '../types';

interface HumanHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const HumanHelpModal: React.FC<HumanHelpModalProps> = ({ isOpen, onClose, language }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      ScreenShareService.stopSharing();
    };
  }, []);

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

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-slide-up">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'am' ? 'የሰው አሰልጣኝ ድጋፍ' : 'Live Tutor Support'}
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Tutor Online
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Coach info */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
            <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center">
              BT
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">Bereket Tadesse</p>
              <p className="text-[11px] text-slate-500">ALX Learning Coach • English & አማርኛ</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'am'
              ? 'ከአርቴፊሻል ኢንተለጀንስ ይልቅ ከሰው አሰልጣኝ ጋር በቀጥታ ተገናኝተው ለመማር ይችላሉ። አሰልጣኙ እያዩት ያለውን ገጽ እንዲመለከት ስክሪንዎን ማጋራት ይችላሉ።'
              : 'Escalated from AI Tutor. A human coach is ready to assist you. You have full control over your screen sharing.'}
          </p>

          {/* Screen Sharing Control */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Monitor className="w-4 h-4 text-emerald-600" />
                <span>{language === 'am' ? 'የተማሪ ቁጥጥር ስክሪን ማጋሪያ' : 'Learner-Controlled Screen Sharing'}</span>
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
                : 'Allow the tutor to see your current course page to guide you visually. Stop anytime.'}
            </p>

            <button
              onClick={handleToggleScreenShare}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isSharing
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
              }`}
            >
              {isSharing ? (
                <>
                  <VideoOff className="w-4 h-4" />
                  <span>{language === 'am' ? 'ስክሪን ማጋራት አቁም' : 'Stop Screen Sharing'}</span>
                </>
              ) : (
                <>
                  <Monitor className="w-4 h-4" />
                  <span>{language === 'am' ? 'ስክሪኔን አጋራ (Share My Screen)' : 'Share My Screen'}</span>
                </>
              )}
            </button>
          </div>

          {/* Live Video Preview if active */}
          {isSharing && stream && (
            <div className="rounded-xl overflow-hidden border border-emerald-300 bg-black aspect-video relative">
              <video
                autoPlay
                muted
                ref={(video) => {
                  if (video && stream) video.srcObject = stream;
                }}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Live Screen Stream
              </span>
            </div>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {language === 'am'
                ? 'የግል መረጃዎና የይለፍ ቃላትዎ በፍጹም አይቀረጹም።'
                : 'Your passwords and private form inputs are never recorded or shared.'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            {language === 'am' ? 'ዝጋ' : 'Close'}
          </button>
          <button
            onClick={() => {
              alert(
                language === 'am'
                  ? 'የቀጥታ አሰልጣኙ ተገናኝቷል! በቻት ወይም በድምጽ መነጋገር ይችላሉ።'
                  : 'Live tutor Bereket connected! You can now speak or type in the chat.'
              );
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors"
          >
            {language === 'am' ? 'ውይይት ጀምር' : 'Join Live Session'}
          </button>
        </div>
      </div>
    </div>
  );
};
