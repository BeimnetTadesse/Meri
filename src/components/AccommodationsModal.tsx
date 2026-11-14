import React, { useState } from 'react';
import { X, Accessibility, Send, CheckCircle2, Phone, SendHorizontal } from 'lucide-react';
import { Language, PageContext } from '../types';

interface AccommodationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  context: PageContext;
}

export const AccommodationsModal: React.FC<AccommodationsModalProps> = ({
  isOpen,
  onClose,
  language,
  context,
}) => {
  const [translator, setTranslator] = useState(true);
  const [extraTime, setExtraTime] = useState(false);
  const [lowBandwidth, setLowBandwidth] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [phoneOrTelegram, setPhoneOrTelegram] = useState('+251 91 123 4567');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-slide-up">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              {language === 'am' ? 'የስራ ቃለ-መጠይቅ ድጋፍ መጠየቂያ' : 'Request Interview Accommodations'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            <h4 className="font-bold text-slate-900 text-base">
              {language === 'am' ? 'ጥያቄዎ በተሳካ ሁኔታ ተልኳል!' : 'Accommodation Request Submitted!'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              {language === 'am'
                ? 'አሰሪው ጥያቄዎን ተቀብሏል። የማረጋገጫ መልእክት በቴሌግራም/ኤስኤምኤስ ይደርስዎታል።'
                : 'The hiring team has received your accommodation requirements. Job alerts are activated.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
              <span className="font-bold text-emerald-900">
                {language === 'am' ? 'የስራ መደብ፡ ' : 'Target Role: '}
              </span>
              <span className="text-slate-700 font-semibold">{context.jobTitle || 'Junior Python Developer'}</span>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {context.company ? `at ${context.company}` : 'Partner Employer Network'}
              </p>
            </div>

            <p className="text-xs text-slate-600">
              {language === 'am'
                ? 'በቃለ-መጠይቁ ወቅት የሚያስፈልጉዎትን የቋንቋ እና የተደራሽነት ድጋፎች ይምረጡ። ይህ መረጃ እጩነትዎን አይጎዳውም።'
                : 'Select the accommodations you require for your interview and assessment. This ensures an equitable evaluation.'}
            </p>

            {/* Checkbox Options */}
            <div className="flex flex-col gap-2.5 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={translator}
                  onChange={(e) => setTranslator(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800">
                    {language === 'am' ? 'የአማርኛ ቋንቋ አስተርጓሚ' : 'Amharic Language Interpreter'}
                  </span>
                  <p className="text-[11px] text-slate-500">Live interpreter during technical interviews</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={extraTime}
                  onChange={(e) => setExtraTime(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800">
                    {language === 'am' ? 'ተጨማሪ የፈተና ጊዜ (50% Extra Time)' : 'Extended Assessment Time'}
                  </span>
                  <p className="text-[11px] text-slate-500">Flexible pacing for coding & written tasks</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={lowBandwidth}
                  onChange={(e) => setLowBandwidth(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800">
                    {language === 'am' ? 'በስልክ ወይም በድምጽ ብቻ የሚደረግ ቃለ-መጠይቅ' : 'Phone / Audio-Only Interview'}
                  </span>
                  <p className="text-[11px] text-slate-500">For slow or unstable internet connections</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={screenReader}
                  onChange={(e) => setScreenReader(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-800">
                    {language === 'am' ? 'ለስክሪን አንባቢ የተመቻቸ ቅርጸት' : 'Screen Reader / Accessible Format'}
                  </span>
                  <p className="text-[11px] text-slate-500">Accessible text tests with ARIA standards</p>
                </div>
              </label>

              {/* Career Gateway: Telegram / SMS Alerts */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={telegramAlerts}
                  onChange={(e) => setTelegramAlerts(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-purple-900 flex items-center gap-1">
                    <SendHorizontal className="w-3.5 h-3.5" />
                    <span>{language === 'am' ? 'በቴሌግራም/ኤስኤምኤስ የስራ ማስታወቂያ ይድረሰኝ' : 'Telegram & SMS Job Alerts'}</span>
                  </span>
                  <p className="text-[11px] text-slate-500">Receive matched job alerts and interview status</p>
                </div>
              </label>
            </div>

            {/* Telegram handle or Phone input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {language === 'am' ? 'ስልክ ቁጥር ወይም ቴሌግራም መለያ (@username)' : 'Phone Number or Telegram Handle'}
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-emerald-500">
                <Phone className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={phoneOrTelegram}
                  onChange={(e) => setPhoneOrTelegram(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-slate-900 focus:outline-none"
                  placeholder="+251 9... or @username"
                />
              </div>
            </div>

            {/* Additional notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {language === 'am' ? 'ተጨማሪ ማስታወሻ (አማራጭ)' : 'Additional Notes (Optional)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={
                  language === 'am'
                    ? 'ሌላ የሚፈልጉትን ልዩ ድጋፍ እዚህ ይግለጹ...'
                    : 'Describe any specific accessibility or equipment needs...'
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {language === 'am' ? 'ተመለስ' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'am' ? 'ጥያቄውን ላክ' : 'Submit to Employer'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
